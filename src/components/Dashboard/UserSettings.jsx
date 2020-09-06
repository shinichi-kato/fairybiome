import React, { useState, useMemo } from "react";

import { StaticQuery, graphql } from "gatsby";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextInput from "../TextInput";
import ApplicationBar from "../ApplicationBar/ApplicationBar";

const query = graphql`
query {
  allFile(filter: {relativePath: {regex: "/^user\\//"}, sourceInstanceName: {eq: "staticimages"}}) {
    edges {
      node {
        relativePath
      }
    }
  }
}
`;

const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(1),
  },
  iconContainer: {
    borderRadius: "50%"
  },
  icon: {
    width: 60,
    height: 60,
    padding: 2,
  },
  name: {
    padding: theme.spacing(2),
    fontSize: 22,
  },
  button: {
    padding: "1em",
  },
}));

export default function UserSettings(props) {
  /* ユーザ名とアイコンを取得しfirebase.authに書き込む
    displayName: ユーザ名
    photoURL: ユーザアイコンのURL
    handleChangeUserInfo: 名前とアイコンの設定を変更する関数
  */
  const classes = useStyles();
  const [displayName, setDisplayName] = useState(props.displayName);
  const [photoURL, setPhotoURL] = useState(props.photoURL || "");

  function AvatarButton(localprops) {
    const path = localprops.path;
    return (
      <Button
        className={classes.iconContainer}
        color={photoURL === path ? "primary" : "default"}
        disableElevation={photoURL !== path}
        disableRipple
        onClick={() => setPhotoURL(path)}
        variant="contained"
      >
        <Avatar
          className={classes.icon}
          src={`../../svg/${path}`} />
      </Button>

    );
  }

  function handleChangeDisplayName(e) {
    setDisplayName(e.target.value);
  }

  function handleClick() {
    props.handleChangeUserInfo(displayName, photoURL);
  }

  const MemorizedAvatarSelect = useMemo(() => (
    <StaticQuery
    query={query}
    render={data => (
      <>
        {data.allFile.edges.map((n, index) => (
          <AvatarButton key={index} path={n.node.relativePath} />
        ))}
      </>
    )}
  />), [photoURL]);

  return (
    <Box
      alignContent="flex-start"
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
    >
      <Box>
        <ApplicationBar
          setNavigateBefore={props.setNavigateBefore}
          title="ユーザ設定" />
      </Box>
      <Box className={classes.content}>
        <Typography variant="h5">アイコン</Typography>
      </Box>
      <Box
        alignItems="center"
        className={classes.content}
      >
        {MemorizedAvatarSelect}
      </Box>
      <Box className={classes.content}>
        <Typography variant="h5">あなたの名前</Typography>
      </Box>
      <Box
        className={classes.content}
        flexGrow={1}
      >
        <TextInput
          className={classes.name}
          handleChange={handleChangeDisplayName}
          required
          value={displayName}
          variant="outlined"
        />
      </Box>
      <Box className={classes.content}>
        <Button
          className={classes.button}
          color="primary"
          disabled={
            displayName === null ||
            displayName === "" ||
            photoURL === ""}
          onClick={handleClick}
          size="large"
        >
          ユーザの設定を変更
        </Button>
      </Box>
    </Box>
  );
}
