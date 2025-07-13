-- Cosmic Typing Adventure Supabase Schema & Initial Data
-- Version: 1.0.0
-- Created: 2024-01-01

-- Enable pgcrypto for UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- TABLES
-- =====================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS typing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    planet VARCHAR(20) NOT NULL,
    wpm DECIMAL(5,2) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    total_typed INTEGER NOT NULL,
    total_errors INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- ms
    session_date TIMESTAMPTZ DEFAULT now(),
    text_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS practice_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_id VARCHAR(50) UNIQUE NOT NULL,
    planet VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    word_count INTEGER NOT NULL,
    char_count INTEGER NOT NULL,
    language VARCHAR(10) DEFAULT 'ja',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    criteria JSONB NOT NULL,
    icon_url VARCHAR(255),
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    planet VARCHAR(20),
    total_sessions INTEGER DEFAULT 0,
    total_typed INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    avg_wpm DECIMAL(5,2) DEFAULT 0,
    avg_accuracy DECIMAL(5,2) DEFAULT 0,
    best_wpm DECIMAL(5,2) DEFAULT 0,
    best_accuracy DECIMAL(5,2) DEFAULT 0,
    total_time INTEGER DEFAULT 0, -- ms
    last_session_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, planet)
);

CREATE TABLE IF NOT EXISTS global_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_name VARCHAR(100) UNIQUE NOT NULL,
    stat_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX IF NOT EXISTS idx_typing_sessions_user_id ON typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_planet ON typing_sessions(planet);
CREATE INDEX IF NOT EXISTS idx_typing_sessions_session_date ON typing_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_practice_texts_planet ON practice_texts(planet);
CREATE INDEX IF NOT EXISTS idx_practice_texts_difficulty ON practice_texts(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_planet ON user_statistics(planet);
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferences ON user_preferences USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_achievements_criteria ON achievements USING GIN (criteria);

-- =====================
-- TRIGGERS & FUNCTIONS
-- =====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_practice_texts_updated_at BEFORE UPDATE ON practice_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION calculate_user_statistics(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
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
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
    criteria_met BOOLEAN;
BEGIN
    SELECT 
        SUM(total_sessions) as total_sessions,
        SUM(total_typed) as total_typed,
        MAX(best_wpm) as best_wpm,
        MAX(best_accuracy) as best_accuracy
    INTO user_stats
    FROM user_statistics
    WHERE user_id = p_user_id;
    FOR achievement_record IN 
        SELECT * FROM achievements WHERE is_active = TRUE
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_id = p_user_id AND achievement_id = achievement_record.id
        ) THEN
            criteria_met := FALSE;
            IF achievement_record.criteria->>'type' = 'first_session' AND user_stats.total_sessions > 0 THEN
                criteria_met := TRUE;
            ELSIF achievement_record.criteria->>'type' = 'speed_master' AND user_stats.best_wpm >= (achievement_record.criteria->>'min_wpm')::DECIMAL THEN
                criteria_met := TRUE;
            ELSIF achievement_record.criteria->>'type' = 'accuracy_master' AND user_stats.best_accuracy >= (achievement_record.criteria->>'min_accuracy')::DECIMAL THEN
                criteria_met := TRUE;
            END IF;
            IF criteria_met THEN
                INSERT INTO user_achievements (user_id, achievement_id)
                VALUES (p_user_id, achievement_record.id);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_statistics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_user_statistics(NEW.user_id);
    PERFORM check_achievements(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_typing_session_statistics
    AFTER INSERT ON typing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_statistics();

-- =====================
-- INITIAL DATA
-- =====================

-- Achievements
INSERT INTO achievements (name, description, criteria, points) VALUES
('First Steps', 'Complete your first typing session', '{"type": "first_session"}', 10),
('Speed Demon', 'Achieve 100+ WPM', '{"type": "speed_master", "min_wpm": 100}', 50),
('Accuracy Master', 'Achieve 99%+ accuracy', '{"type": "accuracy_master", "min_accuracy": 99}', 50),
('Planet Explorer', 'Practice on all 4 planets', '{"type": "planet_explorer", "planets": ["earth", "mars", "jupiter", "saturn"]}', 100)
ON CONFLICT (name) DO NOTHING;

-- Sample users
INSERT INTO users (username, email, preferences) VALUES
('testuser1', 'test1@example.com', '{"defaultPlanet": "earth", "theme": "cosmic", "soundEnabled": true}'),
('testuser2', 'test2@example.com', '{"defaultPlanet": "mars", "theme": "cosmic", "soundEnabled": false}'),
('demo_user', 'demo@example.com', '{"defaultPlanet": "jupiter", "theme": "cosmic", "soundEnabled": true}')
ON CONFLICT (username) DO NOTHING;

-- Sample typing sessions
INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT u.id, 'earth', 45.5, 95.2, 150, 7, 120000, 'earth_001' FROM users u WHERE u.username = 'testuser1' ON CONFLICT DO NOTHING;
INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT u.id, 'mars', 52.3, 92.8, 180, 13, 135000, 'mars_002' FROM users u WHERE u.username = 'testuser1' ON CONFLICT DO NOTHING;
INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT u.id, 'jupiter', 38.7, 88.5, 220, 25, 180000, 'jupiter_003' FROM users u WHERE u.username = 'testuser2' ON CONFLICT DO NOTHING;
INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT u.id, 'saturn', 35.2, 85.1, 280, 42, 240000, 'saturn_001' FROM users u WHERE u.username = 'demo_user' ON CONFLICT DO NOTHING;

-- Practice texts (一部例)
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count) VALUES
('earth_003', 'earth', '地球の大気', '地球の大気は主に窒素と酸素で構成されており、生命を支える重要な役割を果たしています。', 1, 30, 60),
('earth_004', 'earth', '地球の自転', '地球は約24時間で自転しており、これにより昼と夜が生まれます。', 1, 20, 40),
('earth_005', 'earth', '地球の公転', '地球は約365日で太陽の周りを公転しており、これにより四季が生まれます。', 1, 25, 50)
ON CONFLICT (text_id) DO NOTHING;

-- User preferences
INSERT INTO user_preferences (user_id, preferences) 
SELECT u.id, '{"defaultPlanet": "earth", "theme": "cosmic", "soundEnabled": true, "showProgress": true, "autoSave": true}' FROM users u WHERE u.username = 'testuser1' ON CONFLICT (user_id) DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = now();
INSERT INTO user_preferences (user_id, preferences) 
SELECT u.id, '{"defaultPlanet": "mars", "theme": "cosmic", "soundEnabled": false, "showProgress": true, "autoSave": true}' FROM users u WHERE u.username = 'testuser2' ON CONFLICT (user_id) DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = now();
INSERT INTO user_preferences (user_id, preferences) 
SELECT u.id, '{"defaultPlanet": "jupiter", "theme": "cosmic", "soundEnabled": true, "showProgress": true, "autoSave": true}' FROM users u WHERE u.username = 'demo_user' ON CONFLICT (user_id) DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = now();

-- User achievements
INSERT INTO user_achievements (user_id, achievement_id)
SELECT u.id, a.id FROM users u, achievements a WHERE u.username = 'testuser1' AND a.name = 'First Steps' ON CONFLICT DO NOTHING;
INSERT INTO user_achievements (user_id, achievement_id)
SELECT u.id, a.id FROM users u, achievements a WHERE u.username = 'testuser2' AND a.name IN ('First Steps', 'Planet Explorer') ON CONFLICT DO NOTHING;

-- Global statistics (例)
INSERT INTO global_statistics (stat_name, stat_value) VALUES
('total_users', '3'),
('total_sessions', '4'),
('total_typed', '830'),
('avg_wpm', '42.9'),
('avg_accuracy', '90.4'),
('top_speed', '52.3'),
('top_accuracy', '95.2')
ON CONFLICT (stat_name) DO UPDATE SET stat_value = EXCLUDED.stat_value, updated_at = now();

-- =====================
-- VIEWS
-- =====================

CREATE OR REPLACE VIEW user_overall_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(ts.id) as total_sessions,
    SUM(ts.total_typed) as total_typed,
    SUM(ts.total_errors) as total_errors,
    AVG(ts.wpm) as avg_wpm,
    AVG(ts.accuracy) as avg_accuracy,
    MAX(ts.wpm) as best_wpm,
    MAX(ts.accuracy) as best_accuracy,
    SUM(ts.duration) as total_time
FROM users u
LEFT JOIN typing_sessions ts ON u.id = ts.user_id
GROUP BY u.id, u.username;

CREATE OR REPLACE VIEW planet_stats AS
SELECT 
    planet,
    COUNT(*) as total_sessions,
    AVG(wpm) as avg_wpm,
    AVG(accuracy) as avg_accuracy,
    MAX(wpm) as best_wpm,
    MAX(accuracy) as best_accuracy,
    SUM(total_typed) as total_typed,
    SUM(total_errors) as total_errors
FROM typing_sessions
GROUP BY planet;

CREATE OR REPLACE VIEW recent_sessions AS
SELECT 
    ts.id,
    u.username,
    ts.planet,
    ts.wpm,
    ts.accuracy,
    ts.total_typed,
    ts.total_errors,
    ts.duration,
    ts.session_date,
    pt.title as text_title
FROM typing_sessions ts
JOIN users u ON ts.user_id = u.id
LEFT JOIN practice_texts pt ON ts.text_id = pt.text_id
ORDER BY ts.session_date DESC
LIMIT 50;

-- =====================
-- FUNCTIONS (for API/analytics)
-- =====================

CREATE OR REPLACE FUNCTION get_user_progress(p_user_id UUID)
RETURNS TABLE(
    planet VARCHAR(20),
    sessions INTEGER,
    avg_wpm DECIMAL(5,2),
    avg_accuracy DECIMAL(5,2),
    best_wpm DECIMAL(5,2),
    best_accuracy DECIMAL(5,2),
    total_typed INTEGER,
    total_errors INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.planet,
        COUNT(*)::INTEGER as sessions,
        AVG(ts.wpm) as avg_wpm,
        AVG(ts.accuracy) as avg_accuracy,
        MAX(ts.wpm) as best_wpm,
        MAX(ts.accuracy) as best_accuracy,
        SUM(ts.total_typed)::INTEGER as total_typed,
        SUM(ts.total_errors)::INTEGER as total_errors
    FROM typing_sessions ts
    WHERE ts.user_id = p_user_id
    GROUP BY ts.planet
    ORDER BY ts.planet;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_leaderboard(p_type VARCHAR(20), p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    username VARCHAR(50),
    value DECIMAL(5,2)
) AS $$
BEGIN
    IF p_type = 'wpm' THEN
        RETURN QUERY
        SELECT u.username, MAX(ts.wpm) as value
        FROM users u
        JOIN typing_sessions ts ON u.id = ts.user_id
        GROUP BY u.username
        ORDER BY value DESC
        LIMIT p_limit;
    ELSIF p_type = 'accuracy' THEN
        RETURN QUERY
        SELECT u.username, MAX(ts.accuracy) as value
        FROM users u
        JOIN typing_sessions ts ON u.id = ts.user_id
        GROUP BY u.username
        ORDER BY value DESC
        LIMIT p_limit;
    ELSE
        RETURN QUERY
        SELECT u.username, COUNT(ts.id)::DECIMAL(5,2) as value
        FROM users u
        JOIN typing_sessions ts ON u.id = ts.user_id
        GROUP BY u.username
        ORDER BY value DESC
        LIMIT p_limit;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_stats(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    username VARCHAR(50),
    sessions INTEGER,
    avg_wpm DECIMAL(5,2),
    avg_accuracy DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.username,
        COUNT(ts.id) as sessions,
        AVG(ts.wpm) as avg_wpm,
        AVG(ts.accuracy) as avg_accuracy
    FROM users u
    JOIN typing_sessions ts ON u.id = ts.user_id
    WHERE DATE(ts.session_date) = p_date
    GROUP BY u.username
    ORDER BY sessions DESC;
END;
$$ LANGUAGE plpgsql; 