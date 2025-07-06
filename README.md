# GitHub Profile Statistics Card

GitHubプロフィールに表示できるMost Used Languagesカードを生成するサービスです。

## 使用方法

### 1. ローカルでの起動

```bash
npm install
npm start
```

サーバーがポート3000で起動します。

### 2. GitHubプロフィールへの追加

README.mdに以下のコードを追加してください：

```markdown
![Most Used Languages](http://localhost:3000/api/languages?username=YOUR_GITHUB_USERNAME)
```

`YOUR_GITHUB_USERNAME`を自分のGitHubユーザー名に置き換えてください。

### 3. 環境変数

GitHub APIのレート制限を回避するため、GitHubトークンの設定が必要です：

1. [GitHub Personal Access Token](https://github.com/settings/tokens)を作成
   - 必要なスコープ: `public_repo`（プライベートリポジトリも含める場合は`repo`）

2. `.env`ファイルを作成：
```bash
cp .env.example .env
```

3. `.env`ファイルにトークンを設定：
```
GITHUB_TOKEN=your_github_personal_access_token_here
```

**注意**: 認証なしの場合、GitHub APIは1時間あたり60リクエストの制限があります。トークンを使用すると5,000リクエストに増加します。

### 4. Vercelへのデプロイ

1. `vercel.json`を作成：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/languages",
      "dest": "/index.js"
    }
  ]
}
```

2. Vercelにデプロイ：

```bash
npm i -g vercel
vercel
```

3. デプロイ後のURLを使用：

```markdown
![Most Used Languages](https://your-app.vercel.app/api/languages?username=YOUR_GITHUB_USERNAME)
```

## 機能

- GitHubリポジトリから言語統計を収集
- 10%以上使用されている言語のみ表示
- SVG形式でカードを生成
- キャッシュ対応（1時間）
- 複数のカードテーマ対応

## カードテーマ

4つのユニークなテーマから選択できます：

### Default テーマ（デフォルト）
標準的な横バーチャートとレジェンド表示（495x195px）
```markdown
![Most Used Languages](http://localhost:3000/api/languages?username=YOUR_USERNAME)
```

### Pie テーマ
グラデーション背景とパイチャートで表示（400x250px）
```markdown
![Most Used Languages](http://localhost:3000/api/languages?username=YOUR_USERNAME&theme=pie)
```

### Wave テーマ
ダークモードで波形のビジュアライゼーション（495x220px）
```markdown
![Most Used Languages](http://localhost:3000/api/languages?username=YOUR_USERNAME&theme=wave)
```

### Grid テーマ
言語をカラフルなグリッドレイアウトで表示（450x300px）
```markdown
![Most Used Languages](http://localhost:3000/api/languages?username=YOUR_USERNAME&theme=grid)
```

## カスタマイズ

`lib/card.js`の`LANGUAGE_COLORS`オブジェクトを編集することで、言語の色をカスタマイズできます。