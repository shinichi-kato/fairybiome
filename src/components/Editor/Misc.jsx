import React, { useEffect, useReducer, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import LinearProgress from "@material-ui/core/LinearProgress";
import Radio from "@material-ui/core/Radio";
import Button from "@material-ui/core/Button";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import PartOrderMini from "./PartOrderMini";
import QueueList from "./QueueList";

const buddyDescription = {
  null: "妖精がいない",
  "none": "妖精はあなたのバディになっていない",
  "follow": "妖精はあなたについてきている",
  "home": "妖精はあなたから離れてHomeのどこかにいる",
  "habitat": "妖精はあなたから離れてHabitatのどこかにいる"
};

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),
  },
  bar: {
    borderRadius: 5,
    height: 10,
    backgroundColor: ""
  },
  topPageIcon: {
    transform: "rotate(90deg)",
  }

}));

function reducer(state, action) {
  switch (action.type) {
    case "changePartOrder": {
      if (typeof action.partOrder === "function") {
        return {
          ...state,
          partOrder: action.partOrder(state.partOrder)
        };
      }
      return {
        ...state,
        partOrder: [...action.partOrder]
      };
    }

    case "changeBuddy": {
      return {
        ...state,
        buddy: action.buddy
      };
    }

    case "clearQueue": {
      return {
        ...state,
        queue: []
      };
    }

    default:
      throw new Error(`invalid action ${action.type}`);
  }
}

export default function Misc(props) {
  /*
     this.state = {
      partOrder: [],
      activeInHub: false,
      hp: 0,
      queue: [],
      buddy: null, // null: アンロード状態
      // "none":非バディ,
      // "follow":随行中,
      // "home":ユーザから離れてHomeにいる,
      // "habitat":ユーザから離れてHabitatにいる
    };
  */

  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, props.state);

  useEffect(() => {
    if (props.pageWillChange) {
      handleSaveMisc(state);
    }
  }, [props.pageWillChange]);

  function handleSaveMisc() {
    props.handleSaveMisc(state);
  }

  function setPartOrder(partorder) {
    dispatch({ type: "changePartOrder", partOrder: partorder });
  }

  function handleChangeBuddy(event) {
    dispatch({type: "changeBuddy", buddy: event.target.value});
  }

  function handleClearQueue(e) {
    dispatch({type: "clearQueue"});
  }
  const MemorizedPartOrder = useMemo(() => (
    <PartOrderMini
      partOrder={state.partOrder}
      parts={props.parts}
      setPartOrder={setPartOrder}
    />),
    [state.partOrder, props.parts]);

  return (
    <Box className={classes.content}>
      <Grid
        alignItems="center"
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <Typography>ヒットポイント</Typography>
        </Grid>
        <Grid item xs={12}>
          HP:{state.hp}<LinearProgress
            className={classes.bar}
            size={100}
            value={Number(state.hp)}
            variant="determinate" />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">
            妖精の体力です。会話中にあるきっかけで増減します。
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>現在のパートの順序</Typography>
        </Grid>
        <Grid item xs={12}>
          {MemorizedPartOrder}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">
            会話では上のパートから順にが返答するかどうかを決め、返答しない場合は
            次のパートが返答するかどうかを決め・・と処理します。
            テストしたいパートは<FirstPageIcon className={classes.topPageIcon} />ボタンで
            最上位に移動してください。
          </Typography>
        </Grid>
        <Grid item xs={12}>
          キュー
        </Grid>
        <Grid item xs={12}>
          <QueueList queue={state.queue} />
          <Button
            disabled={state.queue.length === 0}
            onClick={handleClearQueue}
          >
            消去
          </Button>
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel componene="legend">バディの状態</FormLabel>
            <RadioGroup
              aria-label="buddy-state"
              name="buddy"
              onChange={handleChangeBuddy}
              value={state.buddy}
            >
              {Object.keys(buddyDescription).map(item => (
                <FormControlLabel
                  control={<Radio />}
                  key={item}
                  label={buddyDescription[item]}
                  value={item}
                />))}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
