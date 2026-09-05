# FairyBiome - A Chat Application with Chatbots

v.30.1

* ブラウザ内で完結動作可能な軽量チャットボット
* 専用のチャットルーム

# 会話エンジンの特徴

* 雑談向けに会話テキスト以外の

# Requirements

* Firebase sparkアカウント(無料)
* node.js v22.20.0

# 特徴量行列のダンプ

実際の `.episode.json` ファイルから、検索キャッシュに使われる語彙 x 語彙の正規化済み共起行列を CSV として出力できます。

```
npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json
```

既定では `tmp/greeting.episode.matrix.csv` に出力されます。出力先を指定する場合は `--output` を使います。

```
npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json --output tmp/aurula.csv
```

Python pandas では先頭列をインデックスとして読み込みます。

```python
import pandas as pd

matrix = pd.read_csv("tmp/greeting.episode.matrix.csv", index_col=0)
```

会話行を縦軸、特徴トークンを横軸にする CSV は `--format row-features` で出力します。

```
npm run dump:episode-matrix -- static/bots/Aurula/greeting.episode.json --format row-features
```

```python
row_features = pd.read_csv(
  "tmp/greeting.episode.row-features.csv",
  index_col="conversation_row",
)
```

# インストール

1. ソースコードのダウンロード
githubからローカルにソースをcloneしてください。

2. nvm環境設定(任意)
nvmを利用することでnodeのバージョン制御を行うと便利です。ソースを展開したディレクトリで

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```
を実行し、nvmをインストールします。

```
nvm use
```
で必要なバージョンのnodeがインストールされます。

3. パッケージのインストール
```
npm intall
```
で実行に必要なパッケージをインストールします。

3. firebase設定
[firebase](https://firebase.google.com/?hl=ja)にアカウントを用意します。規模が小さければ無料プランで開始できます。つづいて[Firebase を JavaScript プロジェクトに追加する](https://firebase.google.com/docs/web/setup?hl=ja)を参考にfirebase上にプロジェクトを作成してください。

[firebase CLIをインストールする](https://firebase.google.com/docs/cli?hl=ja#mac-linux-auto-script)を参照して
以下のコマンドを実行してください。

```
curl -sL https://firebase.tools | bash
firebase login
```

firebaseの Project ID が得られたら、
```
firebase use <Project ID>
```
を実行してください。

プロジェクトディレクトリに`.env.local`というファイルを作成し、firebaseから取得したクレデンシャル情報を以下のように転記します。nextjsではプログラム内で使える環境変数は先頭がNEXT_PUBLIC_から始まっている必要があるため、以下のような名前にします。
```
  NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxx
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxx.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxxxxxxxxxx
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxx.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
  NEXT_PUBLIC_FIREBASE_APP_ID=0:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=x-xxxxxxxxxx
```

さらにソースコードをgithub上に置く場合はリポジトリ本体にはセキュリティのためクレデンシャル情報を置かず、代わりに
Settings - Secrets and variables - Repository secretsに以下の変数を作り、
firebaseから取得したクレデンシャルを転記します。

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

4. テスト
```
npm run dev
```
とするとソースコードのコンパイルが行われ、問題なければローカルでアプリが起動します。
