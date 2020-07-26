import React ,{useState,useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Typography from '@material-ui/core/Typography';

import {toTimestampString} from '../to-timestamp-string.jsx';
import FairyPanel from './FairyPanel';
import HubIcon from "../../icons/Hub";

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

export default function Config(props){
  const classes = useStyles();
  const config = props.config;
  const [displayName,setDisplayName] = useState(config.displayName || "");
  const [photoURL,setPhotoURL] = useState(config.photoURL);
  const [description,setDescription] = useState(config.description || "");
  const [availability,setAvailability] = useState(config.hubBehavior.availability);
  const [generosity,setGenerosity]=useState(config.hubBehavior.generosity);
  const [retention,setRetention]=useState(config.hubBehavior.retention);

  useEffect(()=>{
    if(props.pageWillChange){
      handleSave();
    }
  },[props.pageWillChange]);
  
  function handleSave(){
    props.handleSave(
      {
      ...config,
      displayName:displayName,
      photoURL:photoURL,
      description:description,
      hubBehavior:{
        availability:parseFloat(availability),
        generosity:parseFloat(generosity),
        retention:parseFloat(retention)
      }
    })
  }
  
  return (
    <Box className={classes.content}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FairyPanel
            photoURL={photoURL}
            hp={props.state.hp}
            displayName={displayName}
            updatedAt={toTimestampString(config.updatedAt)}
          />
        </Grid>
        <Grid item xs={5}>
          <Input
            className={classes.input}
            value={displayName}
            required
            onChange={e=>setDisplayName(e.target.value)}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">チャット画面に表示される妖精の名前</Typography>
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            value={description}
            onChange={e=>setDescription(e.target.value)}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">妖精の説明</Typography>
        </Grid>
        <Grid item xs={12}>
          集まる場所<HubIcon/>での妖精の行動
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            value={availability}
            required
            onChange={e=>setAvailability(e.target.value)}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            0.0〜1.0:0だと妖精はしゃべろうとしない。1だと常にしゃべろうとする。
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            value={generosity}
            required
            onChange={e=>setGenerosity(e.target.value)}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            0.0〜1.0:0だと適当なことにも返事をする。1だと正確な場合だけ返答する。
          </Typography>
        </Grid>

        <Grid item xs={5}>
          <Input
            className={classes.input}
            value={retention}
            required
            onChange={e=>setRetention(e.target.value)}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="subtitle1">
            0.0〜1.0:0だと話題を続けない。1だと話題をずっと続けようとする。
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Button>
            cancel
          </Button>
          <Button
            onClick={handleSave}
          >
            保存する
          </Button>
          {props.message && 
            <Grid item xs={12}>
            <Typography color="error">
              {props.message}
            </Typography>
            </Grid>
          }
        </Grid>
        
      </Grid>
    </Box>
  )
}