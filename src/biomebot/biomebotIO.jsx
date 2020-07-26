import Part from './part.jsx';
import {localStorageIO} from './localStorageIO';

export default class BiomeBotIO {
  constructor(){
    // 書誌的事項(会話中に変化しない)
    this.config = {
      trueName : "",
      firstUser: "",
      buddyUser: "",
      displayName: null,
      updatedAt : null,
      photoURL : null,
      description : null,
      defaultPartOrder:[],
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

    // "home":Homeにいる
    // "habitat":Habitatにいる
    // "void":削除された
    // null:ロードされていない
    this.currentSite="unloaded";
  }

  isLoaded = () => {
    return this.currentSite ==="home" || this.currentSite === "habitat";
  };

  isVacantInLocalStorage = () => {
    return localStorageIO.getItem('Biomebot.state',false) === false;
  };

  isFairyYoung = () => {
    return this.displayName === "";
  }


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
    localStorageIO.setItem('Biomebot.config',JSON.stringify(this.config));
    
    console.log("setConfig:",this.config);

  };

  setWordDict = (wordDict) => {
    this.wordDict= {...wordDict};
    localStorageIO.setItem('Biomebot.wordDict',JSON.stringify(this.wordDict));
  }

  readObj = (obj) => {
    this.setConfig(obj.config);
    this.wordDict={...obj.wordDict};

    const partNames = Object.keys(obj.parts);
    for(let part of partNames){
      this.parts[part].readObj(obj.parts[part]);
    }
    delete this.parts['empty'];

    this.state={
      ...obj.state,
      partorder:[...obj.config.defaultPartOrder],
    };
    this.currentSite=`${obj.currentSite}`;
    localStorageIO.setItem('Biomebot.config',JSON.stringify(this.config));
    
    console.log("readObj",obj)
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
      if(this.parts[partName]){
        this.parts[partName].readObj(part);
      }else{
        this.parts[partName] = new Part(part);
      }
    }
    
    this.state = {...state};
    this.currentSite = localStorageIO.getItem('Biomebot.currentSite');
    console.log("readlocal",this.config)
    return true;

  };
  
  upkeepToLocalStorage = () => {
    // this.stateとthis.currentSiteのみ更新
    localStorageIO.setItem('Biomebot.state',JSON.stringify(this.state));
    localStorageIO.setItem('Biomebot.currentSite','home');
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
    localStorageIO.setItem('Biomebot.currentSite',this.currentSite);
  };

  
}