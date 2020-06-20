# FairyBiome-0.8

 クローズドなチャットシステム with Biomeチャットボット

----

## Prerequisity

firebaseアカウント

## installing

### firebase のセットアップ

Firebaseにログインし、新しいプロジェクトを作成します。

```

firebase login
firebase init
```

プロジェクトのルートディレクトリに`.env`ファイルを作り、firebaseのクレデンシャル情報を記入する。
これらはFirebaseのプロジェクト画面から歯車アイコンをクリックし「プロジェクトを設定」を開き、`Firebase SDK`欄の「構成」を選択すると表示される。

```
GATSBY_FIREBASE_API_KEY=<YOUR_FIREBASE_API_KEY>
GATSBY_FIREBASE_AUTH_DOMAIN=<YOUR_FIREBASE_AUTH_DOMAIN>
GATSBY_FIREBASE_DATABASE_URL=<YOUR_FIREBASE_DATABASE_URL>
GATSBY_FIREBASE_PROJECT_ID=<YOUR_FIREBASE_PROJECT_ID>
GATSBY_FIREBASE_STORAGE_BUCKET=<YOUR_FIREBASE_STORAGE_BUCKET>
GATSBY_FIREBASE_MESSAGING_SENDER_ID=<YOUR_FIREBASE_MESSAGING_SENDER_ID>
GATSBY_FIREBASE_APP_ID=<YOUR_FIREBASE_APP_ID>
```

## Test

※Firebase単体でテストする際はFirebase serveを使うが、Firestoreやfunctionsはエミュレータでなく本番環境が使用されるため、firebase serveではなくgatsby developでFirebaseの機能を使ったテストができる
```
gatsby develop
```
