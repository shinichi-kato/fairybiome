import React ,{useRef} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ApplicationBar from '../ApplicationBar/ApplicationBar';

const useStyles = makeStyles((theme) => ({
  content:{
    padding: theme.spacing(1),
  },
  focusedIconContainer:{
    backgroundColor: theme.palette.primary.main,
  },
  iconContainer:{
    borderRadius:"50%"
  },
  icon: {
    width: 60,
    height: 60,
    padding: 2,
    
  },
  iconList:{
    display: "inline-block",
  },
  nameContainer: {
    margin: "auto",
  },
  name: {
    padding: theme.spacing(2),
    fontSize: 22,
  },
  button:{
    padding: "1em",
  },
  bottomBalloon : {
    position: 'relative',
    padding: theme.spacing(1),
    borderRadius: 10,
    margin: "6px auto 6px 20px",
    background:  '#D9D7FF',
    display: 'inline-block',
    '&:after':{
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "50%",
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '8px 15px 8px 0',
      borderColor: 'transparent #D9D7FF',
      borderBottom: 0,
      borderLeft: 0,
      marginLeft: -10,
      marginBottom: -20,
      display: 'block',
    },
  },

}));


export default function BotSettings(props){
  /* 
    チャットボットの名前を設定する。
    FairyBiomeに初めてログインしたとき、ランダムに選ばれた新生状態の
    チャットボット（妖精）がユーザのバディになる。このボットは名前がないので
    ユーザがそれをつける。
    チャットボットに初めて名前をつけたユーザは内部的に「firstUser」として
    記憶される。
    
   */
  
   const classes=useStyles();

   

  return(
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar
          title="妖精の名前設定"
        />
      </Box>   
      <Box>
        <Box className={classes.bottomBalloon}>
          <Typography></Typography>
        </Box>
      </Box>
      <Box>
        <TextField 
          required
          placeholder="名前"
          variant="outlined"
          defaultValue={"nameRef.current}"}
        />
      </Box>
      <Box>
        <Button>
          決定

        </Button>
      </Box>

    </Box>
  )
}