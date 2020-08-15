import React, {useState, useRef} from "react";
import { StaticQuery, graphql } from "gatsby";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
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
  /*
    displayName: ユーザ名
    photoURL: ユーザアイコンのURL
    handleChangeUserInfo: 名前とアイコンの設定を変更する関数
  */
  const classes = useStyles();
  const nameRef = useRef();
  const [photoURL, setPhotoURL] = useState(props.photoURL || "");
  const photoURLsRef = useRef();

  function GetPhotoURLsList(localprops) {
    // avatarListをuseStateで構成すると、「render内でのsetState」
    // というwarningになる。これは useStaticQuery()で回避できるが、
    // 2020.7現在ではuseStaticQuery() 自体にバグがあり、undefined
    // しか帰ってこない。
    // https://github.com/gatsbyjs/gatsby/issues/24394
    // そこで useRef を代替とし、データ取得のみのサブコンポーネントを用いる。
    if (localprops.data) {
      photoURLsRef.current = [...localprops.data.allFile.edges];
    }
    return null;
  }

  function AvatarButton(localprops) {
    const path = localprops.path;
    return (
        <Button
          className={classes.iconContainer}
          color={photoURL === path ? "primary" : "default" }
          disableElevation={photoURL !== path}
          disableRipple
          onClick={()=>setPhotoURL(path)}
          variant="contained"
        >
          <Avatar
            className={classes.icon}
            src={`../../svg/${path}`}/>
        </Button>

      );
  }

  function handleClick() {
    props.handleChangeUserInfo(nameRef.current, photoURL);
  }

  console.log("<UserSetting/>");
  return (
    <div>
      {photoURLsRef.current === null &&
        <StaticQuery
          query={query}
          render={data=><GetPhotoURLsList data={data}/>}
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
        <ApplicationBar title="ユーザ設定" />
      </Box>
      <Box className={classes.content}>
        <Typography variant="h5">アイコン</Typography>
      </Box>
      <Box

        alignItems="center"
        className={classes.content}
      >
        { photoURLsRef.current !== null &&
          photoURLsRef.current.map((n, index)=>(
            <AvatarButton key={index} path={n.node.relativePath} />
          ))
        }

      </Box>
      <Box className={classes.content}>
        <Typography variant="h5">あなたの名前</Typography>
      </Box>
      <Box
        className={classes.content}
        flexGrow={1}
      >
        <TextField
          className={classes.name}
          defaultValue={props.displayName}
          inputRef={nameRef}
          required
          variant="outlined"
        />
      </Box>
      <Box className={classes.content}>
        <Button
          className={classes.button}
          color="primary"
          disable={
            nameRef.current === null ||
            nameRef.current === "" ||
            photoURL === ""}
          onClick={handleClick}
          size="large"
        >
          ユーザの設定を変更
        </Button>
      </Box>
    </Box>
    </div>
  );
}
