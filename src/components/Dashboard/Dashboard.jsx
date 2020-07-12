import React ,{useState,useContext} from "react";

import UserSettings from './UserSettings';
import DownloadYoungFairy from './DownloadYoungFairy';
import Main from './Main';

import {FirebaseContext} from '../Firebase/FirebaseProvider';
import {BotContext} from '../ChatBot/BotProvider';

export default function Dashboard(props){
  /*
    新規ユーザはUserSetting→BotSettingののちメイン画面へ。
    メイン画面ではhome,hub,cloudほかへのアクセスを提供。

    新規ユーザはphotoURLとdisplayNameがない。
    また新規ユーザは過去にダウンロードしたボットがないため、
    bot.stateが存在しない。
  */

  const fb = useContext(FirebaseContext);
  const bot = useContext(BotContext);
  const user = fb.user;

  function handleChangeUserInfo(displayName,photoURL){
    fb.changeUserInfo(displayName,photoURL)
  }

  function handleDownload(obj){
    bot.loadBuddyFromObj(obj)

  }

  return (
    <>
      { 
        (user.displayName === "" && user.photoURL === "") && 
        <UserSettings 
          displayName={user.displayName}
          photoURL={user.photoURL}
          handleChangeUserInfo={handleChangeUserInfo}
        />
        || bot.isVacantInLocalStorage() &&
        <DownloadYoungFairy 
          userName={user.displayName}
          handleDownload={handleDownload}
        />
        ||
        <Main 
          user={user}
          bot={bot}
        />
      }
    </>
  )
}