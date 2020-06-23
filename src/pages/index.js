import React,{useEffect} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Box from '@material-ui/core/Box';
import LogoSvg from "../../images/svg/logo.svg";
import HomeIcon from "../icons/Home";
import HubFairiesIcon from "../icons/HubFairies";


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundImage: "url(../images/landing-bg.png)",
    backgroundPosition: "center bottom",
  },
  logoBox: {
    margin: "2% 5% 10px 5%",
    height: "100%",
  },
  logo: {
    width: "calc(100% - 10%)"
  },
  caption:{
    margin: "10px auto",
  }
  
}));


export default function Index(props){
  const classes = useStyles();
  return (
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
    >
      <Box className={classes.logoBox}>
        <LogoSvg className={classes.logo} height="100%"/>
      </Box>
      <Box className={classes.caption}>
        <Typography variant="body1">
          妖精チャットボットが住んでいる<br/>
          ちょっと不思議なチャットスペース
        </Typography>

      </Box>
      <Box display="flex" flexDirection="row"
        className={classes.caption}
      >
        <Box>
          <HomeIcon fontSize="large"/>
        </Box>
        <Box>
          <Typography>
            自分だけの妖精チャットボットを<br/>育てよう
          </Typography>
        </Box>
      </Box>
      <Box display="flex" 
        flexDirection="row" 
        flexGrow={1}
        className={classes.caption}
      >
        <Box>
          <HubFairiesIcon fontSize="large"/>
        </Box>
        <Box>
          <Typography>
            チャットボットと一緒に<br/>みんなと話そう
          </Typography>
        </Box>
        
      </Box>    
    </Box>
  )
}