import Part from './part.jsx';
import {localStorageIO} from './localStorageIO';

export default class BiomeBot {
  constructor(){
    // 書誌的事項(会話中に変化しない)
    this.config = {
      id : "",
      displayName: "",
      updatedAt : null,
      creator: null,
      photoURL : null,
      description : null,
      hubBehavior: {
        availability: 0.3,
        generosity: 0.9,
        retention: 0.6,
      },
    };
    
    // 単語辞書(大きいので分離)
    this.wordDict={empty:true}

    // パート本体(大きいので分離)
    this.parts={empty:true};

    // 会話中の動的な状態を記述する項目
    this.state={
      partOrder:[],
      activeInHub: false,
    };
  }

  readObj(obj){
    this.setConfig(obj.config);
    this.wordDict={...obj.wordDict};
    for(part of obj.parts){
      this.parts[part] = new Part(obj.parts[part]);
    }
    delete this.parts['empty'];

    this.state={...obj.state};

  }

  setConfig(obj){
    const b = obj.config.hubBehavior;
    this.config = {
      ...obj.config,
      hubBehavior:{
        availability: parseFloat(b.availability),
        generosity: parseFloat(b.generosity),
        retention: parseFloat(b.retention),
      }
    };
  }


  readLocalStorage(){
    const state = localStorage.getItem('Biomebot.state');
    if(state === null){return false};

    const config = localStorageIO.getJson('Biomebot.config');
    this.config = {
      ...config,
      hubBehavior:{
        availability: parseFloat(config.availability),
        generosity: parseFloat(config.generosity),
        retention: parseFloat(config.retention),       
      }
    };
    
    this.wordDict = localStorageIO.getJson('Biomebot.wordDict');
    
    for(let partName of state.partOrder){
      let part = localStorageIO.getJson(`Biomebot.part[$partName]`);
      this.parts[partName] = new Part(part);
    }
    
    this.state = {...state};
    return true;

  }
  
  upkeepToLocalStorage(){
    // this.stateのみ更新
    localStorageIO.setItem('Biomebot.state',JSON.stringify(this.state));
  }  
  
  dumpToLocalStorage(){
    // 全データの保存
    localStorageIO.setItem('Biomebot.config',JSON.stringify(this.config));
    localStorageIO.setItem('Biomebot.wordDict',JSON.stringify(this.wordDict));

    for (let partName of this.state.partOrder){
      localStorageIO.setItem(`Biomebot.part[${partName}]`,
      JSON.stringify(this.parts[partName].dump()));
    }

    this.upkeepToLocalStorage();
  }

  
}