-- Cosmic Typing Adventure Database Schema
-- Version: 1.0.0
-- Created: 2024-01-01

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Typing sessions table
CREATE TABLE IF NOT EXISTS typing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    planet VARCHAR(20) NOT NULL,
    wpm DECIMAL(5,2) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    total_typed INTEGER NOT NULL,
    total_errors INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in milliseconds
    session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    text_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice texts table
CREATE TABLE IF NOT EXISTS practice_texts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_id VARCHAR(50) UNIQUE NOT NULL,
    planet VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    word_count INTEGER NOT NULL,
    char_count INTEGER NOT NULL,
    language VARCHAR(10) DEFAULT 'ja',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    criteria JSONB NOT NULL,
    icon_url VARCHAR(255),
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Statistics table for caching
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    planet VARCHAR(20),
    total_sessions INTEGER DEFAULT 0,
    total_typed INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    avg_wpm DECIMAL(5,2) DEFAULT 0,
    avg_accuracy DECIMAL(5,2) DEFAULT 0,
    best_wpm DECIMAL(5,2) DEFAULT 0,
    best_accuracy DECIMAL(5,2) DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- in milliseconds
    last_session_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, planet)
);

-- Global statistics table
CREATE TABLE IF NOT EXISTS global_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_name VARCHAR(100) UNIQUE NOT NULL,
    stat_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_typing_sessions_user_id ON typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_planet ON typing_sessions(planet);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_session_date ON typing_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_practice_texts_planet ON practice_texts(planet);
CREATE INDEX IF NOT EXISTS idx_practice_texts_difficulty ON practice_texts(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_planet ON user_statistics(planet);

-- Create indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferences ON user_preferences USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_achievements_criteria ON achievements USING GIN (criteria);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_texts_updated_at BEFORE UPDATE ON practice_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_statistics(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Calculate overall statistics
    INSERT INTO user_statistics (user_id, planet, total_sessions, total_typed, total_errors, 
                                avg_wpm, avg_accuracy, best_wpm, best_accuracy, total_time, last_session_date)
    SELECT 
        p_user_id,
        planet,
        COUNT(*) as total_sessions,
        SUM(total_typed) as total_typed,
        SUM(total_errors) as total_errors,
        AVG(wpm) as avg_wpm,
        AVG(accuracy) as avg_accuracy,
        MAX(wpm) as best_wpm,
        MAX(accuracy) as best_accuracy,
        SUM(duration) as total_time,
        MAX(session_date) as last_session_date
    FROM typing_sessions
    WHERE user_id = p_user_id
    GROUP BY planet
    ON CONFLICT (user_id, planet) DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_typed = EXCLUDED.total_typed,
        total_errors = EXCLUDED.total_errors,
        avg_wpm = EXCLUDED.avg_wpm,
        avg_accuracy = EXCLUDED.avg_accuracy,
        best_wpm = EXCLUDED.best_wpm,
        best_accuracy = EXCLUDED.best_accuracy,
        total_time = EXCLUDED.total_time,
        last_session_date = EXCLUDED.last_session_date,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to check achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
    criteria_met BOOLEAN;
BEGIN
    -- Get user statistics
    SELECT 
        SUM(total_sessions) as total_sessions,
        SUM(total_typed) as total_typed,
        MAX(best_wpm) as best_wpm,
        MAX(best_accuracy) as best_accuracy
    INTO user_stats
    FROM user_statistics
    WHERE user_id = p_user_id;
    
    -- Check each achievement
    FOR achievement_record IN 
        SELECT * FROM achievements WHERE is_active = TRUE
    LOOP
        -- Check if user already has this achievement
        IF NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_id = p_user_id AND achievement_id = achievement_record.id
        ) THEN
            -- Check if criteria are met (simplified logic)
            criteria_met := FALSE;
            
            -- Example criteria checking (would need to be expanded based on actual criteria structure)
            IF achievement_record.criteria->>'type' = 'first_session' AND user_stats.total_sessions > 0 THEN
                criteria_met := TRUE;
            ELSIF achievement_record.criteria->>'type' = 'speed_master' AND user_stats.best_wpm >= (achievement_record.criteria->>'min_wpm')::DECIMAL THEN
                criteria_met := TRUE;
            ELSIF achievement_record.criteria->>'type' = 'accuracy_master' AND user_stats.best_accuracy >= (achievement_record.criteria->>'min_accuracy')::DECIMAL THEN
                criteria_met := TRUE;
            END IF;
            
            -- Award achievement if criteria met
            IF criteria_met THEN
                INSERT INTO user_achievements (user_id, achievement_id)
                VALUES (p_user_id, achievement_record.id);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update statistics when new session is added
CREATE OR REPLACE FUNCTION trigger_update_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user statistics
    PERFORM calculate_user_statistics(NEW.user_id);
    
    -- Check for new achievements
    PERFORM check_achievements(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_typing_session_statistics
    AFTER INSERT ON typing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_statistics();

-- Insert default achievements
INSERT INTO achievements (name, description, criteria, points) VALUES
('First Steps', 'Complete your first typing session', '{"type": "first_session"}', 10),
('Speed Demon', 'Achieve 100+ WPM', '{"type": "speed_master", "min_wpm": 100}', 50),
('Accuracy Master', 'Achieve 99%+ accuracy', '{"type": "accuracy_master", "min_accuracy": 99}', 50),
('Planet Explorer', 'Practice on all 4 planets', '{"type": "planet_explorer", "planets": ["earth", "mars", "jupiter", "saturn"]}', 100),
('Consistency Master', 'Complete 30 sessions', '{"type": "consistency_master", "min_sessions": 30}', 75),
('Marathon Runner', 'Complete a 10-minute session', '{"type": "marathon_runner", "min_duration": 600000}', 25)
ON CONFLICT (name) DO NOTHING;

-- Insert sample practice texts
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count) VALUES
('earth_001', 'earth', '地球の基本情報', '地球は太陽系の第三惑星です。生命が存在する唯一の惑星として知られています。', 1, 25, 50),
('earth_002', 'earth', '美しい青い惑星', '私たちの故郷である地球は、美しい青い惑星です。海と陸地が調和した姿は、宇宙から見ると特別な存在です。', 1, 35, 70),
('mars_001', 'mars', '赤い惑星', '火星は太陽系の第四惑星で、赤い惑星として知られています。', 2, 20, 40),
('mars_002', 'mars', '火星の表面', '火星の表面には、かつて水が流れていた痕跡が残されています。', 2, 25, 50),
('jupiter_001', 'jupiter', '太陽系最大の惑星', '木星は太陽系最大の惑星で、ガス惑星の代表的な存在です。', 3, 25, 50),
('jupiter_002', 'jupiter', '大赤斑', '木星の大赤斑は、数百年にわたって続いている巨大な嵐です。', 3, 25, 50),
('saturn_001', 'saturn', '美しい環を持つ惑星', '土星は美しい環を持つ惑星として、天文学者たちを魅了し続けています。', 4, 30, 60),
('saturn_002', 'saturn', '土星の環', '土星の環は、無数の氷の粒子で構成されており、太陽の光を反射して輝きます。', 4, 35, 70)
ON CONFLICT (text_id) DO NOTHING;

-- Insert initial global statistics
INSERT INTO global_statistics (stat_name, stat_value) VALUES
('total_users', '0'),
('total_sessions', '0'),
('total_typed', '0'),
('avg_wpm', '0'),
('avg_accuracy', '0'),
('most_popular_planet', '"earth"'),
('top_speed', '0'),
('top_accuracy', '0')
ON CONFLICT (stat_name) DO NOTHING; 