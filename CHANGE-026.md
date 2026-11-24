# CHANGE-026: 定番のみ選択時は「作り方を見る」ボタンを非活性化

## 目的
メニュー（レシピ）を1つも選んでおらず「いつもの定番」のみを選んだ状態では、作り方画面に表示するレシピがない。その状態で買い物リスト画面の「作り方を見る」ボタンが押せてしまうので、メニュー未選択時はボタンを非活性化する。

## 前提
- 作業ブランチは `feature/disable-recipe-button`（作成済み。このブランチ上でのみ作業すること）。
- プロジェクトの AGENTS.md のルール（ES2022厳守、変更後は `npm run lint` でエラーゼロまで修正）に従うこと。依存関係は導入済みなので npm install は不要。
- 選択状態は `state.menus`（レシピの id 配列）と `state.staples`（定番の id 配列）で管理されている。確定ボタンの活性制御は `updateConfirm()` が担っている。

## 作業内容

### 1. app.js：`updateConfirm()` を拡張する
現状の `updateConfirm()` は確定ボタン（`#confirm`）だけを制御している。ここに、作り方ボタン（`#toRecipe`）の制御を追加すること。要点は以下と同等にすること。

- `state.menus.length === 0` のとき：`#toRecipe` を `disabled = true` にし、テキストを「作り方を見る（メニュー未選択）」にする。
- `state.menus.length > 0` のとき：`#toRecipe` を `disabled = false` にし、テキストを「作り方を見る」に戻す。

`updateConfirm()` は初期表示・選択変更・リセットのたびに呼ばれるため、この拡張でボタンの状態は常に最新に保たれる。既存の確定ボタンの制御ロジックは変更しないこと。

### 2. sw.js：キャッシュ名の版を上げる
CHANGE-025 で定めた運用ルール（アプリシェルを変更する際は `CACHE_NAME` の版を上げる）に従い、`CACHE_NAME` を `"mealprep-v1"` から `"mealprep-v2"` に変更すること。それ以外の sw.js の変更はしないこと。

## 検証（実施して結果を報告すること）
- `npm run lint` がエラー0件で通ること。
- `node --check app.js` と `node --check sw.js` が通ること。

## 禁止事項・注意
- `index.html` と `style.css` は変更しないこと。
- `app.js` 内の IMAGES マップ（data URI）は一切変更しないこと。
- アレルギー対策の BLOCKED リストと guardIngredients() の二重実行は維持すること。
- **`app.js` に対して `rg` / `grep` を使うときは、`-C`（前後行表示）を絶対に使わないこと。IMAGES の data URI 行が巨大で、コンテキスト表示に含まれると出力があふれてプロセスが落ちる。** 検索はパターン一致行のみ（`--max-columns 200` を付ける）、範囲確認は `sed -n` の行範囲指定や `tail` で行うこと。ファイル内容を標準出力に大きく表示しないこと。
- コミットはノアが行うので、git commit / git push はしないこと。

## 報告フォーマット
- 変更したファイルの一覧と、各変更の要点
- 検証結果（`npm run lint` の終了コード、`node --check` の結果）
