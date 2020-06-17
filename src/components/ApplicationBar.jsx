import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';



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


export default function ApplicationBar(props){
  const classes = useStyles();
  
  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        <IconButton edge="start"className={classes.menuButton}>
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton>
          <NavigateNextIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          {props.icon}
          {props.title}
        </Typography>
        <IconButton >
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
};