# CHANGE-027: 「作り方を見る」ボタンの非活性スタイルを確定ボタンに揃える（文言は変更しない）

## 目的
CHANGE-026 で「作り方を見る」ボタン（`#toRecipe`）をメニュー未選択時に無効化したが、2点が本人の意図と違っていたため修正する。

1. **文言を変えない**：CHANGE-026 では無効時にラベルを「作り方を見る（メニュー未選択）」に書き換えたが、これは不要。ラベルは常に「作り方を見る」のままにすること。
2. **無効時の見た目を確定ボタンに揃える**：現状 style.css の無効時スタイル `#confirm:disabled{opacity:.45}` は確定ボタン（`#confirm`）専用で、`#toRecipe` には効いていない。そのため `#toRecipe` は無効化しても不透明なままで、見た目が「押せないボタン」に見えない。確定ボタンと同じスタイル（opacity .45）が効くようにすること。

## 前提
- 作業ブランチは `feature/recipe-button-disabled-style`（作成済み。このブランチ上でのみ作業すること）。
- プロジェクトの AGENTS.md のルール（ES2022厳守、変更後は `npm run lint` でエラーゼロまで修正）に従うこと。依存関係は導入済みなので npm install は不要。
- `#confirm` と `#toRecipe` はどちらも `.fixbar` 内のボタンで、有効時のスタイルは `.fixbar button` で共通化されている。

## 作業内容

### 1. app.js：文言の書き換えをやめる
`updateConfirm()` 内の `#toRecipe` 制御から `textContent` の変更を取り除き、`disabled` の切り替えだけにすること。変更後の該当箇所は以下と同等になる。

```js
  const toRecipe = document.getElementById("toRecipe");
  toRecipe.disabled = state.menus.length === 0;
```

既存の確定ボタンの制御ロジックは変更しないこと。

### 2. style.css：無効時スタイルを .fixbar のボタン共通にする
`#confirm:disabled{opacity:.45}` を `.fixbar button:disabled{opacity:.45}` に変更すること。これで確定ボタンの見た目は従来通り（同じ opacity が同じ要素に効く）で、「作り方を見る」ボタンにも同じ無効スタイルが効くようになる。他の CSS ルールは変更しないこと。

### 3. sw.js：キャッシュ名の版を上げる
運用ルール（アプリシェルを変更する際は `CACHE_NAME` の版を上げる）に従い、`CACHE_NAME` を `"mealprep-v2"` から `"mealprep-v3"` に変更すること。それ以外の sw.js の変更はしないこと。

## 検証（実施して結果を報告すること）
- `npm run lint` がエラー0件で通ること。
- `node --check app.js` と `node --check sw.js` が通ること。

## 禁止事項・注意
- `index.html` は変更しないこと。
- `app.js` 内の IMAGES マップ（data URI）は一切変更しないこと。
- アレルギー対策の BLOCKED リストと guardIngredients() の二重実行は維持すること。
- **`app.js` に対して `rg` / `grep` を使うときは、`-C`（前後行表示）を絶対に使わないこと。IMAGES の data URI 行が巨大で、コンテキスト表示に含まれると出力があふれてプロセスが落ちる。** 検索はパターン一致行のみ（`--max-columns 200` を付ける）、範囲確認は `sed -n` の行範囲指定や `tail` で行うこと。ファイル内容を標準出力に大きく表示しないこと。
- コミットはノアが行うので、git commit / git push はしないこと。

## 報告フォーマット
- 変更したファイルの一覧と、各変更の要点
- 検証結果（`npm run lint` の終了コード、`node --check` の結果）
