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
  "{animal}":["犬","猫","ユニコーン"],
  "{me}":["わたし","私","{botName}"],
}`

export const exampleBot = {
  config: {
    id: "sampleBot-1.0",
    displayName: "しずく",
    updatedAt: "Sun Jul 12 2020 13:50:23 GMT+0900",
    creator: "shinichi-kato",
    photoURL: "bot/blueCrystal.svg",
    description: "サンプルのボット",
    hubBehavior:{
        availability: 0.3,
        generosity: 0.9,
        retention: 0.6
    },
  },
  wordDict:wordDict,
  parts:{
    greeting: {
      type: "dic",
      behavior: {
        availability: 0.3,
        generosity: 0.8,
        retention: 0.5,
      },
      dict:[...greetingDict]
    },
    parrot: {
      type: "parrot",
      behavior: {
        availability: 0.3,
        generosity: 0.8,
        retention: 0.5,
      },
      dict:[..parrotDict]
    },
    
  },
  state:{
    partOrder:["greeting","parrot"],
    activeInHub: false,
  },
     
}