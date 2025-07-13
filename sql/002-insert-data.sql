-- Cosmic Typing Adventure Initial Data
-- Version: 1.0.0
-- Created: 2024-01-01

-- Insert sample users (for testing purposes)
INSERT INTO users (username, email, preferences) VALUES
('testuser1', 'test1@example.com', '{"defaultPlanet": "earth", "theme": "cosmic", "soundEnabled": true}'),
('testuser2', 'test2@example.com', '{"defaultPlanet": "mars", "theme": "cosmic", "soundEnabled": false}'),
('demo_user', 'demo@example.com', '{"defaultPlanet": "jupiter", "theme": "cosmic", "soundEnabled": true}')
ON CONFLICT (username) DO NOTHING;

-- Insert sample typing sessions
INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT 
    u.id,
    'earth',
    45.5,
    95.2,
    150,
    7,
    120000,
    'earth_001'
FROM users u WHERE u.username = 'testuser1'
ON CONFLICT DO NOTHING;

INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT 
    u.id,
    'mars',
    52.3,
    92.8,
    180,
    13,
    135000,
    'mars_002'
FROM users u WHERE u.username = 'testuser1'
ON CONFLICT DO NOTHING;

INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT 
    u.id,
    'jupiter',
    38.7,
    88.5,
    220,
    25,
    180000,
    'jupiter_003'
FROM users u WHERE u.username = 'testuser2'
ON CONFLICT DO NOTHING;

INSERT INTO typing_sessions (user_id, planet, wpm, accuracy, total_typed, total_errors, duration, text_id) 
SELECT 
    u.id,
    'saturn',
    35.2,
    85.1,
    280,
    42,
    240000,
    'saturn_001'
FROM users u WHERE u.username = 'demo_user'
ON CONFLICT DO NOTHING;

-- Insert additional practice texts for each planet
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count) VALUES
-- Earth texts
('earth_003', 'earth', '地球の大気', '地球の大気は主に窒素と酸素で構成されており、生命を支える重要な役割を果たしています。', 1, 30, 60),
('earth_004', 'earth', '地球の自転', '地球は約24時間で自転しており、これにより昼と夜が生まれます。', 1, 20, 40),
('earth_005', 'earth', '地球の公転', '地球は約365日で太陽の周りを公転しており、これにより四季が生まれます。', 1, 25, 50),
('earth_006', 'earth', '地球の衛星', '月は地球の唯一の衛星で、地球から最も近い天体です。', 1, 22, 44),
('earth_007', 'earth', '地球の磁場', '地球は磁場を持っており、これにより有害な宇宙線から守られています。', 1, 25, 50),

-- Mars texts
('mars_003', 'mars', '火星探査', '火星探査機は、この惑星の秘密を解き明かすために日夜観測を続けています。', 2, 30, 60),
('mars_004', 'mars', '火星の大気', '火星の大気は非常に薄く、主に二酸化炭素で構成されています。', 2, 25, 50),
('mars_005', 'mars', '火星の地形', '火星には太陽系最大の火山オリンポス山や、巨大な峡谷マリネリス峡谷があります。', 2, 35, 70),
('mars_006', 'mars', '火星の季節', '火星にも地球と同様に季節があり、極冠が変化します。', 2, 25, 50),
('mars_007', 'mars', '火星の衛星', '火星にはフォボスとダイモスという2つの小さな衛星があります。', 2, 25, 50),

-- Jupiter texts
('jupiter_003', 'jupiter', '木星の重力', '木星の強い重力は、太陽系の他の天体の軌道に大きな影響を与えています。', 3, 30, 60),
('jupiter_004', 'jupiter', '木星の衛星', '木星には多くの衛星があり、その中でもガニメデ、カリスト、イオ、エウロパは四大衛星として知られています。', 3, 45, 90),
('jupiter_005', 'jupiter', '木星の組成', '木星は主に水素とヘリウムで構成されており、地球のような固体の表面はありません。', 3, 35, 70),
('jupiter_006', 'jupiter', '木星の磁場', '木星は太陽系で最も強い磁場を持っており、強力な放射線帯を形成しています。', 3, 35, 70),
('jupiter_007', 'jupiter', '木星の環', '木星にも薄い環があり、1979年にボイジャー1号によって発見されました。', 3, 30, 60),

-- Saturn texts
('saturn_003', 'saturn', 'タイタン', '土星の衛星タイタンは、地球以外で唯一、表面に液体の湖が存在することが確認されています。', 4, 40, 80),
('saturn_004', 'saturn', '土星の大気', '土星の大気は木星と同様に水素とヘリウムが主成分で、美しい縞模様が見られます。', 4, 40, 80),
('saturn_005', 'saturn', '土星の探査', 'カッシーニ探査機は13年間にわたって土星を観測し、多くの重要な発見をもたらしました。', 4, 35, 70),
('saturn_006', 'saturn', '土星の衛星', '土星には82個の衛星が確認されており、その中でもタイタンが最大です。', 4, 30, 60),
('saturn_007', 'saturn', '土星の環の構造', '土星の環は複数の層に分かれており、それぞれが異なる組成と特性を持っています。', 4, 35, 70)
ON CONFLICT (text_id) DO NOTHING;

-- Insert user preferences for sample users
INSERT INTO user_preferences (user_id, preferences) 
SELECT 
    u.id,
    '{"defaultPlanet": "earth", "theme": "cosmic", "soundEnabled": true, "showProgress": true, "autoSave": true}'
FROM users u WHERE u.username = 'testuser1'
ON CONFLICT (user_id) DO UPDATE SET
    preferences = EXCLUDED.preferences,
    updated_at = NOW();

INSERT INTO user_preferences (user_id, preferences) 
SELECT 
    u.id,
    '{"defaultPlanet": "mars", "theme": "cosmic", "soundEnabled": false, "showProgress": true, "autoSave": true}'
FROM users u WHERE u.username = 'testuser2'
ON CONFLICT (user_id) DO UPDATE SET
    preferences = EXCLUDED.preferences,
    updated_at = NOW();

INSERT INTO user_preferences (user_id, preferences) 
SELECT 
    u.id,
    '{"defaultPlanet": "jupiter", "theme": "cosmic", "soundEnabled": true, "showProgress": true, "autoSave": true}'
FROM users u WHERE u.username = 'demo_user'
ON CONFLICT (user_id) DO UPDATE SET
    preferences = EXCLUDED.preferences,
    updated_at = NOW();

-- Insert sample achievements for users
INSERT INTO user_achievements (user_id, achievement_id)
SELECT 
    u.id,
    a.id
FROM users u, achievements a
WHERE u.username = 'testuser1' AND a.name = 'First Steps'
ON CONFLICT DO NOTHING;

INSERT INTO user_achievements (user_id, achievement_id)
SELECT 
    u.id,
    a.id
FROM users u, achievements a
WHERE u.username = 'testuser2' AND a.name IN ('First Steps', 'Planet Explorer')
ON CONFLICT DO NOTHING;

-- Update global statistics with sample data
UPDATE global_statistics 
SET stat_value = '3'::jsonb, updated_at = NOW()
WHERE stat_name = 'total_users';

UPDATE global_statistics 
SET stat_value = '4'::jsonb, updated_at = NOW()
WHERE stat_name = 'total_sessions';

UPDATE global_statistics 
SET stat_value = '830'::jsonb, updated_at = NOW()
WHERE stat_name = 'total_typed';

UPDATE global_statistics 
SET stat_value = '42.9'::jsonb, updated_at = NOW()
WHERE stat_name = 'avg_wpm';

UPDATE global_statistics 
SET stat_value = '90.4'::jsonb, updated_at = NOW()
WHERE stat_name = 'avg_accuracy';

UPDATE global_statistics 
SET stat_value = '52.3'::jsonb, updated_at = NOW()
WHERE stat_name = 'top_speed';

UPDATE global_statistics 
SET stat_value = '95.2'::jsonb, updated_at = NOW()
WHERE stat_name = 'top_accuracy';

-- Create views for easier data access
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

-- Create function to get user progress
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

-- Create function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(p_type VARCHAR(20), p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    rank INTEGER,
    username VARCHAR(50),
    value DECIMAL(5,2),
    planet VARCHAR(20),
    session_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY 
            CASE 
                WHEN p_type = 'speed' THEN ts.wpm
                WHEN p_type = 'accuracy' THEN ts.accuracy
                ELSE ts.wpm
            END DESC
        )::INTEGER as rank,
        u.username,
        CASE 
            WHEN p_type = 'speed' THEN ts.wpm
            WHEN p_type = 'accuracy' THEN ts.accuracy
            ELSE ts.wpm
        END as value,
        ts.planet,
        ts.session_date
    FROM typing_sessions ts
    JOIN users u ON ts.user_id = u.id
    ORDER BY 
        CASE 
            WHEN p_type = 'speed' THEN ts.wpm
            WHEN p_type = 'accuracy' THEN ts.accuracy
            ELSE ts.wpm
        END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get daily statistics
CREATE OR REPLACE FUNCTION get_daily_stats(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    total_sessions INTEGER,
    total_users INTEGER,
    avg_wpm DECIMAL(5,2),
    avg_accuracy DECIMAL(5,2),
    most_active_planet VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_sessions,
        COUNT(DISTINCT user_id)::INTEGER as total_users,
        AVG(wpm) as avg_wpm,
        AVG(accuracy) as avg_accuracy,
        MODE() WITHIN GROUP (ORDER BY planet) as most_active_planet
    FROM typing_sessions
    WHERE DATE(session_date) = p_date;
END;
$$ LANGUAGE plpgsql; 