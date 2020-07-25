import React ,{createContext,useContext,useEffect } from "react";

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot from '../../biomebot/biomebot.jsx';


export const BotContext = createContext();

const bot = new BiomeBot();


export default function BotProvider(props){
  const fb = useContext(FirebaseContext);

  useEffect(()=>{
    // ローカルに保存されているデータがあればロード
    if(!bot.isLoaded())
    bot.readLocalStorage();
  },[]);

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
 
  return (
    <BotContext.Provider
      value={{
        displayName:bot.config.displayName,
        photoURL:bot.config.photoURL,
        config:bot.config,
        setConfig:bot.setConfig,
        state:bot.state,
        
        upkeep:bot.upkeepToLocalStorage,
        isVacantInLocalStorage:bot.isVacantInLocalStorage,
        isFairyYoung:bot.isFairyYoung,
        loadGuestFromObj:loadGuestFromObj,
        loadBuddyFromObj:loadBuddyFromObj,
        deployLocal:handleDeployLocal,
        reply:bot.reply,
      }}
    >
      {props.children}
    </BotContext.Provider>
  )
}