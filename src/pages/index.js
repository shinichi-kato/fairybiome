import React, {useEffect} from "react"
import { Router } from "@reach/router";

import FirebaseProvider from '../components/Firebase/FirebaseProvider';
import Dashboard from '../components/Dashboard/Dashboard';

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
      <Router >
        <Dashboard path="/dashboard" default/> 

      </Router>
    </FirebaseProvider>
    
  )
}