import React, { useContext } from "react";
import { navigate } from "gatsby";
import { makeStyles } from "@material-ui/core/styles";
import UserSettings from "./UserSettings";
import { FirebaseContext } from "../Firebase/FirebaseProvider";

const useStyles = makeStyles((theme) => ({
  rootWhoseChildUsesFlexGrow: {
    width: "100%",
    height: "100vh",
    // backgroundImage: "url(../images/landing-bg.png)",
    // backgroundPosition: "center bottom",
  },
  content: {
    padding: theme.spacing(2)
  }
}));

export default function UserSettingsDialog() {
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const user = fb.user;

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
      displayName={user.displayName}
      handleChangeUserInfo={handleChangeUserInfo}
      photoURL={user.photoURL}
      setNavigateBefore={setNavigateBefore}
    />
  );
}
