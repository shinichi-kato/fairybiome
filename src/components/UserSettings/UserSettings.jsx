import React ,{useState,useContext} from "react";
import { StaticQuery,graphql } from "gatsby"

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import TextInput from '../TextInput';

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
  }

}));



export default function UserSettings(props){
  const classes = useStyles();
  const [avatar,setAvatar] = useState("")
  const [avatarList,setAvatarList] = useState(null);

  function AvatarList(props){
    if(avatarList === null ){
      return <></>
    }
    return avatarList.map(node=>{
      const path=node.node.relativePath;

      return(
        <li key={path} className={classes.iconList}>
          <Button
            className={classes.iconContainer}
            color={avatar === path ? "primary" : "default" }
            variant={avatar === path ? "contained" : "default"}
            onClick={()=>setAvatar(path)}
          >
            <Avatar 
              src={`../../svg/${path}`} 
              className={classes.icon}/>
          </Button>
        </li>

        )
    });
  }

  const ComponentBody =  (data)=> (
    <Box 
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      justifyContent="flex-start"
      alignContent="flex-start"
    >
      <Box >
        <ApplicationBar
          title="ユーザ設定"
        />
      </Box>   
      <Box className={classes.content}>
        <Typography variant="h5">アイコン</Typography>
      </Box>
      <Box
        className={classes.content}
        alignItems="center"
      >
        <AvatarList data={data}/>
      </Box>
      <Box className={classes.content}>
        <Typography variant="h5">名前</Typography>
      </Box>
      <Box className={classes.content}>
        <TextInput/>
      </Box>
      
    </Box>
  );

  
  return(
    <>
      { avatarList === null ?
        <StaticQuery 
        query={graphql`
        query {
          allFile(filter: {relativePath: {regex: "/^user\\//"}, sourceInstanceName: {eq: "staticimages"}}) {
            edges {
              node {
                relativePath
              }
            }
          }
        }
        `}
        render={data => {
          const edges = data.allFile.edges;
          setAvatarList(edges);
          return <ComponentBody data={edges} />}}
        
        />
        :
        <ComponentBody data={avatarList}/>
      }
    </>
  )
}

