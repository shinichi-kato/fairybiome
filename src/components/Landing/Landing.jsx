import React,{useEffect} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import LogoSvg from "../../../images/svg/logo.svg";


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  logoBox: {
    margin: "30% 5% 10px 5%",
    height: "100%",
  },
  logo: {
    width: "calc(100% - 10%)"
  },
  caption:{
    margin: "10px auto",
  },

  
}));


export default function Index(props){
  const classes = useStyles();
  return (
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box className={classes.logoBox}>
        <LogoSvg className={classes.logo} height="100%"/>
      </Box>
      
    </Box>
  )
}