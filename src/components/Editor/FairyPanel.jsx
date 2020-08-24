import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import Avatar from "@material-ui/core/Avatar";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  icon: {
    width: 50,
    height: 50,
  },
  content: {
    width: 200

  },
  bar: {
    borderRadius: 5,
    height: 10,
    backgroundColor: ""
  }
}));

export default function FairyPanel(props) {
  const classes = useStyles();
  console.log("fairypanel")
  return (
    <Paper
      className={classes.root}
    >
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
      >
        <Box>
          <Avatar
            className={classes.icon}
            src={`../../svg/${props.photoURL}`}
          />
        </Box>
        <Box>
          <Typography>{props.displayName || "名前"}</Typography>
        </Box>
        <Box
          className={classes.content}
        >
          HP:<LinearProgress
            className={classes.bar}
            size={100}
            value={Number(props.hp)}
            variant="determinate" />
        </Box>
        <Box>
          <Typography>最終更新{props.updatedAt}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
