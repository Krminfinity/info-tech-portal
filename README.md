# 講義ポータル

このプロジェクトは、学生が「情報技術II」および「情報技術III」の講義資料やテストにアクセスするためのシンプルなWebポータルです。

## ページURL

ポータルはこちらからアクセスできます：[https://krminfinity.github.io/info-tech-portal/]

## プロジェクト構造

```
/
├── index.html              # メインページ
├── information_technology_2/
│   ├── index.html          # 情報技術II
│   ├── class1.html         # 1組専用
│   └── class2.html         # 2組専用
├── information_technology_3/
│   ├── index.html          # 情報技術III
│   ├── class1.html         # 1組専用
│   └── class2.html         # 2組専用
├── css/
│   └── custom.css          # スタイル
└── icons/                  # PWA用アイコン
```

## � コンテンツの更新方法

### 新しいテストやリンクの追加
1. 該当するHTMLファイルを直接編集
2. クラス専用ページ（`class1.html`, `class2.html`）の場合：
   - パスワード認証後に表示される部分のHTMLを編集
   - 確認テストのリストに新しいリンクを追加
3. Gitでコミット・プッシュしてGitHub Pagesに反映

### 講義ページの編集例
情報技術II 1組に新しいテストを追加する場合：
1. `information_technology_2/class1.html` を開く
2. `<ul class="button-list">` セクション内に新しいリンクを追加：
```html
<li><a href="新しいテストのURL" target="_blank" class="btn btn-custom d-block mb-2">新しいテスト名（Google Forms）</a></li>
```

## 🔒 パスワード保護ページ

クラス専用ページ（`class1.html`, `class2.html`）はパスワード保護されています：

- **情報技術II 1組**: パスワードは別途配布
- **情報技術II 2組**: パスワードは別途配布
- **情報技術III 1組**: パスワードは別途配布
- **情報技術III 2組**: パスワードは別途配布

パスワードは各ファイルのJavaScript部分で設定できます。

## 📱 PWA機能

このポータルはスマートフォンのホーム画面に追加できます：

### Androidの場合
1. Chromeでサイトを開く
2. メニュー → 「ホーム画面に追加」
3. アプリ名を確認して「追加」

### iOSの場合
1. Safariでサイトを開く
2. 共有ボタン → 「ホーム画面に追加」
3. アプリ名を確認して「追加」

## 🈺 ルビ（ふりがな）機能

難しい漢字にふりがなを表示できます：

1. ページ右下のルビトグルボタンをクリック
2. 難しい漢字に自動的にふりがなが表示
3. 再度クリックで無効化

## サポート

技術的な問題や質問がある場合は、GitHubのIssuesページでお知らせください。
