import {random} from 'mathjs';
import BiomeBotIO from './biomebotIO.jsx';
import Part from './part.jsx';


export default class BiomeBot extends BiomeBotIO {
  constructor(){
    super();
    this.reply = (name,text)=>({displayName:"",text:""})
  }



  deployLocal = () => {
    /* homeまはたhub用のモードの起動
      localStorageにある妖精データを読み込む。
      データがない場合、またはwhereaboutsがvoidであればbotは一切反応しない。
      whereaboutsがhabitatであれば「呼んだら来る」モードで起動。
      homeであれば通常の起動。
    */ 
    this.readLocalStorage();
    switch(this.whereabouts){
      case 'home':{
        // homeにbuddyがいる・・・通常起動
        // 各パートのコンパイル
        this.tagKeys= Object.keys(this.wordDict);

        for (let partName of this.parts) {
          this.parts[partName].compile()
        }
        this.wordDict['{PREV_USER_INPUT}'] ="・・・";
        this.wordDict['{RESPONSE}'] = "・・・";


        this.reply = (userName,userInput) => {
          let reply ;

          for(let i in this.state.partOrder){
            let partName = this.state.partOrder[i];

            //返答の生成を試みる
            reply = this.part[partName].replier(userInput,userName,this.state)
            
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


          reply.text = untagifyNames(reply.text,userName);
          reply.text = untagify(reply.text);

          this.upkeepToLocalStorage();
          this.wordDict['{RESPONSE}'] = reply.text;
          this.wordDict['{PREV_USER_INPUT}'] = userInput;

          return {
            botName:this.config.botName,
            text:reply.text
          }
        }
      }
      case 'habitat':{
        // buddyがhabitatにいる・・・「呼んだら来る」モード
        this.reply = (name,text) => {
          if(this.config.hubBehavior.availability > random()){
            // ここで名前の呼びかけとかだけキャッチしたい
            //
            // 帰ってくる
            this.state.queue=['{!I_AM_COMMING_BACK}'];
            this.upkeepToLocalStorage();
            // クラウド上の妖精データのwhereaboutsも書き換える
            this.deployHome();

          }
        }

      }
      default :{
        // buddyがいない・・・無反応
        this.reply = (name,text)=>({displayName:"",text:""})

      }
    } 
    
  };

  deployHabitat = () =>{
    /* habitatモードの起動
      habitatのデータはcloud上からメモリにダウンロードし、localStorageには
      保存しない。
      妖精の選択時、whereaboutsがhabitatな妖精しか選べない。
     */
  };




  tagifyNames = (text,userName) => {
    /* ユーザ発言に含まれるユーザ名、ボット名を{userName},{botName}に置き換える */
    text = text.replace(new RegExp(`${this.displayName}ちゃん`,"g"),"{botName}");
    text = text.replace(new RegExp(`${this.displayName}さん`,"g"),"{botName}");
    text = text.replace(new RegExp(`${this.displayName}君`,"g"),"{botName}");
    text = text.replace(new RegExp(this.displayName,"g"),"{botName}");
    text = text.replace(new RegExp(userName,"g"),"{userName}");
    return text;
  }

  untagifyNames = (text,usrName,botName) => {
    /* ユーザ発言やボットの発言に含まれる{userName},{botName}を戻す */
    text = text.replace(/{botName}/g,this.displayName);
    text = text.replace(/{userName}/g,message.displayName);
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
