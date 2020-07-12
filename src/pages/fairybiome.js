import React, {useEffect} from "react"
import { Router } from "@reach/router";

import FirebaseProvider from '../components/Firebase/FirebaseProvider';
import BotProvider from '../components/ChatBot/BotProvider';
import Dashboard from '../components/Dashboard/Dashboard';
import ConfigEditor from '../components/Editor/ConfigEditor';


const isBrowser = () => typeof window !== "undefined";


export default function index(props){

  //------------------------------------------------------------------
  //  body要素のバウンススクロールを無効化

  useEffect(() => {
    if(isBrowser()){
      const handler = (event) => {
        if (handler.event.touches[0].target.tagName.toLowerCase() === "body"){
          event.preventDefault();
        }
      }
  
      window.addEventListener("touchstart",handler);
      window.addEventListener("touchmove",handler);
      window.addEventListener("touchend",handler);
  
      return () => {
        window.removeEventListener("touchstart",handler);
        window.removeEventListener("touchmove",handler);
        window.removeEventListener("touchend",handler);
      }
    }
  },[]);

  return (
    <FirebaseProvider>
      <BotProvider>
        <Router basepath="/fairybiome">
          <Dashboard path="/Dashboard" default/> 
          <ConfigEditor path="/ConfigEditor" />
        </Router>
      </BotProvider>
    </FirebaseProvider>
    
  )
}

/* {location}経由でclient-only-routeにパラメータを渡す場合、
state:{data:{x:12,y:12}}のように一つのデータにパッキングしないとエラーになる場合がある */