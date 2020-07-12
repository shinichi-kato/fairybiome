import React ,{useState,useContext} from "react";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  logoBox: {
    margin: "50px 5%",
  },
  logo: {
    width: "calc(100% - 10%)"
  },
  caption:{
    margin: "10px auto",
  },
  homeButton: {
    width: 180,
    height: 180,
    margin: 'auto',
    padding: 'auto 10',
    borderRadius: '0% 100% 100% 0% / 100% 100% 0% 0% ',
    backgroundColor: theme.palette.primary.main
  },
  hubButton: {
    width: 180,
    height: 180,
    margin: 'auto',
    padding: 'auto 10',
    borderRadius: '100% 0% 0% 100% / 100% 100% 0% 0% ',
    backgroundColor: theme.palette.primary.main,
  },
  
}));

export default function Main(props){
  const classes = useStyles();
  const userDisplayName=props.user.displayName;
  const userPhotoURL = props.user.photoURL;
  const botDisplayName=props.bot.displayName;
  const botPhotoURL=props.bot.photoURL;

  return(
    <></>
  )
}