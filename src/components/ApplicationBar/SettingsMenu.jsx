import React,{useState} from "react";
import {navigate} from 'gatsby';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default function SettingsMenu(props){
  function ToConfig(){
    props.handleClose();
    navigate(to='/fairybiome/ConfigEditor');
  }

  return (
    <Menu
      id="settings-menu"
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={props.handleClose}
    >
      <MenuItem onClick={ToConfig}>チャットボットの設定</MenuItem>
      <MenuItem onClick={props.handleClose}>サインアウト</MenuItem>
    </Menu>
  )
}