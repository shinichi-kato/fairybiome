import React ,{useContext } from "react";
import {Link} from 'gatsby';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';　//id
import PersonIcon from '@material-ui/icons/Person';　//   displayName
import AccessTimeIcon from '@material-ui/icons/AccessTime';　// updatedAt
import AccountCircleIcon from '@material-ui/icons/AccountCircle';　// creator
import FaceIcon from '@material-ui/icons/Face';　// photoURL
import DescriptionIcon from '@material-ui/icons/Description';　// description
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';　// availability
import Icon from '@material-ui/icons/';　// generosity
import Icon from '@material-ui/icons/';　// retention

import {FirebaseContext} from "../Firebase/FirebaseProvider";
import {BiomeBotContext} from "../Chatbot/BiomeBotContext";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
  },
  main: {
    width: "100%",
    height: "clac( 100vh - 64px )",
		overflowY:'scroll',
		overscrollBehavior:'auto',
    WebkitOverflowScrolling:'touch',
    padding: theme.spacing(2),
  },
}));

export default function ConfigEditor({location}){
  const fb = useContext(FirebaseContext);
  const bot = useContext(BiomeBotContext);

  function TextInput(props){
    return(
      <>
        <InputLabel htmlFor={props.slug}>
          {props.label}
        </InputLabel>
        <Input
          id={props.slug}
          startAdornment={
            <InputAdornment position="start">
              {props.icon}
            </InputAdornment>
          }
        />
        <Typography variant="text">{props.description}</Typography>
      </>
    )
  }

  return (
    <Box className={classes.root}
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box>
        <ApplicationBar
          title="チャットボットの設定"
        />
      </Box>
      <Box className={classes.main}
        display="flex"
        flexDirection="column"
      >
        <Box>
          <TextInput
            slug="bot-id"
            label="チャットボットの型式"
            icon={<LocalOfferIcon style={{ color: "#2e7d32"}} />}
          />
        </Box>
      </Box>
    </Box>
  )
}