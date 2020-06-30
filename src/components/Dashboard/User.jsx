import React ,{useState,useContext} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';

import {FirebaseContext} from '../Firebase/FirebaseProvider';

const imageSrc=[
  'svg/user/user-blank.svg'
];


const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 140,
    height: 140,
  },
  icon: {
    width: 140,
    height: 140,
  }
}));


export default function User(props){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);

  const [icon,setIcon] = useState(imageSrc[0]);
  const [name,setName] = useState(fb.displayName);

  return (
    <Box 
      display="flex"
      flexDirection="column"
      >
      <Box className={classes.iconContainer}>
        <IconButton className={classes.icon}>
          <img src={icon} className={classes.icon} />
        </IconButton>
      </Box>
      <Box>
        <Typography >
          {name}
        </Typography>
      </Box>
    </Box>
  )
}