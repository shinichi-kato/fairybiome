import React from 'react';
import {navigate} from 'gatsby';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import MenuBookIcon from '@material-ui/icons/MenuBook';

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


export default function ApplicationTabBar(props) {
  const classes = useStyles();

  function handleChangePage(event,newValue){
    props.handleChangePage(newValue);
  }

  function handleExit(){
    props.handleChangePage('exit');
  }

  return(
    <AppBar position="static">
      <Toolbar color="inherit">
        <IconButton 
          edge="start" 
          color="inherit"
          onClick={handleExit}
        >
          <NavigateBeforeIcon />

        </IconButton>
        <Typography 
          variant="h6" 
          className={classes.title}
        >
          {props.botName}
        </Typography>
        <IconButton 
          edge="end"
          color="inherit"
        >
           <MenuBookIcon />
        </IconButton>

      </Toolbar>
      <Tabs value={props.page}
        onChange={handleChangePage} 
        aria-label="editor tabs" >
        <Tab 
          value="config" 
          label="基本" 
          id="editor-tab-0"
          aria-controls="editor-tabpanel-0"/>
        <Tab 
          value="wordDict" 
          label="単語辞書" 
          id="editor-tab-1"
          aria-controls="editor-tabpanel-1"/>
        <Tab 
          value="part" 
          label="パート" 
          id="editor-tab-2"
          aria-controls="editor-tabpanel-2"/>
        <Tab 
          value="misc" 
          label="その他" 
          id="editor-tab-3"
          aria-controls="editor-tabpanel-3"/>
      </Tabs>
    </AppBar>      
  )
}