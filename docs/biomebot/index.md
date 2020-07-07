---
title: チャットボットエンジン BiomeBot
date: "2020-05-01T22:12:03.284Z"
description: "BiomeBot概要"
---

## 概要

ユーザと日本語でチャットを行うチャットボットのエンジンです。従来のチャットボットは文脈を追うことが不得意で、一問一答形式の会話になりやすいという傾向がありました。これは一つの辞書にあらゆる話題やシチュエーションが混ざったまま記憶させていることが原因です。そこでBiomeBotでは辞書を話題や会話シーンごとに分け、個々が別のチャットボットとして動作しながら発話の主導権を競争的に獲得するという、内的な動作を生物群（バイオーム）に見立てたモデルを用いています。  

BiomeBotでは個々の話題や会話シーンを「パート」と呼びます。パートはそれぞれ異なったアルゴリズムを採用することも可能です。多くのパートは「辞書型チャットボット」の動作をしますが、学習のためのパートはユーザの入力に含まれる「返事を教える言い回し」のパターンを検出するような動作をします。　　
このチャットボットは学習データをクラウド上に保持することが可能で、その場合はバックエンドとしてFirebaseを利用します。バックエンドの使用/不使用は選択することができ、バックエンドを使用している場合は学習機能のON/OFFを選択することができます。

また辞書の検索にはTFIDFを拡張した重み付けとNaive-Bayes法を組み合わせたテキスト検索を行います。辞書が大きくなると検索のための計算に時間がかかるようになるため、それらの計算にはWebWorkerを使用します。

以上をまとめると、このチャットボットは以下のような機能があります。

1. 複数の会話辞書を持つことができ、それぞれが競争的に動作することで話題の遷移を表現できる
1. 会話の中でオウム返し学習も可能
1. Firebaseのfirestoreに対応
1. WebWorkerに対応

## 使用法

``` js
const chatbot = new BiomeBot();

chatbot.readJson(json);

chatbot.promiseReply(user,text)
.then(reply=>{
    console.log(reply.name,":",reply.text)
});

const savedata = chatbot.toJson(dumpDicts=false);

```

## サンプルのチャットボット

``` js
const greetingDict=`
[
    {in:{"こんにちは","こんばんは","おはよう"},
    out:{"こんにちは！!"}},
]
`;

const parrotDict=`
[
    {in:"おおー",out:"すごいでしょ"}
]
`;

const wordDict=`
{
  "{animal}":["犬","猫","ユニコーン"]
}`

export const exampleBot = {
    id: "sampleBot-1.0",
    displayName: "しずく",
    updatedAt: 日付,
    creator: "shinichi-kato",
    photoURL: "bot/crystal.svg",
    description: "サンプルのボット",
    partOrder: ["greeting","dream"],
    hubBehaviorDescriptor:{
        availability: 0.3,
        generosity: 0.9,
        retention: 0.6
    },
    stringifiedWordDict:wordDict,
    parts:{
        greeting:{
            type: "dic",
            behaviorDescriptor:{
                availability: 0.3,
                generosity: 0.9,
                retention: 0.6
            },
            stringifiedDict:greetingDict,
        },
        dream:{
            type: "parrot",
            behaviorDescriptor:{
                availability: 0.3,
                generosity: 0.9,
                retention: 0.6
            },
            stringifiedDict:parrotDict,
        },
    }

}
```

##　辞書型パート

### 辞書型パートの記憶保存形式
辞書は入力した文字列に対して何を返答するかの組み合わせを定義します。

``` json
[
    {
        in:["入力1-1","入力1-2"],
        out:["出力候補1-1","出力候補1-2","出力候補1-3"],
    },
    {
        in:["入力2-1","入力2-2","入力2-3"],
        out:["出力候補2-1"],
    }
]
```

