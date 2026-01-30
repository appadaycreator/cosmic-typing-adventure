-- Update practice_texts table with new category system
-- Version: 2.0.0
-- Created: 2026-01-30

-- Add new columns for category system
ALTER TABLE practice_texts 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_practice_texts_category ON practice_texts(category);
CREATE INDEX IF NOT EXISTS idx_practice_texts_is_favorite ON practice_texts(is_favorite);

-- Create custom_texts table for user uploaded texts
CREATE TABLE IF NOT EXISTS custom_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 3),
    word_count INTEGER NOT NULL,
    char_count INTEGER NOT NULL,
    source VARCHAR(50) DEFAULT 'upload', -- 'upload', 'url', 'manual'
    source_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for custom_texts
CREATE INDEX IF NOT EXISTS idx_custom_texts_user_id ON custom_texts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_texts_category ON custom_texts(category);
CREATE INDEX IF NOT EXISTS idx_custom_texts_difficulty ON custom_texts(difficulty);
CREATE INDEX IF NOT EXISTS idx_custom_texts_is_public ON custom_texts(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_texts_is_favorite ON custom_texts(is_favorite);

-- Create trigger for custom_texts updated_at
CREATE TRIGGER update_custom_texts_updated_at BEFORE UPDATE ON custom_texts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert new practice texts (200 texts total)
-- Daily conversation (50 texts)
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count, language, category) VALUES
('daily_001', 'earth', '朝の挨拶', 'おはようございます。今日も良い天気ですね。', 1, 15, 22, 'ja', 'daily'),
('daily_002', 'earth', '昼食の誘い', '一緒にお昼ご飯を食べに行きませんか。', 1, 15, 20, 'ja', 'daily'),
('daily_003', 'earth', 'お礼', 'ありがとうございます。とても助かりました。', 1, 18, 22, 'ja', 'daily'),
('daily_004', 'earth', '謝罪', '申し訳ございません。遅れてしまいました。', 1, 18, 22, 'ja', 'daily'),
('daily_005', 'earth', '買い物', 'このリンゴはいくらですか。三つください。', 1, 18, 21, 'ja', 'daily'),
('daily_006', 'earth', '電話対応', 'もしもし、田中ですが、山田さんはいらっしゃいますか。', 1, 25, 28, 'ja', 'daily'),
('daily_007', 'earth', '道案内', 'すみません、駅はどこですか。まっすぐ行って右です。', 1, 25, 28, 'ja', 'daily'),
('daily_008', 'earth', '天気の話', '明日は雨が降るそうです。傘を持って行った方がいいですね。', 1, 30, 31, 'ja', 'daily'),
('daily_009', 'earth', '趣味の話', '休日は何をしていますか。私は読書や映画鑑賞が好きです。', 1, 28, 30, 'ja', 'daily'),
('daily_010', 'earth', '体調を気遣う', '最近お疲れのようですね。無理をなさらず、ゆっくり休んでください。', 1, 32, 33, 'ja', 'daily'),
('daily_011', 'earth', '食事の感想', 'このレストランの料理はとても美味しいですね。', 1, 22, 24, 'ja', 'daily'),
('daily_012', 'earth', '週末の予定', '週末は友達と遊びに行く予定です。楽しみにしています。', 1, 28, 30, 'ja', 'daily'),
('daily_013', 'earth', 'お祝いの言葉', '誕生日おめでとうございます。素敵な一年になりますように。', 1, 30, 31, 'ja', 'daily'),
('daily_014', 'earth', '交通手段', '会社までどうやって通っていますか。電車で30分くらいです。', 1, 30, 32, 'ja', 'daily'),
('daily_015', 'earth', 'お出かけの誘い', '来週の土曜日、一緒に映画を見に行きませんか。', 1, 22, 24, 'ja', 'daily'),
('daily_016', 'earth', 'お見舞い', '体調はいかがですか。早く良くなることを祈っています。', 1, 28, 29, 'ja', 'daily'),
('daily_017', 'earth', '季節の話題', 'もうすぐ桜の季節ですね。花見に行くのが楽しみです。', 1, 27, 29, 'ja', 'daily'),
('daily_018', 'earth', '家族の話', 'ご家族は何人ですか。両親と妹の四人家族です。', 1, 23, 25, 'ja', 'daily'),
('daily_019', 'earth', 'ペットの話', '犬を飼っていますか。はい、柴犬を飼っています。', 1, 23, 25, 'ja', 'daily'),
('daily_020', 'earth', '年末の挨拶', '今年も大変お世話になりました。来年もよろしくお願いします。', 1, 30, 32, 'ja', 'daily'),
('daily_021', 'earth', '年始の挨拶', '明けましておめでとうございます。本年もどうぞよろしくお願いいたします。', 1, 38, 39, 'ja', 'daily'),
('daily_022', 'earth', 'お土産を渡す', '旅行に行ってきました。よかったらどうぞ。', 1, 20, 22, 'ja', 'daily'),
('daily_023', 'earth', 'お土産のお礼', '素敵なお土産をありがとうございます。いただきます。', 1, 27, 28, 'ja', 'daily'),
('daily_024', 'earth', '遅刻の連絡', 'すみません、電車が遅れていて、少し遅刻しそうです。', 1, 27, 28, 'ja', 'daily'),
('daily_025', 'earth', '忘れ物の確認', '携帯電話を忘れませんでしたか。財布と鍵も確認してください。', 1, 31, 32, 'ja', 'daily'),
('daily_026', 'earth', '就寝前の挨拶', 'もう遅いので寝ます。おやすみなさい。', 1, 18, 20, 'ja', 'daily'),
('daily_027', 'earth', '目覚めの挨拶', 'おはよう。よく眠れましたか。今日も頑張りましょう。', 1, 27, 28, 'ja', 'daily'),
('daily_028', 'earth', 'お茶の誘い', 'お茶でもいかがですか。コーヒーと紅茶がありますよ。', 1, 27, 28, 'ja', 'daily'),
('daily_029', 'earth', '服装の褒め言葉', 'そのシャツ、とても似合っていますね。どこで買ったのですか。', 1, 30, 31, 'ja', 'daily'),
('daily_030', 'earth', '髪型の変化', '髪型を変えましたね。とても素敵です。', 1, 18, 20, 'ja', 'daily'),
('daily_031', 'earth', '引越しの挨拶', '先月引っ越してきました。これからよろしくお願いします。', 1, 28, 29, 'ja', 'daily'),
('daily_032', 'earth', '病院の予約', '明日の午後三時に予約をお願いします。', 1, 18, 20, 'ja', 'daily'),
('daily_033', 'earth', 'レストランの予約', '今晩七時に四名で予約したいのですが。', 1, 19, 21, 'ja', 'daily'),
('daily_034', 'earth', 'おすすめ料理', 'この店のおすすめは何ですか。パスタが絶品です。', 1, 24, 26, 'ja', 'daily'),
('daily_035', 'earth', '会計', 'お会計お願いします。全部で二千円になります。', 1, 23, 25, 'ja', 'daily'),
('daily_036', 'earth', '忘れ物の届け出', '電車の中に傘を忘れてしまいました。見つかりませんでしたか。', 1, 31, 32, 'ja', 'daily'),
('daily_037', 'earth', '写真撮影の依頼', 'すみません、写真を撮っていただけますか。ありがとうございます。', 1, 32, 33, 'ja', 'daily'),
('daily_038', 'earth', 'お酒の誘い', '今日は仕事の後、一杯飲みに行きませんか。', 1, 21, 23, 'ja', 'daily'),
('daily_039', 'earth', 'お酒が飲めない', 'すみません、私はお酒が飲めないんです。', 1, 19, 21, 'ja', 'daily'),
('daily_040', 'earth', '乾杯', 'それでは、みなさんで乾杯しましょう。', 1, 18, 20, 'ja', 'daily'),
('daily_041', 'earth', 'テレビ番組', '昨日のドラマ見ましたか。とても面白かったです。', 1, 24, 26, 'ja', 'daily'),
('daily_042', 'earth', '音楽の趣味', 'どんな音楽が好きですか。ロックとジャズをよく聴きます。', 1, 29, 30, 'ja', 'daily'),
('daily_043', 'earth', 'コンサート', '来月、好きなアーティストのコンサートに行きます。', 1, 25, 27, 'ja', 'daily'),
('daily_044', 'earth', 'スポーツ', '何かスポーツをしていますか。週末にテニスをしています。', 1, 29, 30, 'ja', 'daily'),
('daily_045', 'earth', '運動不足', '最近運動不足です。ジムに通おうかと思っています。', 1, 26, 28, 'ja', 'daily'),
('daily_046', 'earth', '健康管理', '健康のために毎日ウォーキングをしています。', 1, 21, 23, 'ja', 'daily'),
('daily_047', 'earth', 'ダイエット', '最近少し太ったので、ダイエットを始めました。', 1, 23, 25, 'ja', 'daily'),
('daily_048', 'earth', '旅行計画', '夏休みに北海道に旅行に行く予定です。', 1, 19, 21, 'ja', 'daily'),
('daily_049', 'earth', '旅行の感想', '京都旅行はどうでしたか。とても良かったです。', 1, 23, 25, 'ja', 'daily'),
('daily_050', 'earth', 'お土産の感想', 'このお菓子、美味しいですね。どこで買いましたか。', 1, 25, 27, 'ja', 'daily')
ON CONFLICT (text_id) DO UPDATE SET
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    title = EXCLUDED.title,
    updated_at = now();

-- Business (50 texts)
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count, language, category) VALUES
('business_001', 'mars', '会議の開始', 'それでは、本日の会議を始めさせていただきます。', 2, 23, 25, 'ja', 'business'),
('business_002', 'mars', '議事録の確認', '前回の議事録を確認させていただきます。ご質問はございますか。', 2, 31, 33, 'ja', 'business'),
('business_003', 'mars', '進捗報告', 'プロジェクトの進捗状況について報告いたします。', 2, 23, 25, 'ja', 'business'),
('business_004', 'mars', '課題の共有', '現在抱えている課題について、皆様のご意見をお聞かせください。', 2, 31, 33, 'ja', 'business'),
('business_005', 'mars', '締め切りの確認', 'こちらのプロジェクトの納期は来月末となっております。', 2, 27, 29, 'ja', 'business'),
('business_006', 'mars', '顧客対応', 'お客様からのご要望に迅速に対応することが重要です。', 2, 26, 28, 'ja', 'business'),
('business_007', 'mars', 'プレゼンテーション', '本日は新製品についてご説明させていただきます。', 2, 23, 25, 'ja', 'business'),
('business_008', 'mars', '企画提案', '新しい企画について提案させていただきたく存じます。', 2, 26, 28, 'ja', 'business'),
('business_009', 'mars', '予算の確認', '今期の予算配分について再度確認をお願いいたします。', 2, 27, 29, 'ja', 'business'),
('business_010', 'mars', '売上分析', '前年度と比較して、売上が二十パーセント増加しております。', 2, 29, 31, 'ja', 'business'),
('business_011', 'mars', '市場調査', '市場調査の結果、顧客ニーズが多様化していることが判明しました。', 2, 33, 35, 'ja', 'business'),
('business_012', 'mars', '競合分析', '競合他社の動向を分析し、戦略を見直す必要があります。', 2, 28, 30, 'ja', 'business'),
('business_013', 'mars', '品質管理', '製品の品質向上のため、検査体制を強化してまいります。', 2, 27, 29, 'ja', 'business'),
('business_014', 'mars', 'コスト削減', '業務効率化により、コストを十パーセント削減することが可能です。', 2, 33, 35, 'ja', 'business'),
('business_015', 'mars', '人材育成', '社員のスキルアップのため、研修プログラムを実施いたします。', 2, 31, 33, 'ja', 'business'),
('business_016', 'mars', 'チームビルディング', 'チームの連携を強化するため、定期的なミーティングを行っています。', 2, 33, 35, 'ja', 'business'),
('business_017', 'mars', '目標設定', '今期の目標は売上高百億円を達成することです。', 2, 23, 25, 'ja', 'business'),
('business_018', 'mars', '評価制度', '社員の業績を公平に評価するため、新しい制度を導入しました。', 2, 31, 33, 'ja', 'business'),
('business_019', 'mars', '顧客満足度', '顧客満足度調査の結果、九十パーセントの方にご満足いただいております。', 2, 37, 39, 'ja', 'business'),
('business_020', 'mars', 'アフターサービス', 'アフターサービスの充実により、リピーター獲得に努めております。', 2, 33, 35, 'ja', 'business'),
('business_021', 'mars', '契約書の確認', '契約書の内容につきまして、法務部の確認をお願いいたします。', 2, 31, 33, 'ja', 'business'),
('business_022', 'mars', '納品スケジュール', '納品スケジュールにつきまして、再度調整をお願いできますでしょうか。', 2, 35, 37, 'ja', 'business'),
('business_023', 'mars', '見積書の作成', '至急、見積書の作成をお願いいたします。', 2, 19, 21, 'ja', 'business'),
('business_024', 'mars', '請求書の送付', '請求書を本日中に送付させていただきます。', 2, 21, 23, 'ja', 'business'),
('business_025', 'mars', '支払い確認', 'お支払いの確認が取れましたので、ご連絡申し上げます。', 2, 28, 30, 'ja', 'business'),
('business_026', 'mars', '商談のお礼', '本日はお忙しい中、貴重なお時間をいただきありがとうございました。', 2, 33, 35, 'ja', 'business'),
('business_027', 'mars', 'アポイントメント', '来週の火曜日、午後二時にお伺いしてもよろしいでしょうか。', 2, 30, 32, 'ja', 'business'),
('business_028', 'mars', '日程調整', 'ご都合の良い日程をお知らせいただけますでしょうか。', 2, 26, 28, 'ja', 'business'),
('business_029', 'mars', '会議室の予約', '明日の午前十時から会議室の予約をお願いいたします。', 2, 27, 29, 'ja', 'business'),
('business_030', 'mars', '出張報告', '出張から戻りましたので、報告書を提出いたします。', 2, 25, 27, 'ja', 'business'),
('business_031', 'mars', '経費精算', '出張経費の精算書類を提出させていただきます。', 2, 23, 25, 'ja', 'business'),
('business_032', 'mars', '休暇申請', '来月の五日から三日間、休暇を取得させていただきたく存じます。', 2, 32, 34, 'ja', 'business'),
('business_033', 'mars', '人事異動', '四月一日付で人事異動が発表されました。', 2, 19, 21, 'ja', 'business'),
('business_034', 'mars', '採用活動', '来期の新卒採用活動を開始いたします。', 2, 19, 21, 'ja', 'business'),
('business_035', 'mars', '面接のお知らせ', '面接日程につきまして、ご連絡させていただきます。', 2, 25, 27, 'ja', 'business'),
('business_036', 'mars', '内定通知', 'この度は、内定のご連絡をさせていただきます。', 2, 23, 25, 'ja', 'business'),
('business_037', 'mars', '退職の挨拶', '長い間お世話になりました。今後ともよろしくお願いいたします。', 2, 31, 33, 'ja', 'business'),
('business_038', 'mars', '引継ぎ', '業務の引継ぎにつきまして、来週から開始いたします。', 2, 27, 29, 'ja', 'business'),
('business_039', 'mars', 'マニュアル作成', '業務マニュアルを作成し、共有フォルダに保存いたしました。', 2, 29, 31, 'ja', 'business'),
('business_040', 'mars', '報告書の提出', '月次報告書を期限までに提出してください。', 2, 20, 22, 'ja', 'business'),
('business_041', 'mars', 'システム障害', 'システム障害が発生しております。復旧作業を行っております。', 2, 31, 33, 'ja', 'business'),
('business_042', 'mars', 'セキュリティ対策', '情報セキュリティ強化のため、パスワードを定期的に変更してください。', 2, 35, 37, 'ja', 'business'),
('business_043', 'mars', 'リモートワーク', '在宅勤務の制度を導入することになりました。', 2, 21, 23, 'ja', 'business'),
('business_044', 'mars', 'オンライン会議', '本日の会議はオンラインで実施いたします。', 2, 21, 23, 'ja', 'business'),
('business_045', 'mars', '働き方改革', '働き方改革の一環として、フレックスタイム制度を導入しました。', 2, 32, 34, 'ja', 'business'),
('business_046', 'mars', 'コンプライアンス', 'コンプライアンス研修を全社員対象に実施いたします。', 2, 28, 30, 'ja', 'business'),
('business_047', 'mars', '環境への配慮', '環境保護の観点から、ペーパーレス化を推進しております。', 2, 29, 31, 'ja', 'business'),
('business_048', 'mars', 'SDGs への取り組み', '持続可能な開発目標の達成に向けて、取り組みを強化しております。', 2, 33, 35, 'ja', 'business'),
('business_049', 'mars', '社会貢献活動', '地域社会への貢献活動として、ボランティアに参加しております。', 2, 32, 34, 'ja', 'business'),
('business_050', 'mars', '決算発表', '本日、今期の決算を発表させていただきます。', 2, 21, 23, 'ja', 'business')
ON CONFLICT (text_id) DO UPDATE SET
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    title = EXCLUDED.title,
    updated_at = now();

-- Programming (50 texts)
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count, language, category) VALUES
('programming_001', 'jupiter', '変数の宣言', '変数を宣言する際は、適切な命名規則に従ってください。', 2, 26, 28, 'ja', 'programming'),
('programming_002', 'jupiter', '関数の定義', '関数は再利用可能なコードブロックとして定義します。', 2, 25, 27, 'ja', 'programming'),
('programming_003', 'jupiter', '条件分岐', '条件分岐を使用して、異なる処理を実行することができます。', 2, 28, 30, 'ja', 'programming'),
('programming_004', 'jupiter', 'ループ処理', 'ループを使って、同じ処理を繰り返し実行できます。', 2, 24, 26, 'ja', 'programming'),
('programming_005', 'jupiter', '配列の操作', '配列は複数のデータを一つの変数にまとめて管理できます。', 2, 28, 30, 'ja', 'programming'),
('programming_006', 'jupiter', 'オブジェクト指向', 'オブジェクト指向プログラミングは、データと処理をまとめて扱います。', 2, 33, 35, 'ja', 'programming'),
('programming_007', 'jupiter', 'クラスの定義', 'クラスはオブジェクトの設計図として機能します。', 2, 23, 25, 'ja', 'programming'),
('programming_008', 'jupiter', '継承', '継承を使用することで、既存のクラスを拡張できます。', 2, 25, 27, 'ja', 'programming'),
('programming_009', 'jupiter', 'ポリモーフィズム', 'ポリモーフィズムにより、同じインターフェースで異なる動作を実現します。', 2, 35, 37, 'ja', 'programming'),
('programming_010', 'jupiter', 'カプセル化', 'カプセル化により、データを外部から保護します。', 2, 23, 25, 'ja', 'programming'),
('programming_011', 'jupiter', 'エラーハンドリング', 'エラーハンドリングを適切に行い、プログラムの安定性を高めます。', 2, 32, 34, 'ja', 'programming'),
('programming_012', 'jupiter', 'デバッグ', 'デバッグツールを使用して、バグを見つけて修正します。', 2, 26, 28, 'ja', 'programming'),
('programming_013', 'jupiter', 'バージョン管理', 'バージョン管理システムを使って、コードの変更履歴を管理します。', 2, 31, 33, 'ja', 'programming'),
('programming_014', 'jupiter', 'Git の使い方', 'Git はコードのバージョン管理に広く使われているツールです。', 2, 32, 34, 'ja', 'programming'),
('programming_015', 'jupiter', 'コミット', '変更をコミットして、バージョン管理システムに保存します。', 2, 28, 30, 'ja', 'programming'),
('programming_016', 'jupiter', 'ブランチ', 'ブランチを作成して、並行して複数の機能を開発できます。', 2, 27, 29, 'ja', 'programming'),
('programming_017', 'jupiter', 'マージ', 'ブランチをマージして、変更を統合します。', 2, 20, 22, 'ja', 'programming'),
('programming_018', 'jupiter', 'コンフリクト解決', 'マージ時にコンフリクトが発生した場合は、手動で解決する必要があります。', 2, 36, 38, 'ja', 'programming'),
('programming_019', 'jupiter', 'プルリクエスト', 'プルリクエストを作成して、コードレビューを依頼します。', 2, 28, 30, 'ja', 'programming'),
('programming_020', 'jupiter', 'コードレビュー', 'コードレビューを通じて、コードの品質を向上させます。', 2, 27, 29, 'ja', 'programming'),
('programming_021', 'jupiter', 'テスト駆動開発', 'テスト駆動開発では、テストを先に書いてからコードを実装します。', 2, 32, 34, 'ja', 'programming'),
('programming_022', 'jupiter', 'ユニットテスト', 'ユニットテストは個々の関数やメソッドをテストします。', 2, 26, 28, 'ja', 'programming'),
('programming_023', 'jupiter', '統合テスト', '統合テストは複数のモジュールを組み合わせてテストします。', 2, 28, 30, 'ja', 'programming'),
('programming_024', 'jupiter', 'エンドツーエンドテスト', 'エンドツーエンドテストは、システム全体の動作を検証します。', 2, 30, 32, 'ja', 'programming'),
('programming_025', 'jupiter', '継続的インテグレーション', '継続的インテグレーションにより、自動的にビルドとテストが実行されます。', 2, 35, 37, 'ja', 'programming'),
('programming_026', 'jupiter', 'デプロイ', 'アプリケーションを本番環境にデプロイします。', 2, 22, 24, 'ja', 'programming'),
('programming_027', 'jupiter', 'ドキュメント作成', 'コードのドキュメントを作成して、他の開発者が理解しやすくします。', 2, 32, 34, 'ja', 'programming'),
('programming_028', 'jupiter', 'API 設計', 'API を設計する際は、RESTful な原則に従うことが推奨されます。', 2, 35, 37, 'ja', 'programming'),
('programming_029', 'jupiter', 'データベース設計', 'データベーススキーマは、正規化を考慮して設計します。', 2, 27, 29, 'ja', 'programming'),
('programming_030', 'jupiter', 'SQL クエリ', 'SQL クエリを使って、データベースからデータを取得します。', 2, 30, 32, 'ja', 'programming'),
('programming_031', 'jupiter', 'NoSQL データベース', 'NoSQL データベースは、柔軟なスキーマ設計が可能です。', 2, 29, 31, 'ja', 'programming'),
('programming_032', 'jupiter', 'セキュリティ対策', 'セキュリティ対策として、入力値のバリデーションを行います。', 2, 29, 31, 'ja', 'programming'),
('programming_033', 'jupiter', '認証と認可', '認証はユーザーの身元確認、認可はアクセス権限の管理です。', 2, 30, 32, 'ja', 'programming'),
('programming_034', 'jupiter', '暗号化', '機密データは暗号化して保存することが重要です。', 2, 23, 25, 'ja', 'programming'),
('programming_035', 'jupiter', 'パフォーマンス最適化', 'パフォーマンスを最適化するため、キャッシュを活用します。', 2, 28, 30, 'ja', 'programming'),
('programming_036', 'jupiter', 'スケーラビリティ', 'システムのスケーラビリティを考慮して、設計を行います。', 2, 28, 30, 'ja', 'programming'),
('programming_037', 'jupiter', 'マイクロサービス', 'マイクロサービスアーキテクチャでは、機能ごとにサービスを分割します。', 2, 35, 37, 'ja', 'programming'),
('programming_038', 'jupiter', 'コンテナ化', 'Docker を使ってアプリケーションをコンテナ化します。', 2, 28, 30, 'ja', 'programming'),
('programming_039', 'jupiter', 'Kubernetes', 'Kubernetes はコンテナオーケストレーションツールです。', 2, 28, 30, 'ja', 'programming'),
('programming_040', 'jupiter', 'クラウドサービス', 'クラウドサービスを利用して、インフラを管理します。', 2, 25, 27, 'ja', 'programming'),
('programming_041', 'jupiter', 'サーバーレス', 'サーバーレスアーキテクチャでは、サーバー管理が不要です。', 2, 29, 31, 'ja', 'programming'),
('programming_042', 'jupiter', '機械学習', '機械学習モデルをトレーニングして、予測を行います。', 2, 25, 27, 'ja', 'programming'),
('programming_043', 'jupiter', 'データ分析', 'データ分析を通じて、ビジネスインサイトを得ます。', 2, 25, 27, 'ja', 'programming'),
('programming_044', 'jupiter', 'アジャイル開発', 'アジャイル開発では、短いサイクルで開発とリリースを繰り返します。', 2, 33, 35, 'ja', 'programming'),
('programming_045', 'jupiter', 'スクラム', 'スクラムはアジャイル開発のフレームワークの一つです。', 2, 27, 29, 'ja', 'programming'),
('programming_046', 'jupiter', 'スプリント', 'スプリントは、一定期間で完了させる作業単位です。', 2, 24, 26, 'ja', 'programming'),
('programming_047', 'jupiter', 'バックログ', 'バックログには、開発すべき機能のリストが含まれます。', 2, 27, 29, 'ja', 'programming'),
('programming_048', 'jupiter', 'ペアプログラミング', 'ペアプログラミングでは、二人で協力してコードを書きます。', 2, 29, 31, 'ja', 'programming'),
('programming_049', 'jupiter', 'リファクタリング', 'リファクタリングを行い、コードの可読性を向上させます。', 2, 28, 30, 'ja', 'programming'),
('programming_050', 'jupiter', '技術的負債', '技術的負債を減らすため、定期的にコードの見直しを行います。', 2, 30, 32, 'ja', 'programming')
ON CONFLICT (text_id) DO UPDATE SET
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    title = EXCLUDED.title,
    updated_at = now();

-- Literature (50 texts)
INSERT INTO practice_texts (text_id, planet, title, content, difficulty, word_count, char_count, language, category) VALUES
('literature_001', 'saturn', '夏目漱石『吾輩は猫である』', '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。', 3, 38, 40, 'ja', 'literature'),
('literature_002', 'saturn', '夏目漱石『坊っちゃん』', '親譲りの無鉄砲で小供の時から損ばかりしている。', 3, 25, 27, 'ja', 'literature'),
('literature_003', 'saturn', '太宰治『人間失格』', '恥の多い生涯を送って来ました。自分には、人間の生活というものが、見当つかないのです。', 3, 48, 50, 'ja', 'literature'),
('literature_004', 'saturn', '太宰治『走れメロス』', 'メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。', 3, 40, 42, 'ja', 'literature'),
('literature_005', 'saturn', '芥川龍之介『羅生門』', '或日の暮方の事である。一人の下人が、羅生門の下で雨やみを待っていた。', 3, 38, 40, 'ja', 'literature'),
('literature_006', 'saturn', '芥川龍之介『鼻』', '禅智内供の鼻は、五六寸あって上唇の上から顎の下まで下がっている。', 3, 37, 39, 'ja', 'literature'),
('literature_007', 'saturn', '川端康成『雪国』', '国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。', 3, 36, 38, 'ja', 'literature'),
('literature_008', 'saturn', '川端康成『伊豆の踊子』', '道がつづら折りになって、いよいよ天城峠に近づいたと思う頃、雨脚が杉の密林を白く染めながら。', 3, 52, 54, 'ja', 'literature'),
('literature_009', 'saturn', '三島由紀夫『金閣寺』', '幼少の頃から、父は常に私に、金閣の話をした。', 3, 24, 26, 'ja', 'literature'),
('literature_010', 'saturn', '三島由紀夫『潮騒』', '歌島は、人口千四百の平和な漁村である。', 3, 21, 23, 'ja', 'literature'),
('literature_011', 'saturn', '宮沢賢治『銀河鉄道の夜』', '「ではみなさんは、そういうふうに川だと云われたり、乳の流れたあとだと云われたりしていたこのぼんやりと白いものがほんとうは何かご承知ですか。」', 3, 79, 81, 'ja', 'literature'),
('literature_012', 'saturn', '宮沢賢治『注文の多い料理店』', '二人の若い紳士が、すっかりイギリスの兵隊のかたちをして、ぴかぴかする鉄砲をかついで、白熊のような犬を二疋つれて、だいぶ山奥の、木の葉のかさかさしたとこを、こんなことを云いながら、あるいておりました。', 3, 106, 108, 'ja', 'literature'),
('literature_013', 'saturn', '森鴎外『舞姫』', '石炭をば早や積み果てつ。中等室の卓のほとりはいと静にて、熾熱燈の光の晴れがましきも徒なり。', 3, 52, 54, 'ja', 'literature'),
('literature_014', 'saturn', '森鴎外『高瀬舟』', '高瀬舟は京都の高瀬川を上下する小舟である。', 3, 23, 25, 'ja', 'literature'),
('literature_015', 'saturn', '樋口一葉『たけくらべ』', '廻れば大門の見返り柳いと長けれど、お歯ぐろ溝に燈火うつる三階の騒ぎも手に取る如く。', 3, 48, 50, 'ja', 'literature'),
('literature_016', 'saturn', '樋口一葉『にごりえ』', '銘酒屋といふ看板をかけて、女に酌をさせて酒を飲ませる家がある。', 3, 36, 38, 'ja', 'literature'),
('literature_017', 'saturn', '坂口安吾『堕落論』', '去年の春あたりからぼつぼつ世間に現われた新しい風俗や娯楽を眺めると、人間はまだ生きている、ということを私は感じる。', 3, 64, 66, 'ja', 'literature'),
('literature_018', 'saturn', '谷崎潤一郎『細雪』', 'こいさんは、その日の午過ぎに京都へ着くことになっていて、姉の幸子は、大阪の家を朝早く出た。', 3, 52, 54, 'ja', 'literature'),
('literature_019', 'saturn', '谷崎潤一郎『春琴抄』', '春琴は、鵙屋の主人の次女として生まれた。', 3, 22, 24, 'ja', 'literature'),
('literature_020', 'saturn', '志賀直哉『暗夜行路』', '祖父は早くから床に就いていた。寝つかれないでいると、階下から祖母の声がした。', 3, 42, 44, 'ja', 'literature'),
('literature_021', 'saturn', '志賀直哉『城の崎にて』', '山の手線の電車に跳ね飛ばされて怪我をした、その後養生に、但馬の城崎温泉へ出かけた。', 3, 46, 48, 'ja', 'literature'),
('literature_022', 'saturn', '梶井基次郎『檸檬』', 'えたいの知れない不吉な塊が私の心を始終圧えつけていた。', 3, 31, 33, 'ja', 'literature'),
('literature_023', 'saturn', '梶井基次郎『桜の樹の下には』', '桜の樹の下には屍体が埋まっている！これは信じていいことなんだよ。', 3, 37, 39, 'ja', 'literature'),
('literature_024', 'saturn', '中島敦『山月記』', '隴西の李徴は博学才穎、天宝の末年、若くして名を虎榜に連ね、ついで江南尉に補せられたが、性、狷介、自ら恃むところ頗る厚く、賤吏に甘んずるを潔しとしなかった。', 3, 87, 89, 'ja', 'literature'),
('literature_025', 'saturn', '中島敦『弟子』', '孔子が衛の国を去ろうとして、弟子の子路が車の手綱を執った。', 3, 32, 34, 'ja', 'literature'),
('literature_026', 'saturn', '井伏鱒二『山椒魚』', '山椒魚は悲しんだ。彼は彼の棲家である岩屋の天井に頭をぶっつけた。', 3, 37, 39, 'ja', 'literature'),
('literature_027', 'saturn', '井伏鱒二『黒い雨』', '閑間重松は日記を読み返していた。それは日記というよりは覚え書きのようなものだった。', 3, 46, 48, 'ja', 'literature'),
('literature_028', 'saturn', '堀辰雄『風立ちぬ』', '風立ちぬ、いざ生きめやも。', 3, 14, 16, 'ja', 'literature'),
('literature_029', 'saturn', '有島武郎『或る女』', '早瀬葉子は、その朝、横浜の埠頭から、アメリカ行きの船に乗り込んだ。', 3, 38, 40, 'ja', 'literature'),
('literature_030', 'saturn', '武者小路実篤『友情』', '野島は大宮を、自分の親友の一人と思っていた。', 3, 24, 26, 'ja', 'literature'),
('literature_031', 'saturn', '島崎藤村『破戒』', '蓮華寺では下宿を兼ねた。瀬川丑松は、そこに寄宿していた。', 3, 31, 33, 'ja', 'literature'),
('literature_032', 'saturn', '島崎藤村『夜明け前』', '木曾路はすべて山の中である。', 3, 14, 16, 'ja', 'literature'),
('literature_033', 'saturn', '田山花袋『蒲団』', '時雄は机に向かって、何か書きかけたまま、ぼんやりと考えこんでいた。', 3, 37, 39, 'ja', 'literature'),
('literature_034', 'saturn', '国木田独歩『武蔵野』', '武蔵野に散歩する人は、道に迷うことを苦にしてはならない。', 3, 32, 34, 'ja', 'literature'),
('literature_035', 'saturn', '徳富蘆花『不如帰』', '川島武男中尉は、海軍兵学校を卒業して間もない青年将校であった。', 3, 35, 37, 'ja', 'literature'),
('literature_036', 'saturn', '泉鏡花『高野聖』', 'その男の詣るというのは、仏頂面をしてみちのくを探るといふように聞こえました。', 3, 43, 45, 'ja', 'literature'),
('literature_037', 'saturn', '正岡子規『病牀六尺』', '病牀六尺、これが我世界である。しかもこの六尺の病牀が余には広過ぎるのである。', 3, 45, 47, 'ja', 'literature'),
('literature_038', 'saturn', '幸田露伴『五重塔』', 'のっそり十兵衛と云う男があった。', 3, 17, 19, 'ja', 'literature'),
('literature_039', 'saturn', '尾崎紅葉『金色夜叉』', '熱海の海岸に、二人の男女が立っていた。', 3, 21, 23, 'ja', 'literature'),
('literature_040', 'saturn', '二葉亭四迷『浮雲』', '文三は今、その叔母の家に厄介になっている。', 3, 23, 25, 'ja', 'literature'),
('literature_041', 'saturn', '内田百閒『冥途』', '阿呆列車に乗っていると思った。', 3, 16, 18, 'ja', 'literature'),
('literature_042', 'saturn', '永井荷風『墨東綺譚』', '夏の初め、梅雨の晴れ間に、玉の井を探ねて見た。', 3, 26, 28, 'ja', 'literature'),
('literature_043', 'saturn', '永井荷風『腕くらべ』', 'おれは浅草見附の橋のたもとで、暮れかかる空を仰いでいた。', 3, 32, 34, 'ja', 'literature'),
('literature_044', 'saturn', '林芙美子『放浪記』', '私はその夜、女学校を卒業してから働いていた足袋工場を辞めて、家出をした。', 3, 40, 42, 'ja', 'literature'),
('literature_045', 'saturn', '開高健『裸の王様』', 'ぼくは昆虫採集が好きだった。夏休みになると、毎日のように野山を駆けまわった。', 3, 43, 45, 'ja', 'literature'),
('literature_046', 'saturn', '安部公房『砂の女』', '男は、休暇を利用して、海浜の砂丘地帯へ昆虫採集に出かけた。', 3, 32, 34, 'ja', 'literature'),
('literature_047', 'saturn', '安部公房『壁』', '名刺を配って歩くのは、ずいぶん骨が折れる仕事だった。', 3, 29, 31, 'ja', 'literature'),
('literature_048', 'saturn', '大岡昇平『野火』', '私はその病院の裏で、最初の屍体を見た。', 3, 22, 24, 'ja', 'literature'),
('literature_049', 'saturn', '大岡昇平『俘虜記』', '私がアメリカ軍の俘虜となったのは、昭和二十年一月中旬のことである。', 3, 37, 39, 'ja', 'literature'),
('literature_050', 'saturn', '遠藤周作『沈黙』', '司祭たちは、夜の闇の中で、漁師の小屋に身を潜めていた。', 3, 30, 32, 'ja', 'literature')
ON CONFLICT (text_id) DO UPDATE SET
    category = EXCLUDED.category,
    content = EXCLUDED.content,
    title = EXCLUDED.title,
    updated_at = now();

-- Create view for text management with category
CREATE OR REPLACE VIEW practice_texts_with_stats AS
SELECT 
    pt.*,
    COUNT(ts.id) FILTER (WHERE ts.text_id = pt.text_id) as usage_count_db,
    MAX(ts.session_date) as last_used_at_db
FROM practice_texts pt
LEFT JOIN typing_sessions ts ON pt.text_id = ts.text_id
GROUP BY pt.id;

-- Function to get texts by category and difficulty
CREATE OR REPLACE FUNCTION get_texts_by_filter(
    p_category VARCHAR(50) DEFAULT NULL,
    p_difficulty INTEGER DEFAULT NULL,
    p_is_favorite BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    text_id VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(50),
    difficulty INTEGER,
    is_favorite BOOLEAN,
    usage_count INTEGER,
    last_used_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.text_id,
        pt.title,
        pt.content,
        pt.category,
        pt.difficulty,
        pt.is_favorite,
        pt.usage_count,
        pt.last_used_at
    FROM practice_texts pt
    WHERE 
        (p_category IS NULL OR pt.category = p_category)
        AND (p_difficulty IS NULL OR pt.difficulty = p_difficulty)
        AND (p_is_favorite IS NULL OR pt.is_favorite = p_is_favorite)
        AND pt.is_active = TRUE
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended texts based on user proficiency
CREATE OR REPLACE FUNCTION get_recommended_texts(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    text_id VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(50),
    difficulty INTEGER,
    recommendation_score DECIMAL(5,2)
) AS $$
DECLARE
    v_avg_wpm DECIMAL(5,2);
    v_avg_accuracy DECIMAL(5,2);
    v_recommended_difficulty INTEGER;
BEGIN
    -- Get user's average stats
    SELECT 
        COALESCE(AVG(wpm), 0),
        COALESCE(AVG(accuracy), 0)
    INTO v_avg_wpm, v_avg_accuracy
    FROM typing_sessions
    WHERE user_id = p_user_id;

    -- Determine recommended difficulty
    IF v_avg_wpm < 30 OR v_avg_accuracy < 85 THEN
        v_recommended_difficulty := 1;
    ELSIF v_avg_wpm < 50 OR v_avg_accuracy < 90 THEN
        v_recommended_difficulty := 2;
    ELSE
        v_recommended_difficulty := 3;
    END IF;

    -- Return recommended texts
    RETURN QUERY
    SELECT 
        pt.id,
        pt.text_id,
        pt.title,
        pt.content,
        pt.category,
        pt.difficulty,
        CASE 
            WHEN pt.difficulty = v_recommended_difficulty THEN 100.0
            WHEN ABS(pt.difficulty - v_recommended_difficulty) = 1 THEN 70.0
            ELSE 30.0
        END as recommendation_score
    FROM practice_texts pt
    WHERE pt.is_active = TRUE
        AND NOT EXISTS (
            SELECT 1 FROM typing_sessions ts 
            WHERE ts.user_id = p_user_id 
                AND ts.text_id = pt.text_id 
                AND ts.session_date > NOW() - INTERVAL '7 days'
        )
    ORDER BY recommendation_score DESC, RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to toggle favorite status
CREATE OR REPLACE FUNCTION toggle_favorite_text(p_text_id VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    v_current_status BOOLEAN;
BEGIN
    SELECT is_favorite INTO v_current_status
    FROM practice_texts
    WHERE text_id = p_text_id;

    UPDATE practice_texts
    SET is_favorite = NOT COALESCE(v_current_status, FALSE),
        updated_at = now()
    WHERE text_id = p_text_id;

    RETURN NOT COALESCE(v_current_status, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_text_usage(p_text_id VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    UPDATE practice_texts
    SET 
        usage_count = COALESCE(usage_count, 0) + 1,
        last_used_at = now(),
        updated_at = now()
    WHERE text_id = p_text_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update usage count when session is created
CREATE OR REPLACE FUNCTION trigger_update_text_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.text_id IS NOT NULL THEN
        PERFORM update_text_usage(NEW.text_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_typing_session_text_usage
    AFTER INSERT ON typing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_text_usage();
