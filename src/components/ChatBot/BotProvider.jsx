import React, { createContext, useContext } from "react";

import { FirebaseContext } from "../Firebase/FirebaseProvider";
import BiomeBot from "../../biomebot/biomebot.jsx";

export const BotContext = createContext();

const bot = new BiomeBot();

export default function BotProvider(props) {
  const fb = useContext(FirebaseContext);

  function handleDeployHome() {
    const fairy = bot.getFairyFromLocalStorage();
    return bot.deploy(fb.user.displayName, fairy, "home");
  }

  function handleDeployHabitat(fairy) {
    return bot.deploy(fb.user.displayName, fairy, "habitat");
  }

  function handleDeployHub() {
    const fairy = bot.getFairyFromLocalStorage();
    return bot.deploy(fb.user.displayName, fairy, "habitat");
  }

  function handleSaveConfig(config) {
    bot.setConfig(config, fb.timestampNow());
  }

  function handleSaveWordDict(wordDict) {
    bot.setWordDict(wordDict, fb.timestampNow());
  }

  function handleSavePart(partName, part) {
    if (part) {
      // 追加
      bot.setPart(partName, part, fb.timestampNow());
    } else {
      // 削除
      bot.removePart(partName);
    }
  }

  return (
    <BotContext.Provider
      value={{
        displayName: bot.config.displayName,
        photoURL: bot.config.photoURL,
        ref: bot,
        setConfig: handleSaveConfig,
        setWordDict: handleSaveWordDict,
        setPart: handleSavePart,
        upkeep: bot.upkeepToLocalStorage,
        getBuddyState: bot.getBuddyState,
        dumpToLocalStorage: bot.dumpToLocalStorage,
        isVacantInLocalStorage: bot.isVacantInLocalStorage,
        isFairyYoung: bot.isFairyYoung,
        deployHome: handleDeployHome,
        deployHabitat: handleDeployHabitat,
        deployHub: handleDeployHub,
        replyHome: bot.replyHome,
        replyHub: bot.replyHub,
        replyHabitat: bot.replyHabitat,
      }}
    >
      {props.children}
    </BotContext.Provider>
  );
}
