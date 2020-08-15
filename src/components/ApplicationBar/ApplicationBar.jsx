import React, { useState } from "react";

import { navigate } from "gatsby";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";

import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import TextsmsIcon from "@material-ui/icons/Textsms";

import SettingsMenu from "./SettingsMenu";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  color: {

  },

}));

export default function ApplicationBar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickSettingsMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  function handleCloseSettingsMenu() {
    setAnchorEl(null);
  }

  function handleClickNavBefore() {
    let navigateDefault = -1;

    if (props.setNavigateBefore) {
      navigateDefault = props.setNavigateBefore();
    }
    navigate(navigateDefault);
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
color="inherit" edge="start"
          onClick={handleClickNavBefore}
        >
          <NavigateBeforeIcon />

        </IconButton>
        <IconButton color="inherit">
          <NavigateNextIcon />
        </IconButton>
        <Typography className={classes.title} variant="h6">
          {props.icon}
          {props.title}
        </Typography>
        {props.busy && <TextsmsIcon />}
        <IconButton color="inherit">
          <MenuBookIcon />
        </IconButton>
        <IconButton
          aria-controls="settings-menu"
          aria-haspopup="true"
          color="inherit"
          edge="end"
          onClick={handleClickSettingsMenu}
        >
          <SettingsOutlinedIcon />
        </IconButton>
        <SettingsMenu
          anchorEl={anchorEl}
          handleClose={handleCloseSettingsMenu}
          open={Boolean(anchorEl)}
        />
      </Toolbar>
    </AppBar>
  );
}
