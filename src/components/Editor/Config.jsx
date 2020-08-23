import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";

import { toTimestampString } from "../to-timestamp-string.jsx";
import FairyPanel from "./FairyPanel";
import HubIcon from "../../icons/Hub";

import PartOrder from "./PartOrder";

function partDiff(prevArr, currArr) {
  let added = [];
  let removed = [];
  for (let elem of currArr) {
    if (prevArr.indexOf(elem) === -1) {
      added.push(elem);
    }
  }
  for (let elem of prevArr) {
    if (currArr.indexOf(elem) === -1) {
      removed.push(elem);
    }
  }
  return { added: added, removed: removed };
}

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(2),

  },
  margin: {
    margin: theme.spacing(1),
  },
  input: {
    padding: theme.spacing(2),
    backgroundColor: "#EEEEEE",
    borderRadius: 4,

  },

}));

export default function Config(props) {
  const classes = useStyles();
  const config = props.config;
  const [displayName, setDisplayName] = useState(config.displayName || "");
  const [photoURL, setPhotoURL] = useState(config.photoURL);
  const [description, setDescription] = useState(config.description || "");
  const [availability, setAvailability] = useState(config.hubBehavior.availability);
  const [generosity, setGenerosity] = useState(config.hubBehavior.generosity);
  const [retention, setRetention] = useState(config.hubBehavior.retention);
  const [defaultPartOrder, setDefaultPartOrder] = useState(config.defaultPartOrder);

  useEffect(() => {
    if (props.pageWillChange) {
      handleSaveConfig();
    }
  }, [props.pageWillChange]);

  function handleSaveConfig() {
    props.handleSaveConfig(
      {
        ...config,
        displayName: displayName,
        photoURL: photoURL,
        description: description,
        defaultPartOrder: defaultPartOrder,
        hubBehavior: {
          availability: parseFloat(availability),
          generosity: parseFloat(generosity),
          retention: parseFloat(retention)
        }
      });
  }

  function handleSavePartOrder(newPartOrder, newParts) {
    // パートのメンバーが変わっていたらパートも保存
    // Config.jsxでのパート書き換えは追加/削除した時点で実行する。
    // そのため追加されたパートは必ず初期状態。
    // 同名で一度削除した後追加されることで更新が漏れることは避ける
    setDefaultPartOrder(prevOrder =>{
      let diffs = partDiff(prevOrder, newPartOrder);
      if (diffs.added.length !== 0) {
        // 追加されたパートのデータを保存
        for (let name of diffs.added) {
          props.handleSavePart(name, newParts[name]);
        }
      }
      if (diffs.removes.length !== 0) {
        // 削除されたパートのデータを削除
        for (let name of diffs.removed) {
          props.handleSavePart(name, null);
        }
      }
      return newPartOrder;
    });
    props.handleSaveConfig(
      {
        ...config,
        displayName: displayName,
        photoURL: photoURL,
        description: description,
        defaultPartOrder: newPartOrder,
        hubBehavior: {
          availability: parseFloat(availability),
          generosity: parseFloat(generosity),
          retention: parseFloat(retention)
        }
      });
  }

  return (
    <Box className={classes.content}>
      <Grid
        alignItems="center"
        container
        spacing={2}>
        <Grid item xs={12}>
          <FairyPanel
            displayName={displayName}
            hp={props.state.hp}
            photoURL={photoURL}
            updatedAt={toTimestampString(props.updatedAt)}
          />
        </Grid>
        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={e => setDisplayName(e.target.value)}
            required
            value={displayName}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">チャット画面に表示される妖精の名前</Typography>
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={e => setDescription(e.target.value)}
            value={description}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">妖精の説明</Typography>
        </Grid>
        <Grid item xs={12}>
          集まる場所<HubIcon />での妖精のふるまい
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={e => setAvailability(e.target.value)}
            required
            value={availability}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            起動率(0.00〜1.00)
          </Typography>
          <Typography variant="subtitle2">
            0だと妖精はしゃべろうとしない。1だと常にしゃべろうとする。
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={e => setGenerosity(e.target.value)}
            required
            value={generosity}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            寛容性(0.00〜1.00)
          </Typography>
          <Typography variant="subtitle2">
            0だと正確な場合だけ返答する。1だと適当なことにも返事をする。
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={e => setRetention(e.target.value)}
            required
            value={retention}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            継続率(0.00〜1.00)
          </Typography>
          <Typography variant="subtitle2">
            0だと話題を続けない。1だと同じ話題をずっと続けようとする。
          </Typography>
        </Grid>

        <Grid item xs={12}>
          {props.message &&
            <Typography color="error">
              {props.message}
            </Typography>
          }
        </Grid>
        <Grid item xs={12}>
          <Typography>
            パート
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <PartOrder
            handleSavePartOrder={handleSavePartOrder}
            partOrder={defaultPartOrder}
            parts={props.parts}
          />
        </Grid>

      </Grid>
    </Box>
  );
}
