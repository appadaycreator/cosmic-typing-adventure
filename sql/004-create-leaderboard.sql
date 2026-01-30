-- Create Leaderboard Table
-- リーダーボード機能用のテーブル

-- Drop table if exists (開発環境用)
DROP TABLE IF EXISTS public.leaderboard;

-- Create leaderboard table
CREATE TABLE public.leaderboard (
    id BIGSERIAL PRIMARY KEY,
    mode VARCHAR(50) NOT NULL, -- 'normal', 'survival', 'timeAttack'
    time_limit INTEGER, -- タイムアタックの制限時間（秒）
    wpm DECIMAL(10, 2) NOT NULL,
    accuracy DECIMAL(5, 2) NOT NULL,
    score INTEGER NOT NULL, -- WPM * (accuracy/100) の計算結果
    rank VARCHAR(10) NOT NULL, -- 'S', 'A', 'B', 'C', 'D'
    total_typed INTEGER DEFAULT 0,
    duration DECIMAL(10, 2) DEFAULT 0,
    player_name VARCHAR(100) DEFAULT 'Anonymous',
    user_id UUID, -- 将来の認証対応用
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Indexes for performance
    CONSTRAINT leaderboard_mode_check CHECK (mode IN ('normal', 'survival', 'timeAttack'))
);

-- Create indexes for better query performance
CREATE INDEX idx_leaderboard_mode ON public.leaderboard(mode);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX idx_leaderboard_mode_score ON public.leaderboard(mode, score DESC);
CREATE INDEX idx_leaderboard_time_limit ON public.leaderboard(time_limit);
CREATE INDEX idx_leaderboard_created_at ON public.leaderboard(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: すべてのユーザーが閲覧可能
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard
FOR SELECT
USING (true);

-- Policy: すべてのユーザーが自分のスコアを追加可能
CREATE POLICY "Anyone can insert their score"
ON public.leaderboard
FOR INSERT
WITH CHECK (true);

-- Policy: ユーザーは自分のスコアのみ更新可能（将来の認証対応用）
CREATE POLICY "Users can update their own scores"
ON public.leaderboard
FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy: ユーザーは自分のスコアのみ削除可能（将来の認証対応用）
CREATE POLICY "Users can delete their own scores"
ON public.leaderboard
FOR DELETE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Insert sample data for testing
INSERT INTO public.leaderboard (mode, time_limit, wpm, accuracy, score, rank, total_typed, duration, player_name)
VALUES
    ('survival', NULL, 65.5, 98.5, 65, 'A', 350, 180.0, 'Alpha Pilot'),
    ('survival', NULL, 72.3, 95.2, 69, 'A', 380, 160.0, 'Beta Explorer'),
    ('survival', NULL, 55.0, 92.0, 51, 'B', 290, 200.0, 'Gamma Ranger'),
    ('timeAttack', 60, 85.0, 96.0, 82, 'S', 450, 60.0, 'Speed Master'),
    ('timeAttack', 60, 70.5, 94.5, 67, 'A', 370, 60.0, 'Quick Typist'),
    ('timeAttack', 180, 78.2, 97.0, 76, 'A', 980, 180.0, 'Marathon Runner'),
    ('timeAttack', 300, 72.0, 98.5, 71, 'A', 1800, 300.0, 'Endurance Pro'),
    ('normal', NULL, 60.0, 95.0, 57, 'B', 320, 200.0, 'Steady Pilot'),
    ('normal', NULL, 48.5, 88.0, 43, 'C', 250, 240.0, 'Learning Cadet'),
    ('normal', NULL, 35.2, 82.0, 29, 'D', 180, 280.0, 'Rookie Astronaut');

-- Comments
COMMENT ON TABLE public.leaderboard IS 'リーダーボード - ゲームモード別のハイスコア記録';
COMMENT ON COLUMN public.leaderboard.mode IS 'ゲームモード: normal, survival, timeAttack';
COMMENT ON COLUMN public.leaderboard.time_limit IS 'タイムアタックモードの制限時間（秒）';
COMMENT ON COLUMN public.leaderboard.score IS 'スコア = WPM * (accuracy/100)';
COMMENT ON COLUMN public.leaderboard.rank IS 'ランク評価: S, A, B, C, D';
COMMENT ON COLUMN public.leaderboard.player_name IS 'プレイヤー名（匿名可）';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leaderboard table created successfully!';
    RAISE NOTICE 'Sample data inserted for testing.';
END $$;
