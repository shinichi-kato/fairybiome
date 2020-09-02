import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";

const SHORT_TEXT_LENGTH = 1;

const useStyles = makeStyles(theme => createStyles({
  root: {
    width: "95%",
    margin: "auto",
  },
  longText: {
    fontSize: 14,
  },
  shortText: {
    fontSize: 32,
  },

  avatar: {
    width: 40,
    height: 40
  },
  leftBalloon: {
    position: "relative",
    padding: theme.spacing(1),
    borderRadius: 10,
    margin: "6px auto 6px 20px",
    background: "#D9D7FF",
    display: "inline-block",
    "&:after": {
      content: '""',
      position: "absolute",
      borderStyle: "solid",
      borderWidth: "8px 15px 8px 0",
      borderColor: "transparent #D9D7FF",
      display: "block",
      width: 0,
      // zIndex: 1,
      marginTop: -8,
      left: -15,
      bottom: 16
    },
  },
  rightBalloon: {
    position: "relative",
    padding: theme.spacing(1),
    borderRadius: 10,
    margin: "6px 20px 6px auto",
    background: "#D9D7FF",
    display: "inline-block",
    "&:after": {
      content: '""',
      position: "absolute",
      borderStyle: "solid",
      borderWidth: "8px 0 8px 15px",
      borderColor: "transparent #D9D7FF",
      display: "block",
      width: 0,
      // zIndex: 1,
      marginTop: -8,
      right: -15,
      bottom: 16,
    }
  }
}));

const useStyles2 = makeStyles(theme => createStyles({
  root: {
    width: "95%",
    margin: "auto",
    pading: "0.5em",
  },
}));

export function LeftBalloon(props) {
  const classes = useStyles();
  const speech = props.speech;

  return (
    <Box
alignItems="flex-end"
      display="flex"
      flexDirection="row"
      key={speech.id}>
      <Box >
        <Avatar className={classes.avatar} src={`../../svg/${speech.photoURL}`} />
      </Box>
      <Box className={classes.leftBalloon}>
        <Typography variant="subtitle2">{speech.displayName}</Typography>
        <Typography
          className={[...speech.text].length <= SHORT_TEXT_LENGTH ? classes.shortText : classes.longText}
        >{speech.text}</Typography>
        <Typography variant="caption">{speech.timestamp}</Typography>
      </Box>
    </Box>
  );
}

export function RightBalloon(props) {
  const classes = useStyles();
  const speech = props.speech;

  return (
    <Box
alignItems="flex-end"
      display="flex"
      flexDirection="row"
      key={speech.id}>
      <Box className={classes.rightBalloon}>
        <Typography variant="subtitle2">{speech.displayName}</Typography>
        <Typography
          className={[...speech.text].length <= SHORT_TEXT_LENGTH ? classes.shortText : classes.longText}
        >{speech.text}</Typography>
        <Typography variant="caption">{speech.timestamp}</Typography>
      </Box>
      <Box >
        <Avatar className={classes.avatar} src={`../../svg/${speech.photoURL}`} />
      </Box>
    </Box>
  );
}

export function SystemLog(props) {
  const classes = useStyles2();
  return (
    <Box className={classes.system}>
      <Typography variant="subtitle2">{props.speech.text}</Typography>
    </Box>
  );
}
