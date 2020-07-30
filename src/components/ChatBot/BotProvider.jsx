import React ,{createContext,useContext,useEffect } from "react";

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot from '../../biomebot/biomebot.jsx';


export const BotContext = createContext();

const bot = new BiomeBot();


export default function BotProvider(props){
  const fb = useContext(FirebaseContext);



  function loadGuestFromObj(obj){
    bot.readObj(obj)
  }

  function loadBuddyFromObj(obj){
    bot.readObj(obj);
    bot.dumpToLocalStorage();
  }

  function handleDeployLocal(){
    return new Promise(resolve => {
      if(!bot.isLoaded()){
        bot.readLocalStorage();
      }
      
      bot.deployLocal();
      resolve();
    })
  }
 
  function handleDeployHabitat(){
    return new Promise(resolve =>{
      if(bot.isLoaded){
        bot.deployHabitat();
      }
      resolve();
    })
  }


  function handleSaveConfig(config){
    bot.setConfig(config,fb.timestampNow());
  }

  function handleSaveWordDict(wordDict){
    bot.setWordDict(wordDict,fb.timestampNow());
  }

  
  return (
    <BotContext.Provider
      value={{
        displayName:bot.config.displayName,
        photoURL:bot.config.photoURL,
        ref:bot,
        setConfig:handleSaveConfig,
        setWordDict:handleSaveWordDict,
        upkeep:bot.upkeepToLocalStorage,
        isVacantInLocalStorage:bot.isVacantInLocalStorage,
        isFairyYoung:bot.isFairyYoung,
        readLocalStorage:bot.readLocalStorage,
        loadGuestFromObj:loadGuestFromObj,
        loadBuddyFromObj:loadBuddyFromObj,
        deployLocal:handleDeployLocal,
        deployHabitat:handleDeployHabitat,
        reply:bot.reply,
      }}
    >
      {props.children}
    </BotContext.Provider>
  )
}