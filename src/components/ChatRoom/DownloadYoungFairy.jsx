import React, { useState, useRef } from "react";
import { StaticQuery, graphql } from "gatsby";
import { randomInt } from "mathjs";

import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import ApplicationBar from "../ApplicationBar/ApplicationBar";

const query = graphql`
  query {
    allFile(filter: {sourceInstanceName: {eq: "fairy"}}) {
      edges {
        node {
          relativePath
        }
      }
    }
  }`;

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
  balloon: {
    marginTop: "1em",
    position: "relative",
    padding: theme.spacing(1),
    borderRadius: "0.4em",
    background: "#bcaf69",
    display: "inline-block",
    "&:after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "50%",
      width: 0,
      height: 0,
      borderStyle: "solid",
      border: "1em",
      borderColor: "transparent #D9D7FF",
      borderTop: 0,
      marginLeft: "-1em",
      marginTop: "-1em",
      display: "block",
    },
  }
}));

function generateHelloNameMeMessage(data) {
  const dict =
    data && data.wordDict["{!HELLO_NAME_ME}"] || [""];

  return dict[randomInt(dict.length)];
}

export default function DownloadYoungFairy(props) {
  /*
    userName: ユーザ名
    handleDownload: Obj形式で読みこんだデータをbotにロード
  */
  const classes = useStyles();
  const pathsRef = useRef();
  const [bot, setBot] = useState();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [message, setMessage] = useState(null);

  function GetPaths(props) {
    if (!props.data) {
      setMessage("サーバーの/に妖精のデータがありません");
      return null;
    }

    const paths = props.data.allFile.edges
      .map(n => (n.node.relativePath));
    pathsRef.current = paths;

    if (pathsRef.current) {
      const l = pathsRef.current;
      const path = l[randomInt(l.length)];

      fetch(`../../fairy/${path}`)
        .then(res => res.json())
        .then(data => {
          setBot(data);
          setPhotoURL(data.config.photoURL);
        })
        .catch(error => {
          setMessage(error.message);
        });
    }

    return null;
  }

  function handleClick() {
    const b = {
      ...bot,
      config: {
        ...bot.config,
        trueName: displayName,
        firstUser: props.uesrName,
        buddyUser: props.userName,
      }

    };
    props.handleDownload(b);
  }

  return (
    <div>
      {pathsRef.current === undefined &&
        <StaticQuery
          query={query}
          render={data => <GetPaths data={data} />}
        />
      }
      <Box
        alignContent="flex-start"
        display="flex"
        flexDirection="column"
        flexWrap="nowrap"
        justifyContent="flex-start"
      >
        <Box>
          <ApplicationBar title="妖精に名前をつけよう" />
        </Box>
        <Box className={classes.content}>
          <Avatar
            className={classes.icon}
            src={`../../svg/${photoURL}`}
          />
          <Box className={classes.balloon}>
            <Typography>
              {generateHelloNameMeMessage(bot)}
            </Typography>
          </Box>
        </Box>

        <Box>
          <TextField
            className={classes.name}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="ルー"
            required
            value={displayName}
          />
        </Box>
        <Box className={classes.content}>
          <Typography color="error">{message}</Typography>
        </Box>
        <Box className={classes.content}>
          <Button
            className={classes.button}
            color="primary"
            disabled={
              bot === null ||
              displayName === null ||
              displayName === ""}
            onClick={handleClick}
            size="large"
          >
            この名前をつける
          </Button>
        </Box>
      </Box>
    </div>
  );
}

