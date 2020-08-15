import React, { useContext } from "react";

import UserSettings from "./UserSettings";
import Main from "./Main";

import { FirebaseContext } from "../Firebase/FirebaseProvider";
import { BotContext } from "../ChatBot/BotProvider";

export default function Dashboard() {
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
  const buddyState = bot.getBuddyState();

  function handleChangeUserInfo(displayName, photoURL) {
    fb.changeUserInfo(displayName, photoURL);
  }

  console.log("<Dashboard />");
  return (
    <div>
      {
        (user.displayName === "" && user.photoURL === "") &&
        <UserSettings
          displayName={user.displayName}
          handleChangeUserInfo={handleChangeUserInfo}
          photoURL={user.photoURL}
        />
        ||
        <Main
          bot={buddyState}
          user={user}
        />
      }
    </div>
  );
}
