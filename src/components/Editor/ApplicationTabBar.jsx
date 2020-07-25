import React from 'react';
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
          {props.botName}
        </Typography>
        <IconButton 
          edge="end"
        >
           <MenuBookIcon />
        </IconButton>

      </Toolbar>
      <Tabs value={props.value}
        onChange={handleChangePage} >
        <Tab value="config" label="基本" />
        <Tab value="wordDict" label="単語辞書" />
        <Tab value="part" label="パート" />
        <Tab value="misc" label="その他" />
      </Tabs>
    </AppBar>      
  )
}