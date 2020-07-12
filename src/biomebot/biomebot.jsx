import Part from './part.jsx';
import BiomeBotIO from './biomebotIO.jsx';
import {random} from 'mathjs';

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
        // ここでコンパイル
        this.reply = (name,text) => {
          this.upkeepToLocalStorage();
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
}