import React, { useState, useEffect, useMemo } from "react";
import { graphql, StaticQuery } from "gatsby";
import { makeStyles } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import IconButton from "@material-ui/core/IconButton";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";

import { toTimestampString } from "../to-timestamp-string.jsx";
import FairyPanel from "./FairyPanel";

import PartOrder from "./PartOrder";
import Behavior from "./Behavior";

const query = graphql`
query  {
  allFile(filter: {sourceInstanceName: {eq: "staticimages"},
    base: {eq: "normal.svg"}, relativePath: {regex: "/^bot\\/(?!_)/"}}) {
    edges {
      node {
        relativePath
        relativeDirectory
      }
    }
  }
}`;

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
  const [hubBehavior, setHubBehavior] = useState(config.hubBehavior);
  const [defaultPartOrder, setDefaultPartOrder] = useState(config.defaultPartOrder);
  const [initialHp, setInitialHp] = useState(parseInt(config.initialHp) || 10);

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
        initilaHp: initialHp,
        hubBehavior: {
          availability: parseFloat(hubBehavior.availability),
          generosity: parseFloat(hubBehavior.generosity),
          retention: parseFloat(hubBehavior.retention)
        }
      });
  }

  function handleSavePartOrder(newPartOrder, newParts) {
    // パートのメンバーが変わっていたらパートも保存
    // Config.jsxでのパート書き換えは追加/削除した時点で実行する。
    // そのため追加されたパートは必ず初期状態。
    // 同名で一度削除した後追加されることで更新が漏れることは避ける
    setDefaultPartOrder(prevOrder => {
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
        initilaHp: initialHp,
        hubBehavior: {
          availability: parseFloat(hubBehavior.availability),
          generosity: parseFloat(hubBehavior.generosity),
          retention: parseFloat(hubBehavior.retention)
        }
      });
  }

  function handleChangeDescription(e) {
    setDescription(e.target.value);
  }

  function handleChangeDisplayName(e) {
    setDisplayName(e.target.value);
  }

  function handleChangePhotoURL(path) {
    setPhotoURL(path);
  }

  function FairyAvatar(childProps) {
    return (
      <IconButton
        color={childProps.path === photoURL ?
          "primary" : "default"}
        onClick={e => handleChangePhotoURL(childProps.path)}
      >
        <Avatar
          src={`../../svg/${childProps.path}`} />
      </IconButton>
    );
  }

  const MemorizedAvatarSelector = useMemo(() => (
      <StaticQuery
        query={query}
        render={data => data.allFile.edges.map(
          (edge, index) => {
            return <FairyAvatar key={index} path={edge.node.relativePath} />;
          })
        } />
    ), []);

    const MemorizedFairyPanel = useMemo(() => (
    <FairyPanel
      displayName={displayName}
      hp={initialHp}
      partOrdedr={defaultPartOrder}
      photoURL={photoURL}
      setHp={setInitialHp}
      setPartOrder={setDefaultPartOrder}
      updatedAt={updatedAt}
    />),
    [displayName, props.state.hp, defaultPartOrder, initialHp, photoURL, updatedAt]);

  const MemorizedPartOrder = useMemo(() => (
    <PartOrder
      handleChangePage={props.handleChangePage}
      handleSavePart={props.handleSavePart}
      handleSavePartOrder={handleSavePartOrder}
      partOrder={defaultPartOrder}
      parts={props.parts}
      setPartOrder={setDefaultPartOrder}
    />),
    [defaultPartOrder, props.parts]);

  const updatedAt = toTimestampString(props.updatedAt);

  return (
    <Box className={classes.content}>
      <Grid
        alignItems="center"
        container
        spacing={2}>
        <Grid item xs={12}>
          {MemorizedFairyPanel}
        </Grid>
        <Grid item xs={5}>
          {MemorizedAvatarSelector}
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            妖精の外見
          </Typography>
          <Typography variant="subtitle2">
          実際に表示されるアイコンは妖精の状態により表情などが変わります。
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <Input
            className={classes.input}
            onChange={handleChangeDisplayName}
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
            onChange={handleChangeDescription}
            value={description}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">妖精の説明</Typography>
        </Grid>
        <Behavior
          behavior={hubBehavior}
          setBehavior={setHubBehavior}
          title={`${props.hubTitle}での妖精のふるまい`}
        />
        <Grid item xs={12}>
          <Typography>
            パート
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {MemorizedPartOrder}
        </Grid>

      </Grid>
    </Box>
  );
}
