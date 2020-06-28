import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import LogoSvg from "../../../images/svg/logo.svg";
import HomeIcon from "../../icons/Home";
import HubIcon from "../../icons/HubFairies";
import ApplicationBar from '../ApplicationBar/ApplicationBar';


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
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


export default function Dashboard(props){
  const classes = useStyles();
  return (
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box>
        <ApplicationBar
          title="Dashboard"
        />
      </Box>
      <Box className={classes.logoBox}>
        <LogoSvg className={classes.logo} height="100%"/>
      </Box>

      <Box flexGrow={1}>

      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box>
          <Button className={classes.homeButton}>
            <HomeIcon style={{fontSize:90}} />
          </Button>
        </Box>
        <Box>
          <Button className={classes.hubButton}>
            <HubIcon style={{fontSize:90}} />
          </Button>
        </Box>
      </Box>   
    </Box>
  )
}