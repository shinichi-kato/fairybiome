import React ,{createContext,useContext,useEffect } from "react";

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot,{biomebotPostCompile} from '../../biomebot/biomebot.jsx';


export const BotContext = createContext();

const bot = new BiomeBot();


export default function BotProvider(props){
  const fb = useContext(FirebaseContext);

  useEffect(()=>{
    // ローカルに保存されているデータがあればロード
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
        upkeep:bot.upkeepToLocalStorage,
        isVacantInLocalStorage:bot.isVacantInLocalStorage,
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