# Cosmic Typing Adventure API仕様書

## 概要

Cosmic Typing Adventureは、Supabaseをバックエンドとして使用する宇宙テーマのタイピング練習アプリケーションです。このドキュメントでは、APIの詳細仕様、データ構造、認証、エラーハンドリングについて説明します。

## 目次

1. [認証](#認証)
2. [データベーススキーマ](#データベーススキーマ)
3. [APIエンドポイント](#apiエンドポイント)
4. [リアルタイム機能](#リアルタイム機能)
5. [エラーハンドリング](#エラーハンドリング)
6. [セキュリティ](#セキュリティ)
7. [レート制限](#レート制限)
8. [レスポンス形式](#レスポンス形式)

## 認証

### 認証方式
- **Supabase Auth**: メール/パスワード認証
- **匿名認証**: ゲストユーザー用
- **ソーシャルログイン**: Google、GitHub（将来実装予定）

### 認証フロー

```javascript
// 1. 匿名認証（デフォルト）
const { data, error } = await supabase.auth.signInAnonymously()

// 2. メール/パスワード認証
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// 3. ログイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// 4. ログアウト
const { error } = await supabase.auth.signOut()
```

### セッション管理
```javascript
// セッション状態の監視
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session)
})
```

## データベーススキーマ

### テーブル構造

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false
);
```

#### 2. typing_sessions
```sql
CREATE TABLE typing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  planet_id VARCHAR(50) NOT NULL,
  wpm DECIMAL(5,2),
  cpm DECIMAL(5,2),
  accuracy DECIMAL(5,2),
  total_words INTEGER,
  total_characters INTEGER,
  errors_count INTEGER,
  time_taken INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  text_id VARCHAR(100),
  difficulty_level VARCHAR(20)
);
```

#### 3. practice_texts
```sql
CREATE TABLE practice_texts (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  planet_id VARCHAR(50) NOT NULL,
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  word_count INTEGER,
  character_count INTEGER,
  language VARCHAR(10) DEFAULT 'ja',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

#### 4. user_preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  sound_enabled BOOLEAN DEFAULT true,
  keyboard_layout VARCHAR(20) DEFAULT 'qwerty',
  show_wpm BOOLEAN DEFAULT true,
  show_cpm BOOLEAN DEFAULT true,
  show_accuracy BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. achievements
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

#### 6. statistics
```sql
CREATE TABLE statistics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0, -- minutes
  average_wpm DECIMAL(5,2) DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0,
  best_wpm DECIMAL(5,2) DEFAULT 0,
  total_words_typed INTEGER DEFAULT 0,
  total_characters_typed INTEGER DEFAULT 0,
  planets_visited TEXT[], -- array of planet IDs
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ビュー

#### 1. user_typing_stats
```sql
CREATE VIEW user_typing_stats AS
SELECT 
  u.id as user_id,
  u.username,
  COUNT(ts.id) as total_sessions,
  AVG(ts.wpm) as avg_wpm,
  AVG(ts.accuracy) as avg_accuracy,
  MAX(ts.wpm) as best_wpm,
  SUM(ts.total_words) as total_words,
  SUM(ts.time_taken) as total_time_seconds
FROM users u
LEFT JOIN typing_sessions ts ON u.id = ts.user_id
GROUP BY u.id, u.username;
```

#### 2. planet_performance
```sql
CREATE VIEW planet_performance AS
SELECT 
  planet_id,
  COUNT(*) as sessions_count,
  AVG(wpm) as avg_wpm,
  AVG(accuracy) as avg_accuracy,
  AVG(time_taken) as avg_time
FROM typing_sessions
GROUP BY planet_id;
```

## APIエンドポイント

### 認証関連

#### POST /auth/signup
ユーザー登録

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "cosmic_typer"
}
```

**レスポンス:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cosmic_typer"
  }
}
```

#### POST /auth/signin
ユーザーログイン

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/signout
ログアウト

### タイピングセッション

#### POST /api/sessions
新しいタイピングセッションを作成

**リクエスト:**
```json
{
  "planet_id": "mars",
  "text_id": "mars_001",
  "difficulty_level": "medium"
}
```

**レスポンス:**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "planet_id": "mars",
    "text_id": "mars_001",
    "difficulty_level": "medium",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/sessions/{session_id}
タイピングセッションを更新

**リクエスト:**
```json
{
  "wpm": 45.5,
  "cpm": 180.2,
  "accuracy": 95.8,
  "total_words": 150,
  "total_characters": 720,
  "errors_count": 7,
  "time_taken": 120
}
```

#### GET /api/sessions
ユーザーのセッション履歴を取得

**クエリパラメータ:**
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（デフォルト: 0）
- `planet_id`: 惑星フィルター
- `date_from`: 開始日
- `date_to`: 終了日

**レスポンス:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "planet_id": "mars",
      "wpm": 45.5,
      "accuracy": 95.8,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "has_more": true
}
```

### 統計データ

#### GET /api/statistics
ユーザーの統計情報を取得

**レスポンス:**
```json
{
  "total_sessions": 150,
  "total_time_minutes": 1800,
  "average_wpm": 42.3,
  "average_accuracy": 94.2,
  "best_wpm": 65.8,
  "total_words_typed": 45000,
  "planets_visited": ["mars", "jupiter", "saturn"],
  "recent_activity": [
    {
      "date": "2024-01-01",
      "sessions": 5,
      "avg_wpm": 45.2
    }
  ]
}
```

#### GET /api/statistics/planets
惑星別の統計情報を取得

**レスポンス:**
```json
{
  "planets": [
    {
      "planet_id": "mars",
      "sessions_count": 25,
      "avg_wpm": 43.2,
      "avg_accuracy": 94.5,
      "best_wpm": 58.3
    }
  ]
}
```

### 練習テキスト

#### GET /api/texts
練習テキスト一覧を取得

**クエリパラメータ:**
- `planet_id`: 惑星フィルター
- `difficulty`: 難易度フィルター
- `language`: 言語フィルター

**レスポンス:**
```json
{
  "texts": [
    {
      "id": "mars_001",
      "title": "火星探検",
      "content": "火星は太陽系の第4惑星です...",
      "planet_id": "mars",
      "difficulty_level": "medium",
      "word_count": 150,
      "character_count": 720
    }
  ]
}
```

#### GET /api/texts/{text_id}
特定の練習テキストを取得

### ユーザー設定

#### GET /api/preferences
ユーザー設定を取得

**レスポンス:**
```json
{
  "theme": "dark",
  "sound_enabled": true,
  "keyboard_layout": "qwerty",
  "show_wpm": true,
  "show_cpm": true,
  "show_accuracy": true,
  "auto_save": true
}
```

#### PUT /api/preferences
ユーザー設定を更新

**リクエスト:**
```json
{
  "theme": "light",
  "sound_enabled": false,
  "show_wpm": true
}
```

### 実績

#### GET /api/achievements
ユーザーの実績一覧を取得

**レスポンス:**
```json
{
  "achievements": [
    {
      "id": "uuid",
      "achievement_type": "speed",
      "achievement_name": "スピードスター",
      "description": "WPM 50以上を達成",
      "earned_at": "2024-01-01T00:00:00Z",
      "metadata": {
        "wpm": 52.3
      }
    }
  ]
}
```

## リアルタイム機能

### リアルタイム統計更新
```javascript
// 統計のリアルタイム更新を購読
const subscription = supabase
  .channel('typing_stats')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'typing_sessions' },
    (payload) => {
      console.log('New session:', payload.new)
      updateStatistics(payload.new)
    }
  )
  .subscribe()
```

### リアルタイムリーダーボード
```javascript
// リーダーボードのリアルタイム更新
const leaderboardSubscription = supabase
  .channel('leaderboard')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'typing_sessions' },
    (payload) => {
      updateLeaderboard()
    }
  )
  .subscribe()
```

## エラーハンドリング

### エラーコード

| コード | 説明 |
|--------|------|
| 400 | 不正なリクエスト |
| 401 | 認証エラー |
| 403 | 権限エラー |
| 404 | リソースが見つかりません |
| 422 | バリデーションエラー |
| 429 | レート制限 |
| 500 | サーバーエラー |

### エラーレスポンス形式
```json
{
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  }
}
```

### クライアント側エラーハンドリング
```javascript
// エラーハンドリング関数
function handleApiError(error) {
  if (error.code === 401) {
    // 認証エラー - ログインページにリダイレクト
    redirectToLogin()
  } else if (error.code === 429) {
    // レート制限 - リトライロジック
    setTimeout(retryRequest, 1000)
  } else {
    // その他のエラー - ユーザーに通知
    showErrorMessage(error.message)
  }
}
```

## セキュリティ

### Row Level Security (RLS)
```sql
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE typing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON typing_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON typing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON typing_sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

### データ検証
```javascript
// クライアント側バリデーション
function validateSessionData(data) {
  const errors = []
  
  if (data.wpm < 0 || data.wpm > 200) {
    errors.push('WPM must be between 0 and 200')
  }
  
  if (data.accuracy < 0 || data.accuracy > 100) {
    errors.push('Accuracy must be between 0 and 100')
  }
  
  return errors
}
```

## レート制限

### API制限
- **認証エンドポイント**: 10回/分
- **セッション作成**: 100回/分
- **統計取得**: 1000回/分
- **設定更新**: 50回/分

### クライアント側制限
```javascript
// レート制限の実装
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
  }
  
  canMakeRequest() {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now)
      return true
    }
    
    return false
  }
}
```

## レスポンス形式

### 成功レスポンス
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### ページネーション
```json
{
  "success": true,
  "data": [
    // アイテム配列
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### メタデータ
```json
{
  "success": true,
  "data": {
    // メインデータ
  },
  "meta": {
    "generated_at": "2024-01-01T00:00:00Z",
    "cache_status": "hit",
    "processing_time_ms": 45
  }
}
```

## 使用例

### 完全なタイピングセッション
```javascript
// 1. セッション開始
const session = await createSession({
  planet_id: 'mars',
  text_id: 'mars_001'
})

// 2. タイピング中（リアルタイム更新）
const updateInterval = setInterval(async () => {
  await updateSession(session.id, {
    wpm: currentWpm,
    accuracy: currentAccuracy,
    time_taken: elapsedTime
  })
}, 1000)

// 3. セッション完了
clearInterval(updateInterval)
await finalizeSession(session.id, finalStats)
```

### 統計ダッシュボード
```javascript
// 統計データの取得と表示
const stats = await getStatistics()
const planetStats = await getPlanetStatistics()

// Chart.jsでグラフ表示
updatePerformanceChart(stats.recent_activity)
updatePlanetChart(planetStats)
```

---

**バージョン**: 1.0.0  
**最終更新**: 2024年1月  
**作成者**: Cosmic Typing Adventure Team 