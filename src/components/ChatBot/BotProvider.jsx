import React ,{createContext,useContext,useState } from "react";

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
      }}
    >
      {props.children}
    </BotContext.Provider>
  )
}