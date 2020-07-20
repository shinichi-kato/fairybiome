import {random, re} from 'mathjs';
import BiomeBotIO from './biomebotIO.jsx';


export default class BiomeBot extends BiomeBotIO {
  constructor(){
    super();

    
  
  }

  
  reply = (x,y) => {
    switch(this.currentSite){
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
        localStorageにある妖精データを読み込む。
        データがない場合、またはcurrentSiteがvoidであればbotは一切反応しない。
        currentSiteがhabitatであれば「呼んだら来る」モードで起動。
        homeであれば通常の起動。
      */ 

      switch(this.currentSite){
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
          // buddyがhabitatにいる・・・「呼んだら来る」モード
          

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
      妖精の選択時、currentSiteがhabitatな妖精しか選べない。
     */
  };


  homeReply = (userName,userInput) => {
    return new Promise(resolve => {


      let reply ;

      for(let partName of this.state.partOrder){
        console.log(partName)
        //返答の生成を試みる
        reply = this.parts[partName].replier(userName,userInput,this.state)
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
      console.log("config",this.config)
      return resolve({
        displayName:this.config.botName,
        photoURL:this.config.photoURL,
        text:reply.text,
      })
    })
  }

  
  
  
  habitatReply = (name,text) => {
    return new Promise((resolve,reject)=>{
      if(this.config.hubBehavior.availability > random()){
        // ここで名前の呼びかけとかだけキャッチしたい
        //
        // 帰ってくる
        this.state.queue=['{!I_AM_COMMING_BACK}'];
        this.upkeepToLocalStorage();
        // クラウド上の妖精データのcurrentSiteも書き換える
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
//   switch(currentBot.currentSite){
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
