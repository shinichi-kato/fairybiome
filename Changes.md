Change log
===========

# v 0.30.3
## Changed
* static下のファイル構成を/static/files.jsonファイルとして出力し環境変数化しない変更

# v 0.30.2
## Fixed
* staticを読むAPIを除去

# v 0.30.1
## Fixed
* アバターがemoを反映する修正
* episode.jsonのfactor名修正
* 吹き出しのデザイン修正

## TODO
* 心の声の表示法
* CMS化
  - build後にpublic/index.htmlなどに反映していない問題への対処
  - /static/files.jsonの内容を/public/コピー後も整合的にする対応
  - /chat/[botName] を静的配信可能な構成に変更