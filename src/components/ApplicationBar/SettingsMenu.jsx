import React,{useState} from "react";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default function SettingsMenu(props){
  return (
    <Menu
      id="settings-menu"
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={props.handleClose}
    >
      <MenuItem onClick={props.handleClose}>サインアウト</MenuItem>
    </Menu>
  )
}