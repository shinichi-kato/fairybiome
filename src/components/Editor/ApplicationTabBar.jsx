import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));


export default function ApplicationTabBar() {
  const classes = useStyles();

  return(
    <AppBar position="static">
      <Toolbar color="inherit">
        <IconButton 
          edge="start" 
          color="inherit"
        >
          <NavigateBeforeIcon />

        </IconButton>
        <Typography 
          variant="h6" 
          className={classes.title}
        >
          {props.botName}:{props.title}
        </Typography>
        <IconButton 
          edge="end"
          aria-controls="settings-menu" 
          aria-haspopup="true" 
          onClick={handleClickSettingsMenu}
        >
          <SettingsOutlinedIcon />
        </IconButton>
        <SettingsMenu 
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          handleClose={handleCloseSettingsMenu}
        />
      </Toolbar>
      <Tabs>
        <Tab label="基本" />
        <Tab label="単語辞書" />
        <Tab label="パート" />
      </Tabs>
    </AppBar>      
  )