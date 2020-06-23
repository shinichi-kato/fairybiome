import React,{useEffect,useContext,useState} from "react";
import {FirebaseContext} from "gatsby-plugin-firebase";
import ApplicationBar from "../components/ApplicationBar";

import './index.css';

export default function Application(props){
  const firebase = useContext(FirebaseContext);
  const [userId,serUserId]

  //------------------------------------------------------------------
  //  body要素のバウンススクロールを無効化

  useEffect(() => {
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
  },[]);
  
  return (
    <ApplicationBar />
  )
}