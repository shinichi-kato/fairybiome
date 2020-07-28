import {random, re} from 'mathjs';
import BiomeBotIO from './biomebotIO.jsx';


export default class BiomeBot extends BiomeBotIO {
  constructor(){
    super();

    // fairybiomeのシステム用word(必須)
    this.wordDict={
      // 共通 commons
      '{!NOT_FOUND}':[""],
      '{!HELLO}':[""],
      '{!BOT_JUST_BORN}':[""], // 生まれたばかりでユーザに出会った
      '{!BOT_NAME_ME}':[""],  // ユーザに名前をつけてもらう
      '{!ACCEPT_BUDDY_FORMATION}':[""], // 妖精が仲間になるのを承諾した
      '{!REJECT_BUDDY_FORMATION}':[""], // 妖精が仲間になるのを断った
      '{!IGNORE_BUDDY_FORMATION}':[""], // 妖精がすでに仲間になっている
      '{!BOT_IS_DYING}':[""], // 妖精が消滅する
      
      // 行動 actions
      '{!BOT_WILL_SPLIT}':[""], // 別行動する
      '{!BOT_WILL_JOIN}':[""],  // 合流する
      '{!BOT_MEETS_YOU}':[""],  // 別行動中にユーザに出会った
      '{!BOT_ACCEPT_SUMMON}':[""], // 呼び出しに応じた

      // Learnerパート用 learner
      '{!TELL_ME_WHAT_TO_SAY}':[""],
      '{!PARSE_USER_INPUT}':[""],
      '{!I_GOT_IT}':[""],
      '{}':[""],
    };

    if(!this.isLoaded()){
      this.readLocalStorage();
    }    
  
  }

  
  reply = (x,y) => {
    switch(this.state.buddy){
      case 'home': 
        return this.homeReply(x,y);
      case 'habitat':
        return this.habitatReply(x,y);
      case 'hub':
        return this.hubReply(x,y);
      default:
        return this.defaultReply(x,y);
    }
  }

  deployLocal = (userName) => {
    return new Promise(resolve => {

      /* homeまはたhub用のモードの起動
        localStorageにある妖精データを使用する。
        データがない場合、またはstate.siteがnoneであればbotは一切反応しない。
        state.buddyが現在地でなければ「呼んだら来る」モードで起動。
        homeであれば通常の起動。

        ■バディ結成の無効化
        Homeには自分のバディになっている妖精しか存在しない。
        Hubでは他の誰かのバディになっている妖精と会話をする場合がある。
        どちらであっても全ての{!ACCEPT_BUDDY_FORMATION}や{!REJECT_BUDDY_FORMATION}は無効で、
        {!IGNORE_BUDDY_FORMATION}が代わりに実行される。

        ■単独行動中のバディの呼び出し
        HomeとHabitatではバディの妖精が単独行動していて現在地にいない場合妖精は返事をしない。
        妖精が不在でもユーザが呼びかけて{!BOT_ACCEPT_SUMMON}が評価された場合、1d100がHPよりも大きければ
        妖精は姿を見せてstate.buddyがfollowに戻る。すでに現在地に妖精がいる場合には
        {!BOT_ACCEPT_SUMMON}は何も効果を持たない


      */ 

      switch(this.state.buddy){
        case 'home':{
          // homeにbuddyがいる・・・通常起動
          // 各パートのコンパイル
          this.tagKeys= Object.keys(this.wordDict);
          
          Promise.all(this.state.partOrder.map(partName=>(
            this.parts[partName].compile()
          ))).then(messages=>{
            console.log("parrot",this.parts.parrot)
          });


          this.wordDict['{PREV_USER_INPUT}'] ="・・・";
          this.wordDict['{RESPONSE}'] = "・・・";

          console.log("home used")
          
        }
        case 'habitat':{
          // buddyが現在地にいない・・・「呼んだら来る」モード
          

        }
        default :{
          // buddyがいない・・・無反応
          
        }
      } 
    return resolve();
  })};

  deployHabitat = () =>{
    /* habitatモードの起動
      habitatのデータはcloud上からメモリにダウンロードし、localStorageには
      保存しない。
      妖精の選択時、state.buddyがhabitatな妖精しか選べない。
     */
  };


  homeReply = (userName,userInput) => {
    return new Promise(resolve => {


      let reply ;

      for(let partName of this.state.partOrder){
        console.log(partName)
        //返答の生成を試みる
        reply = this.parts[partName].replier(userName,userInput,this.state,this.wordDict)
        console.log(reply)
        if(reply.text === "") { continue }


        // queueに追加
        this.state.queue = [this.state.queue,...reply.queue];


        if(reply.ordering === "top"){
          // このパートを先頭に
          this.state.partOrder.slice(i,1);
          this.state.partOrder.unshift(partName);
          // partOrderの順番を破壊したのでループを抜ける
          break;
        }

        if(reply.ordering === 'bottom'){
          // このパートを末尾に
          this.state.partOrder.slice(i,1);
          this.state.partOrder.push(partName);
          // partOrderの順番を破壊したのでループを抜ける
          break;
        }

        break;
      }

      if(reply.text === ""){
        reply.text ="{NotFound}"
      }

      reply.text = this.untagifyNames(reply.text,userName);
      reply.text = this.untagify(reply.text);

      this.upkeepToLocalStorage();
      this.wordDict['{RESPONSE}'] = reply.text;
      this.wordDict['{PREV_USER_INPUT}'] = userInput;
      return resolve({
        displayName:this.config.botName,
        photoURL:this.config.photoURL,
        text:reply.text,
      })
    })
  }

  
  
  
  habitatReply = (name,text) => {
    /*
      Habitatでの挙動
      Habitatにはユーザのバディになっている妖精とそうでない妖精がいる。
      
      ■ユーザのバディではない妖精
      ユーザにバディがいない状態であれば、妖精に話しかけてバディにできる可能性がある。
      会話の中で{!ACCEPT_BUDDY_FORMATION}が評価された場合、1d100が妖精のHPよりも大きければ
      妖精はバディになる。そうでなければ{!IGNORE_BUDDY_FORMATION}が代わりに実行される。
      妖精が生まれたばかりであればユーザが名前をつける。それまでは「生まれたばかりの妖精」
      という仮の名前がついている。
      会話が不調であれば{!REJECT_BUDDY_FORMATION}が評価される場合もある。その場合は妖精は
      {!BYE}を実行してどこかに言ってしまう。Habitatでは妖精の設定は変更できず、
      localStorageに保存はされないが、言葉を教えることはできる。
      
      
      ■ユーザのバディになっている妖精
      単独行動中の妖精と生息地で偶然出会う場合がある。このときは挨拶としてまず{!BOT_MEET_YOU}が
      実行される。それ以外の会話はHOMEと変わらない。{!ACCEPT_BUDDY_FORMATION}や
      {!REJECT_BUDDY_FORMATION}は無視され、代わりに{!IGNORE_BUDDY_FORMATION}が展開される。
            
      それ以外の妖精との会話は通常と変わりない。
      */
    return new Promise((resolve,reject)=>{
      
      if(this.config.hubBehavior.availability > random()){
        // ここで名前の呼びかけとかだけキャッチしたい
        //
        // 帰ってくる
        this.state.queue=['{!I_AM_COMMING_BACK}'];
        this.upkeepToLocalStorage();
        // クラウド上の妖精データのstate.buddyも書き換える
        this.deployHome();
    }
    resolve();
  })}





  hubReply = (name,text)=>{
    return new Promise(resolve => {
      resolve({displayName:"",text:""});})
  }






  
  tagifyNames = (text,userName) => {
    /* ユーザ発言に含まれるユーザ名、ボット名を{userName},{botName}に置き換える */
    text = text.replace(new RegExp(`${this.displayName}ちゃん`,"g"),"{botName}");
    text = text.replace(new RegExp(`${this.displayName}さん`,"g"),"{botName}");
    text = text.replace(new RegExp(`${this.displayName}君`,"g"),"{botName}");
    text = text.replace(new RegExp(this.displayName,"g"),"{botName}");
    text = text.replace(new RegExp(userName,"g"),"{userName}");
    return text;
  }

  untagifyNames = (text,userName) => {
    /* ユーザ発言やボットの発言に含まれる{userName},{botName}を戻す */
    text = text.replace(/{botName}/g,this.displayName);
    text = text.replace(/{userName}/g,userName);
    return text;

  }

  untagify(text){
    /* messageに含まれるタグを文字列に戻す再帰的処理 */
    if(text){
      for (let tag of this.tagKeys){
        if(text.indexOf(tag) !== -1){
          text = text.replace(/(\{[!a-zA-Z0-9_]+\})/g,(whole,tag)=>(this._expand(tag)));
        }
      }
    }
    return text;
  }
    
 

  _expand(tag){
    const items = this.wordDict[tag];
    if(!items){ return tag}
   let item = items[Math.floor( Math.random() * items.length)];
    
    item = item.replace(/(\{[!a-zA-Z0-9_]+\})/g,(whole,tag)=>(this._expand(tag))
    )
    return item
  }

 
}  

// export const biomebotPostCompile = (currentBot) => {
//   switch(currentBot.state.buddy){
//     case 'home' :{
//       currentBot.reply = (x,y) => currentBot.homeReply(x,y);
//       break;
//     }
//     case 'habitat' :{
//       currentBot.reply = (x,y) => currentBot.habitatReply(x,y);
//       break;
//     }
//     case 'hub' :{
//       currentBot.reply = (x,y) => currentBot.hubReply(x,y);
//       break;
//     }
//     default : {
//       currentBot.reply = (x,y) => currentbot.homeReply(x,y);
//     }
//   }
// }
