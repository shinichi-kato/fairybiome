import React ,{useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import HabitatIcon from "../../icons/Habitat";

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 120,
    height: 120,
    margin: "auto",
  },
  icon: {
    width: 120,
    height: 120,
    margin: "auto",
  },
  nameContainer: {
    margin: "auto",
  },
  name: {
    padding: theme.spacing(0),
    fontSize: 18,
  }

}));

export default function MeetFairy(props){
  const classes = useStyles();

  return (
    <Box 
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box className={classes.iconContainer}>
        <img 
          className={classes.icon}
          src="../../svg/fairy-blank.svg"
        />
      </Box>
      <Box className={classes.nameContainer}>
        <Typography className={classes.name}>
        生息地<HabitatIcon />で
        </Typography>
        <Typography className={classes.name}>
        妖精を見つけよう！
        </Typography>
      </Box>
    </Box>      
  )
}