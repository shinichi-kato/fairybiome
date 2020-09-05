import React, {useEffect} from "react";
import { Router } from "@reach/router";

import FirebaseProvider from "../components/Firebase/FirebaseProvider";
import BotProvider from "../components/ChatBot/BotProvider";
import Dashboard from "../components/Dashboard/Dashboard";
import UserSettingsDialog from "../components/Dashboard/UserSettingsDialog";
import Editor from "../components/Editor/Editor";
import Home from "../components/ChatRoom/Home";
import Hub from "../components/ChatRoom/Hub";
import Habitat from "../components/ChatRoom/Habitat";

const isBrowser = () => typeof window !== "undefined";

export default function Fairybiome() {
  // ------------------------------------------------------------------
  //  body要素のバウンススクロールを無効化

  useEffect(() => {
    const handler = (event) => {
      if (handler.event.touches[0].target.tagName.toLowerCase() === "body") {
        event.preventDefault();
      }
      return null;
    };
    if (isBrowser()) {
      // const handler = (event) => {
      //   if (handler.event.touches[0].target.tagName.toLowerCase() === "body") {
      //     event.preventDefault();
      //   }
      //   return null;
      // };

      window.addEventListener("touchstart", handler);
      window.addEventListener("touchmove", handler);
      window.addEventListener("touchend", handler);
    }
    return (() => {
      if (isBrowser()) {
        window.removeEventListener("touchstart", handler);
        window.removeEventListener("touchmove", handler);
        window.removeEventListener("touchend", handler);
      }
    });
  }, []);

  return (
    <FirebaseProvider>
      <BotProvider>
        <Router basepath="/fairybiome">
          <Dashboard default path="/Dashboard"/>
          <UserSettingsDialog path="/UserSettings"/>
          <Editor path="/Editor" />
          <Home path="/Home" />
          <Hub path="/Hub" />
          <Habitat path="/Habitat" />
        </Router>
      </BotProvider>
    </FirebaseProvider>
  );
}

/* {location}経由でclient-only-routeにパラメータを渡す場合、
state:{data:{x:12,y:12}}のように一つのデータにパッキングしないとエラーになる場合がある */
