# Info Tech Portal – 開発エージェント向けガイド

このリポジトリは、静的 HTML/CSS/JS で構成された講義用ポータルサイトです。GitHub Pages で配信し、PWA（Service Worker + Web App Manifest）対応です。以下は本リポジトリで作業する AI/開発エージェントのための実践ガイドです。

## 構成と役割
- ルート `index.html`: トップページ。講義 II/III への入口、問い合わせリンク、PWA 登録、Rubyful.js の設定。
- `information_technology_2/` と `information_technology_3/`: 各講義のセクション用ページとクラス別ページ（`class1.html`/`class2.html`）。
  - 各ページは「PC 用」と「モバイル用」を別 DOM として二重に持ち、Bootstrap の可視制御クラスで出し分けます（例: `.pc-view.d-none.d-lg-block`, `.mobile-view.d-lg-none`）。
- `css/custom.css`: 共通のスタイル（CSS カスタムプロパティ、カード/ボタン、ナビ/フッター、モバイル最適化）。
- `service-worker.js`: キャッシュ戦略（Cache First）。
- `manifest.json` と `icons/`: PWA メタデータとアイコン。

## 依存関係（CDN & 外部）
- Bootstrap 5.3（CSS/JS）、Font Awesome、Google Fonts（Inter）。
- Rubyful.js（ふりがな表示切替）。各 HTML の `<head>` で以下順序を厳守:
  - 先に `window.RubyfulJsApp = { defaultDisplay: false };` を定義
  - 次に `<script src="https://rubyfuljs.s3.ap-northeast-1.amazonaws.com/rubyful.js" async></script>` を読み込み

## ナビゲーションとリンク規約
- GitHub Pages のベースパスは `/<repo-name>`（本リポジトリでは `/info-tech-portal`）。
- すべての絶対パスリンクはベースパスを含めます。
  - 例: `href="/info-tech-portal/information_technology_2/index.html"`
- 同一ページ内や SW/Manifest 参照は相対パスを推奨（ベースパス変更耐性向上）。

## クラス別ページのパターン
- クラス専用ページ（例: `information_technology_2/class1.html`）は簡易パスワードゲートを持ちます。
  - PC 用: `form onsubmit="checkPassword(); return false;"` → 成功時 `#contentPc` を `display:block`
  - モバイル用: 同様に `checkPasswordMobile()` → `#contentMobile`
  - パスワードはページ内の定数で比較（例: `const CORRECT_PASSWORD_IT2_CL1 = "...";`）。この方式は簡易的で秘匿には不向きですが、本サイトでは運用仕様です。
- テストリンクは `.button-list > li > a.btn.btn-custom`（PC）、モバイルは `.card .stretched-link` を踏襲。

## PWA/Service Worker の要点
- 登録スクリプトはベースパスを考慮してください。
  - 望ましい登録例（トップと同じ階層から）：`navigator.serviceWorker.register('./service-worker.js')`
  - 絶対パスで書くなら：`/info-tech-portal/service-worker.js`
- `service-worker.js` の `cache.addAll([...])` に列挙するパスは、実在する相対/絶対パスにしてください。
  - 現状の注意点: 日本語ディレクトリ名（例: `/情報技術II/`）はリポジトリ内に存在しません。実体は `information_technology_2/` です。
- キャッシュキーは将来の変更に備えバージョン付け推奨（例: `info-tech-cache-v2`）。更新時は古いキャッシュ削除ロジックも検討。

## スタイリング規約
- カラーテーマは `:root` の CSS カスタムプロパティを使用（`--primary-color` 等）。
- 共通 UI:
  - ボタン: `.btn-custom`（グラデ/ホバーアニメ）
  - カード: `.course-card`, `.question-card`
  - 固定ヘッダ: `.navbar.fixed-top` 使用時はモバイルで親に `padding-top` を与える（例: `.mobile-view { padding-top: 70px; }`）

## ローカル開発の基本
- 本リポジトリはビルド不要の静的サイトです。ローカルプレビューの例:
  - PowerShell（推奨の一例）:
    - Python: `python -m http.server 5500`
    - もしくは Node（任意）: `npx serve -l 5500`
  - アクセス: `http://localhost:5500/index.html`
- SW の挙動確認は「ハードリロード」「シークレットウィンドウ」を活用。変更後はキャッシュ名を更新すると反映が早いです。

## デプロイとパス
- デフォルトブランチ `main` に push → GitHub Pages が公開。
- ページ URL は README 記載: `https://krminfinity.github.io/info-tech-portal/`
- ベースパス依存の処理（リンク、SW、アイコン/manifest 参照）は `/info-tech-portal` を意識。

## よくある落とし穴（このリポジトリ特有）
- Service Worker のパス/スコープ不一致
  - `navigator.serviceWorker.register('/service-worker.js')` は GH Pages では `/info-tech-portal/service-worker.js` を指しません。相対パス登録にするのが安全。
- `cache.addAll` に実在しないパスが含まれている（日本語パス）→ 正しいディレクトリ名に統一。
- PC/モバイル DOM の二重管理忘れ
  - 片方だけ更新して UI が不整合になりがち。両方のセクションを同時に更新。

## 参照ファイル
- ルート: `index.html`, `service-worker.js`, `manifest.json`
- スタイル: `css/custom.css`
- 講義 II: `information_technology_2/index.html`, `class1.html`, `class2.html`
- 講義 III: `information_technology_3/index.html`, `class1.html`, `class2.html`

---
不明点や不足があれば、どの作業を自動化したいか（例: SW 修正の自動 PR、リンクの一括検証、PC/モバイル DOM 同期）を教えてください。次回更新で追補します。
