import React ,{createContext,useContext,useEffect } from "react";

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot from '../../biomebot/biomebot.jsx';


export const BotContext = createContext();

const bot = new BiomeBot();


export default function BotProvider(props){
  const fb = useContext(FirebaseContext);


  useEffect(()=>{
     
    if(!bot.isLoaded){
      // チャットボットがいなければ、ランダムに初期用のチャットボットをロード
      fetch('/chatbot/example.json')
      .then(res=>res.json())
      .then(data=>{
        bot.readObj(data);
        bot.dumpToLocalStorage();
      })
    }

  },[]);

  return (
    <BotContext.Provider
      value={{
        displayName:bot.config.displayName,
        photoURL:bot.config.photoURL,
        config:bot.config,
        setConfig:bot.setConfig,
        upkeep:bot.upkeepToLocalStorage,
      }}
    >
      {props.children}
    </BotContext.Provider>
  )
}