# CHANGE-023: ES2022 対応（ESLint 導入と違反修正）

## 目的
買い物リストアプリの JavaScript を ES2022 準拠にする。ES2023 以降の構文・組み込み機能を使わないことを、ユーザ指定の ESLint flat config で検証できる状態にし、現行コードの違反があれば ES2022 で書ける形に修正する。アプリの機能・表示・動作は変えない。

## 前提
- 作業ブランチは `feature/es2022`（作成済み。このブランチ上でのみ作業すること）。
- 対象ファイルは `app.js`（約560KB、画像の data URI を含む大きなファイル）。`index.html` にインラインスクリプトはない。
- package.json / eslint.config.js はまだ存在しない。

## 作業内容
0. プロジェクトルートに `AGENTS.md` を以下の内容で新規作成する（一字一句そのまま。Codex 自身が今後従うルール）：

```markdown
# Coding Guidelines
- JavaScriptは **ES2022** の範囲内の構文・組み込みAPIのみを使用すること（ES2023以降のメソッドは使用禁止）。
- コード変更後は必ず `npm run lint` を実行し、エラーがゼロになるまで修正すること。
```

1. `eslint.config.js` を以下の内容で新規作成する。ユーザ提示スニペットの引用符は全角・カーリークォート混じりなので、**すべて半角ダブルクォート `"` に直す**こと。中身（config 名・順序・ecmaVersion）は提示通り変えない。

```js
// eslint.config.js
import pluginEsX from "eslint-plugin-es-x";

export default [
  pluginEsX.configs["flat/no-new-in-es2023"],
  pluginEsX.configs["flat/no-new-in-es2024"],
  pluginEsX.configs["flat/no-new-in-es2025"],
  {
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
];
```

2. `package.json` が無いので作成し、`eslint` と `eslint-plugin-es-x` を devDependencies として導入する（`npm install -D eslint eslint-plugin-es-x`）。あわせて `"scripts": { "lint": "eslint app.js" }` を入れること（AGENTS.md の `npm run lint` がそのまま使えるように）。`"type": "module"` は付けない（app.js はクラシックスクリプトとして読み込まれるため、プロジェクト全体のモジュール種別を変えないこと）。npm のネットワークアクセスがサンドボックスで失敗した場合は、その旨を報告して止まること（ノア側でインストールする）。
3. `npm run lint` を実行する。
4. 違反があれば、ES2022 で等価に書ける形へ `app.js` を修正する。機能・表示・データは変えない。
5. 再度 `npm run lint` を実行し、エラー0件を確認する。あわせて `node --check app.js` が通ることも確認する。

## 禁止事項・注意
- `app.js` は大きいので、`cat` 等でファイル内容を標準出力に表示しないこと。編集はスクリプトでピンポイントに行い、検証はコマンドの結果（件数・終了コード・sha256sum 等）だけで行うこと。
- `app.js` 内の IMAGES マップ（data URI）は一切変更しないこと。
- アレルギー対策の BLOCKED リストと guardIngredients() の二重実行は意図的な多重防御なので、統合・削除しないこと。
- CSP（index.html 内）や style.css は変更しないこと。
- コミットはノアが行うので、git commit / git push はしないこと。作業ツリーに変更を残した状態で報告すること。

## 報告フォーマット
- eslint の初回結果（違反件数と、あれば違反ルール・行の概要。ファイル内容の表示は不要）
- 修正した箇所の概要（何をどう書き換えたか）
- 最終結果（eslint の終了コード、node --check の結果）
