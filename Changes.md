Change log
===========
# v0.34.0
## Added
* role違いの返答を抑制するためroleにpenaltyを設定

## Fixed
* 辞書調整

# v0.33.0
## Added
* 未知語を出現順に{UNKNOWN_1}、{UNKNOWN_2}...に割り当てる
* 未知語が未取得の場合`それ`にフォールバック

## Fixed
* パートのinnerVoiceが無限連鎖しない改善
* role, targetが特徴量に含まれていなかった点の対処（1-hot vector化）

# v0.32.1
## Fixed
* episodeのemoがoutputまで伝播しない問題の対処
* {you}が復元されない問題の対処
* version表示


# v0.32.0
## Fixed
* ユーザアバターのパス修正
* Retriever.retrieve()に事前計算した特徴量行列が反映されない問題の対処

# v0.31.0
## Fixed
* reframing.episode.jsonでのfactor記述漏れ修正
* Retriever.retrieve()に事前計算した特徴量行列が反映されない問題の対処

## Changed
* {user} {bot}などのencode/decode
* Aurula/avatar/anticipation.svgの変更


## TODO
* 心の声の表示法
* reactivityの実装（contextに含まれるので不要かも）
* user発言をbotが使う際の変形
* {I} {you}などのタグ化
* 昼夜遷移イベント
* ログ学習
* ユーザの元気状態アバター
* common下のtag辞書を有効化
* attentionが効く範囲を強く長く
* スコア表示


# v0.30.4
## Fixed
* .github/workflows/girebase-hosting-merge.ymlの修正

# v0.30.3
## Changed
* static下のファイル構成を/static/files.jsonファイルとして出力し環境変数化しない変更
* 静的サイト化テスト

# v0.30.2
## Fixed
* staticを読むAPIを除去

# v0.30.1
## Fixed
* アバターがemoを反映する修正
* episode.jsonのfactor名修正
* 吹き出しのデザイン修正
