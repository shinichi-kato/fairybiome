import React, { useContext } from "react";
import { navigate } from "gatsby";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { FirebaseContext } from "../Firebase/FirebaseProvider";

export default function SettingsMenu(props) {
  const fb = useContext(FirebaseContext);

  function handleSignOut() {
    fb.signOut();
    props.handleClose();
  }

  function handleUserSettings() {
    props.handleClose();
    navigate("/fairybiome/UserSettings");
  }

  return (
    <Menu
      anchorEl={props.anchorEl}
      id="settings-menu"
      onClose={props.handleClose}
      open={props.open}
    >
      <MenuItem onClick={handleUserSettings}>ユーザ設定</MenuItem>
      <MenuItem onClick={handleSignOut}>サインアウト</MenuItem>
    </Menu>
  );
}
