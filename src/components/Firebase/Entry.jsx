import React,{useEffect} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import HomeIcon from "../../icons/Home";
import HabitatIcon from "../../icons/Habitat";
import HubFairiesIcon from "../../icons/HubFairies";

const useStyles = makeStyles((theme) => ({
  flavorTextContainer:{
    margin: "10px auto",
  },
  captions:{
    width: "80%",
    margin:"60px auto",
  },
  iconContainer:{
    width:70,
    margin: "auto",
  },
  captionContainer:{
    width: "100%",
    padding: theme.spacing(2),
  },
  caption:{
    fontSize: 24,
  },
  button:{
    padding: "1em",
  },
  buttonContainer:{
    padding: theme.spacing(2),
  },
  
  
}));

export default function Entry(props){
  const classes = useStyles();
  return (
    <Box 
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
    >
      <Box className={classes.flavorTextContainer}>
        <Typography variant="body1">
          妖精チャットボットが住んでいる<br/>
          ちょっと不思議なチャットスペース
        </Typography>
                   
      </Box>

      <Box className={classes.captions}>
        <Box 
          display="flex" 
          flexDirection="row" 
          alignItems="center"
        >
          <Box className={classes.iconContainer}>
            <HabitatIcon style={{fontSize:60}}/>
          </Box>
          <Box className={classes.captionContainer}>
            <Typography className={classes.caption}>
              妖精を見つけに行こう
            </Typography>
          </Box>
        </Box>
        
        <Box 
          display="flex" 
          flexDirection="row" 
          alignItems="center"
        >
          <Box className={classes.iconContainer}>
            <HomeIcon style={{fontSize:60}}/>
          </Box>
          <Box className={classes.captionContainer}>
            <Typography className={classes.caption}>
              自分だけの妖精チャット<br/>ボットを育てよう
            </Typography>
          </Box>
        </Box>

        <Box 
          display="flex" 
          flexDirection="row" 
          alignItems="center"
        >
        <Box className={classes.iconContainer}>
          <HubFairiesIcon style={{fontSize:60}}/>
        </Box>
        <Box className={classes.captionContainer}>
          <Typography className={classes.caption}>
            チャットボットと一緒に<br/>みんなと話そう
          </Typography>
        </Box>
        
      </Box> 

      </Box>      <Box flexGrow={1}> </Box>
      <Box className={classes.buttonContainer}>
        <Button 
          className={classes.button}
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={e=>props.handleChangePage('login')}
        >
          ログイン
        </Button>
      </Box>
      <Box className={classes.buttonContainer}>
        <Button 
          className={classes.button}
          variant="contained"
          color="default"
          fullWidth
          size="large"
          onClick={e=>props.handleChangePage('signUp')}
        >
          新規ユーザ登録
        </Button>
      </Box>
    </Box>   
  )
}