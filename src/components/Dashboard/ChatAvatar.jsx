import React ,{useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';


const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 140,
    height: 140,
    margin: "auto",
  },
  icon: {
    width: 140,
    height: 140,
    margin: "auto",
  },
  nameContainer: {
    margin: "auto",
  },
  name: {
    padding: theme.spacing(2),
    fontSize: 22,
  }

}));



export default function ChatAvatar(props){
  const classes = useStyles();

  return (
    <Box 
      display="flex"
      flexDirection="column"
      alignItems="center"
      >
      <Box className={classes.iconContainer}>
        <IconButton 
          className={classes.icon}
          onClick={props.handleToChangeAvatar}>
          <img src={`../../svg/${props.icon}`} className={classes.icon} />
        </IconButton>
      </Box>
      <Box className={classes.nameContainer}>
        <Typography className={classes.name}>
          {  props.displayName || "ユーザ名"　}
        </Typography>
      </Box>
    </Box>
  )
}