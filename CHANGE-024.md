# CHANGE-024: ESLint 設定の更新（restrict-to-es2022＋スタイルルール）と違反修正

## 目的
`eslint.config.js` をユーザ指定の新しい内容に差し替え、それに伴って発生する app.js の lint 違反をすべて修正し、`npm run lint` がエラー0件で通る状態にする。アプリの機能・表示・動作は変えない。

## 前提
- 作業ブランチは `feature/update-eslint-config`（作成済み。このブランチ上でのみ作業すること）。
- ノア側で事前検証済み：新設定はそのまま読み込め、現行 app.js に対する違反は **合計52件（no-var 36件、func-style 16件）**。prefer-const / no-const-assign / no-unassigned-vars / es-x 系の違反は0件だった。
- プロジェクトの AGENTS.md のルール（ES2022厳守、変更後は `npm run lint` でエラーゼロまで修正）に従うこと。依存関係（node_modules）は導入済みなので npm install は不要。

## 作業内容
1. `eslint.config.js` を以下の内容に差し替える。ユーザ提示スニペットの引用符は全角・カーリークォート混じりなので、**すべて半角ダブルクォート `"` に直す**こと（インデントや中身は提示通り）。

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import pluginEsX from "eslint-plugin-es-x";

export default defineConfig([
    pluginEsX.configs["restrict-to-es2022"],
    pluginEsX.configs["restrict-to-es2022-intl-api"],
    {
        languageOptions: {
            ecmaVersion: 2022,
        },
        rules: {
            "func-style": ["error", "expression"],
            "no-var": "error",
            "prefer-const": "error",
            "no-const-assign": "error",
            "no-unassigned-vars": "error",
        },
    },
]);
```

2. `npm run lint` を実行し、違反を確認する。
3. app.js の違反を修正する。`eslint --fix` で自動修正できるものは使ってよいが、func-style の変換は以下の注意を厳守し、自動修正の結果も全件目視に相当する確認（diff の行単位チェック）をすること。
4. 再度 `npm run lint` を実行し、エラー0件を確認する。あわせて `node --check app.js` が通ることも確認する。

## func-style 変換時の注意（動作を変えないこと）
- 関数宣言は巻き上げ（hoisting）されるが、`const` への関数式代入は巻き上げされない。**定義より前に呼び出している箇所がないか全件確認**し、ある場合は呼び出し側と定義側の順序が等価になるよう対処し、その箇所を報告すること。
- 本文で `this` または `arguments` を使っている関数は、アロー関数にすると意味が変わる。その場合はアロー化せず、無名（または名前付き）関数式 `const f = function (...) {...}` で対応すること。
- 自分の名前で再帰呼び出ししている関数は、変換後も再帰が成立する形（名前付き関数式、または const 名での呼び出し）にすること。
- 関数宣言をイベントリスナやコールバックとして参照している箇所も、参照時点より前に定義が来るよう注意すること。

## 禁止事項・注意
- `app.js` は大きい（約560KB）ので、`cat` 等でファイル内容を標準出力に表示しないこと。編集はスクリプトでピンポイントに行い、検証はコマンド結果（件数・終了コード・sha256sum・diff の統計）で行うこと。diff を確認する場合も、変更行の前後数行に絞ること。
- `app.js` 内の IMAGES マップ（data URI）は一切変更しないこと。
- アレルギー対策の BLOCKED リストと guardIngredients() の二重実行は意図的な多重防御なので、統合・削除しないこと（関数変換の対象になっても二重実行の構造は維持すること）。
- `index.html`、`style.css`、`package.json` は変更しないこと。
- コミットはノアが行うので、git commit / git push はしないこと。作業ツリーに変更を残した状態で報告すること。

## 報告フォーマット
- 初回 lint の違反内訳（ルール別件数）
- 修正の概要（ルール別に何をどう変えたか）
- func-style 変換で注意が必要だった箇所（巻き上げ・this・arguments・再帰のいずれかに触れた箇所があれば、その行番号と対処。なければ「なし」）
- 最終結果（`npm run lint` の終了コード、`node --check app.js` の結果）
