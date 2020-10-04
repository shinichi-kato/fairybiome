import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
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

  track: {
    borderRadius: 5,
    height: 10,
  },
  rail: {
    borderRadius: 5,
    height: 10,
  }
}));

export default function FairyPanel(props) {
  const classes = useStyles();

  function handleChangeHp(event, value) {
    props.setHp(value);
  }

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
          初期HP:{props.hp}
          <Slider
            className={classes.bar}
            size={100}
            value={Number(props.hp)}
            onChange={handleChangeHp}
            />
        </Box>
        <Box>
          <Typography>最終更新{props.updatedAt}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
