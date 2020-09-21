import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import HomeIcon from "../../icons/Home";
import HabitatIcon from "../../icons/Habitat";
import HubFairiesIcon from "../../icons/HubFairies";

const useStyles = makeStyles((theme) => ({
  rootWhoseChildUsesFlexGrow: {
    width: "100%",
    height: "100vh",
    // backgroundImage: "url(../images/landing-bg.png)",
    // backgroundPosition: "center bottom",
  },
  main: {
    width: "100%",
    height: "clac( 100vh - 64px )",
    overflowY: "scroll",
    overscrollBehavior: "auto",
    padding: theme.spacing(2),
  },
  flavorTextContainer: {
    margin: "10px auto",
  },
  captions: {
    width: "80%",
    margin: "50px auto",
  },
  iconContainer: {
    width: 70,
    margin: "auto",
  },
  captionContainer: {
    width: "100%",
    padding: theme.spacing(2),
  },
  caption: {
    fontSize: 24,
  },
  button: {
    padding: "1em",
  },
  buttonContainer: {
    padding: theme.spacing(2),
  },

}));

export default function Entry(props) {
  const classes = useStyles();
  return (
    <Box
      className={classes.rootWhoseChildUsesFlexGrow}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box
        className={classes.main}
      >
        <Box className={classes.flavorTextContainer}>
          <Typography variant="body1">
            妖精チャットボットが住んでいる<br />
            ちょっと不思議なチャットスペース
          </Typography>

        </Box>

        <Box className={classes.captions}>
          <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
          >
            <Box className={classes.iconContainer}>
              <HabitatIcon style={{ fontSize: 60 }} />
            </Box>
            <Box className={classes.captionContainer}>
              <Typography className={classes.caption}>
                妖精を見つけに行こう
              </Typography>
            </Box>
          </Box>

          <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
          >
            <Box className={classes.iconContainer}>
              <HomeIcon style={{ fontSize: 60 }} />
            </Box>
            <Box className={classes.captionContainer}>
              <Typography className={classes.caption}>
                自分だけの妖精を育てよう
              </Typography>
            </Box>
          </Box>

          <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
          >
            <Box className={classes.iconContainer}>
              <HubFairiesIcon style={{ fontSize: 60 }} />
            </Box>
            <Box className={classes.captionContainer}>
              <Typography className={classes.caption}>
                妖精と一緒にみんなと話そう
            </Typography>
            </Box>

          </Box>

        </Box>      <Box flexGrow={1}> </Box>
        <Box className={classes.buttonContainer}>
          <Button
            className={classes.button}
            color="primary"
            fullWidth
            onClick={e => props.handleChangePage("login")}
            size="large"
            variant="contained"
          >
            ログイン
          </Button>
        </Box>
        <Box className={classes.buttonContainer}>
          <Button
            className={classes.button}
            color="default"
            fullWidth
            onClick={e => props.handleChangePage("signUp")}
            size="large"
            variant="contained"
          >
            新規ユーザ登録
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
