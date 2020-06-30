import React ,{createContext,useContext } from "react";
import localStorageIO from '../../utils/localStorageIO';
import {FirebaseContext} from '../Firebase/FirebaseProvider';
import BiomeBot from '../../chatbot/biomebot.jsx';

export const BotContext = createContext();

const bot = new BiomeBot();



export default function BotProvider(props){
  // const fb = useContext(FirebaseContext);

  useEffect(()=>{
    // 
    bot.setParam({
      main:localStorageIO.reasJson('bot.main'),
      parts:localStorageIO.readJson('bot.parts'),
      memory:localStorageIO.readJson('bot.memory'),
    })
  },[]);


  function getMain(){ return {...bot.main}; }
  function setMain(props){ bot.setParam(props); }

  return (
    <BotContext.Provider
      value={{
        main:getMain,
        setMain:setMain,
      }}
    >
      {props.children}
    </BotContext.Provider>
  )
}