import React ,{createContext,useContext } from "react";
import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot from '../../biomebot/biomebot.jsx';
import {exampleBot} from '../../biomebot/example';

export const BotContext = createContext();

const bot = new BiomeBot();



export default function BotProvider(props){
  const fb = useContext(FirebaseContext);

  useEffect(()=>{
     
    const isLoaded = bot.readLocalStorage();
    if(!isLoaded){
      bot.readObj(exampleBot);
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