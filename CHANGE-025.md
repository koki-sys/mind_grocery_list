# CHANGE-025: PWA化（Android対応）とアイコン整理

## 目的
1. Android の Chrome で「アプリとしてインストール」でき、スタンドアロン表示とオフライン起動ができるようにする（PWA化）。
2. アイコンの重複を解消する。現状 `apple-touch-icon.png` と `apple-touch-icon-v2.png` はバイト単位で同一の複製で、index.html が参照しているのは `-v2` の方。単一マスター（favicon.svg）から生成した必要サイズだけに整理する。

## 前提
- 作業ブランチは `feature/pwa`（作成済み。このブランチ上でのみ作業すること）。
- プロジェクトの AGENTS.md のルール（ES2022厳守、変更後は `npm run lint` でエラーゼロまで修正）に従うこと。依存関係は導入済みなので npm install は不要。
- アイコンPNG（icon-192.png / icon-512.png / icon-maskable-512.png / apple-touch-icon.png の再生成）と旧ファイル（apple-touch-icon-v2.png / icon-compare.png）の削除は、ノアが別工程で行う。**この仕様で Codex が扱うのはテキストファイルのみ。**

## 作業内容

### 1. manifest.webmanifest を新規作成する
内容は以下と同等にすること（キー順・整形はこの通りに揃える）。

```json
{
  "name": "作り置き買い物リスト",
  "short_name": "買い物リスト",
  "lang": "ja",
  "start_url": ".",
  "scope": ".",
  "display": "standalone",
  "background_color": "#b7e39a",
  "theme_color": "#3aa76d",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 2. sw.js（Service Worker）を新規作成する
- 文体は app.js に合わせること：ES2022 の範囲内、`const` と関数式（アロー関数）で統一し、関数宣言・`var` は使わない。
- キャッシュ名は `"mealprep-v1"`。
- `install`：アプリシェルをプリキャッシュする。対象は `"./"`, `"index.html"`, `"style.css"`, `"app.js"`, `"manifest.webmanifest"`, `"favicon.svg"`, `"apple-touch-icon.png"`, `"icon-192.png"`, `"icon-512.png"`, `"icon-maskable-512.png"`。あわせて `self.skipWaiting()` を呼ぶ。
- `activate`：自キャッシュ名以外の古いキャッシュをすべて削除し、`self.clients.claim()` を呼ぶ。
- `fetch`：GET リクエストのみ扱う。cache-first（キャッシュにあればそれを返し、なければネットワーク。ネットワーク取得に失敗し、かつナビゲーションリクエストの場合はキャッシュした `"index.html"` を返す）。

### 3. index.html を修正する
- CSP の content に `manifest-src 'self';` を追加する（他のディレクティブは一切変更しない）。
- apple-touch-icon の href を `apple-touch-icon.png` に変更する（`-v2` の参照をやめる）。
- `<link rel="manifest" href="manifest.webmanifest">` を追加する。
- `<meta name="mobile-web-app-capable" content="yes">` を追加する。
- それ以外の部分（title、theme-color、本文）は変更しない。

### 4. app.js を修正する
- IIFE の末尾、初期化呼び出し（`applyView(); renderPickers(); updateConfirm();`）の後に、Service Worker の登録処理を追加する。形は以下と同等にすること。

```js
if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(function(){}); }
```

### 5. package.json を修正する
- lint スクリプトを `"eslint app.js sw.js"` に変更する（sw.js も ES2022 検査の対象にするため）。それ以外の変更は禁止。

## 検証（実施して結果を報告すること）
- `npm run lint` がエラー0件で通ること。
- `node --check app.js` と `node --check sw.js` が通ること。
- manifest.webmanifest が JSON として妥当なこと（`node -e` 等でパース確認）。

## 禁止事項・注意
- PNG ファイルと favicon.svg は変更しないこと。
- `style.css` は変更しないこと。
- `app.js` 内の IMAGES マップ（data URI）は一切変更しないこと。
- アレルギー対策の BLOCKED リストと guardIngredients() の二重実行は維持すること。
- `app.js` は大きい（約560KB）ので、`cat` 等でファイル内容を標準出力に表示しないこと。diff を確認する場合も変更行の前後に絞り、data URI の行を出力に含めないこと。
- **`app.js` に対して `rg` / `grep` を使うときは、`-C`（前後行表示）を絶対に使わないこと。IMAGES の data URI 行が巨大で、コンテキスト表示に含まれると出力があふれてプロセスが落ちる。** 検索はパターン一致行のみ（`--max-columns 200` を付ける）、末尾の確認は `tail` や行番号範囲指定で行うこと。
- コミットはノアが行うので、git commit / git push はしないこと。

## 報告フォーマット
- 作成・変更したファイルの一覧と、各変更の要点
- 検証結果（`npm run lint` の終了コード、`node --check` の結果、manifest のパース確認結果）
