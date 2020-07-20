import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

const SHORT_TEXT_LENGTH = 1;

const useStyles = makeStyles(theme => createStyles({
  root: {
    width: '95%',
    margin: 'auto',
  },
  longText: {
    fontSize: 14,
  },
  shortText:{
    fontSize: 32,
  },

  avatar: {
    width: 40,
    height: 40
  },
  leftBalloon : {
    position: 'relative',
    padding: theme.spacing(1),
    borderRadius: 10,
    margin: "6px auto 6px 20px",
    background:  '#D9D7FF',
    display: 'inline-block',
    '&:after':{
      content:'""',
      position: 'absolute',
      borderStyle: 'solid',
      borderWidth: '8px 15px 8px 0',
      borderColor: 'transparent #D9D7FF',
      display: 'block',
      width: 0,
      zIndex:1,
      marginTop:-8,
      left: -15,
      bottom:16
    },
  },
  rightBalloon : {
    position: 'relative',
    padding: theme.spacing(1),
    borderRadius: 10,
    margin: "6px 20px 6px auto",
    background:  '#D9D7FF',
    display: 'inline-block',
    '&:after':{
      content:'""',
      position: 'absolute',
      borderStyle: 'solid',
      borderWidth: '8px 0 8px 15px',
      borderColor: 'transparent #D9D7FF',
      display: 'block',
      width: 0,
      zIndex:1,
      marginTop:-8,
      right: -15,
      bottom: 16,
      }
  }
}));


export function LeftBalloon(props){
  const classes = useStyles();
  const speech = props.speech;


  return (
    <Box key={speech.id}
      display="flex"
      flexDirection="row"
      alignItems="flex-end">
      <Box >
        <Avatar src={`../../svg/${speech.photoURL}`} className={classes.avatar} />
      </Box>
      <Box className={classes.leftBalloon}>
        <Typography variant="subtitle2">{speech.displayName}</Typography>
        <Typography
          className={[...speech.text].length <= SHORT_TEXT_LENGTH ? classes.shortText : classes.longText }
        >{speech.text}</Typography>
        <Typography variant="caption">{speech.timestamp}</Typography>
      </Box>
    </Box>
  )
}

export function RightBalloon(props){
  const classes = useStyles();
  const speech = props.speech;

  return (
    <Box key={speech.id}
      display="flex"
      flexDirection="row"
      alignItems="flex-end">
      <Box className={classes.rightBalloon}>
        <Typography variant="subtitle2">{speech.displayName}</Typography>
        <Typography
          className={[...speech.text].length <= SHORT_TEXT_LENGTH ? classes.shortText : classes.longText }
        >{speech.text}</Typography>
        <Typography variant="caption">{speech.timestamp}</Typography>
      </Box>
      <Box >
        <Avatar src={`../../svg/${speech.photoURL}`} className={classes.avatar} />
      </Box>
    </Box>
  )

}
