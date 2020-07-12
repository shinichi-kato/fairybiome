import Part from './part.jsx';
import {localStorageIO} from './localStorageIO';

export default class BiomeBot {
  constructor(){
    const isLoaded = this.readLocalStorage();
    if(isLoaded) { return; }
    
    // 書誌的事項(会話中に変化しない)
    this.config = {
      trueName : "",
      firstUser: "",
      buddyUser: "",
      displayName: "",
      updatedAt : null,
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

    // home/habitat/void
    this.whereabouts="void";
  }

  isLoaded = () => {
    return this.config === "";
  };

  isVacantInLocalStorage = () => {
    return localStorageIO.getItem('Biomebot.state',false) === false;
  };



  setConfig = (config) => {
    const b = config.hubBehavior;
    this.config = {
      ...config,
      hubBehavior:{
        availability: parseFloat(b.availability),
        generosity: parseFloat(b.generosity),
        retention: parseFloat(b.retention),
      }
    };
  };

  readObj = (obj) => {
    this.setConfig(obj.config);
    this.wordDict={...obj.wordDict};

    const partNames = Object.keys(obj.parts);
    for(let part of partNames){
      this.parts[part] = new Part(obj.parts[part]);
    }
    delete this.parts['empty'];

    this.state={...obj.state};
    this.whereabouts=`${obj.whereabouts}`;

  };

  readLocalStorage = () => {
    const state = localStorageIO.getJson('Biomebot.state');
    if(state === null){return false};
    
    const config = localStorageIO.getJson('Biomebot.config');
    this.config = {
      ...config,
      hubBehavior:{
        availability: parseFloat(config.hubBehavior.availability),
        generosity: parseFloat(config.hubBehavior.generosity),
        retention: parseFloat(config.hubBehavior.retention),       
      }
    };
    
    this.wordDict = localStorageIO.getJson('Biomebot.wordDict');
    this.parts = {empty:false};
    for(let partName of state.partOrder){
      let part = localStorageIO.getJson(`Biomebot.part[${partName}]`);
      this.parts[partName] = new Part(part);
    }
    
    this.state = {...state};
    this.whereabouts = localStorageIO.getItem('Biomebot.whereabouts');

    return true;

  };
  
  upkeepToLocalStorage = () => {
    // this.stateとthis.whereaboutsのみ更新
    localStorageIO.setItem('Biomebot.state',JSON.stringify(this.state));
    localStorageIO.setItem('Biomebot.whereabouts','home');
  };
  
  dumpToLocalStorage = () => {
    // 全データの保存
    localStorageIO.setItem('Biomebot.config',JSON.stringify(this.config));
    localStorageIO.setItem('Biomebot.wordDict',JSON.stringify(this.wordDict));

    for (let partName of this.state.partOrder){
      localStorageIO.setItem(`Biomebot.part[${partName}]`,
      JSON.stringify(this.parts[partName].dump()));
    }

    this.upkeepToLocalStorage();
    localStorageIO.setItem('Biomebot.whereabouts',this.whereabouts);
  };

  
}