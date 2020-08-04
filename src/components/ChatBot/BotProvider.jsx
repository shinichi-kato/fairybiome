import React ,{createContext,useContext,useEffect } from "react";

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot from '../../biomebot/biomebot.jsx';


export const BotContext = createContext();

const bot = new BiomeBot();


export default function BotProvider(props){
  const fb = useContext(FirebaseContext);




  function handleDeployHome(){
    const fairy = bot.getFairyFromLocalStorage();
    return bot.deploy(fb.user.displayName,fairy,"home");
  }

  function handleDeployHabitat(fairy){
    return bot.deploy(fb.user.displayName,fairy,"habitat");
  }

  function handleDeployHub(){
    const fairy = bot.getFairyFromLocalStorage();
    return bot.deploy(fb.user.displayName,fairy,"habitat");
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
        getBuddyState:bot.getBuddyState,
        dumpToLocalStorage:bot.dumpToLocalStorage,
        isVacantInLocalStorage:bot.isVacantInLocalStorage,
        isFairyYoung:bot.isFairyYoung,
        deployHome:handleDeployHome,
        deployHabitat:handleDeployHabitat,
        deployHub:handleDeployHub,
        replyHome:bot.replyHome,
        replyHub:bot.replyHub,
        replyHabitat:bot.replyHabitat,
      }}
    >
      {props.children}
    </BotContext.Provider>
  )
}