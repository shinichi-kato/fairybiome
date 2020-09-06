import React, { useContext } from "react";
import { navigate } from "gatsby";
import UserSettings from "./UserSettings";
import { FirebaseContext } from "../Firebase/FirebaseProvider";

export default function UserSettingsDialog() {
  const fb = useContext(FirebaseContext);

  function setNavigateBefore() {
    /* 戻るボタンを押したときの動作を記述し、戻り先アドレスを返す */
    return ("/fairybiome/Dashboard");
  }

  function handleChangeUserInfo(displayName, photoURL) {
    fb.changeUserInfo(displayName, photoURL);
    navigate("/fairybiome/Dashboard");
  }

  return (
    <UserSettings
      displayName={fb.displayName}
      handleChangeUserInfo={handleChangeUserInfo}
      photoURL={fb.photoURL}
      setNavigateBefore={setNavigateBefore}
    />
  );
}
