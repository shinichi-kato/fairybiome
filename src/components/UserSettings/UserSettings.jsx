import React ,{useState,useContext,useRef} from "react";
import { StaticQuery,graphql,navigate } from "gatsby"
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import ApplicationBar from '../ApplicationBar/ApplicationBar';
import InputBase from '@material-ui/core/InputBase';
import {FirebaseContext} from '../Firebase/FirebaseProvider';

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

}));

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
`
;

export default function UserSettings(props){
  const classes = useStyles();
  const fb = useContext(FirebaseContext);
  const user = fb.user;
  const [name,setName] = useState(user.displayName || "");
  const [avatar,setAvatar] = useState(user.photoURL);
  const avatarListRef = useRef(null);

  function AvatarList(props) {
    // avatarListをuseStateで構成すると、「render内でのsetState」
    // というwarningになる。これは
    // useStaticQuery()で回避できるが、2020.7現在ではuseStaticQuery()
    // 自体にバグがあり、undefinedしか帰ってこない。
    // それらの複合的要因から useRefを代替として使っている。
    let al = avatarListRef.current;
    if(props.data){
      al = props.data.allFile.edges;
      avatarListRef.current=[...al];
    }
    if(al === null){
      return <></>;
    }

    return al.map(node=>{
      const path=node.node.relativePath;

      return(
          <Button
            key={path}
            className={classes.iconContainer}
            color={avatar === path ? "primary" : "default" }
            variant="contained"
            disableElevation={avatar !== path}
            onClick={()=>setAvatar(path)}
          >
            <Avatar 
              src={`../../svg/${path}`} 
              className={classes.icon}/>
          </Button>

        )})
    
  }
  
   function handleClick(){
    fb.changeUserInfo(null,avatar);
    navigate('/fairybiome/Dashboard/');
  }

  function handleCancel(){
    navigate('/fairybiome/Dashboard/');
  }

  return(

    <Box 
     display="flex"
     flexDirection="column"
     flexWrap="nowrap"
     justifyContent="flex-start"
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
       flexGrow={1}
       className={classes.content}
       alignItems="center"
     >
     
    {avatarListRef.current === null ?
      <StaticQuery
        query={query}
        render={data => (<AvatarList data={data} />

        )}
      />
    :
      <AvatarList />
    }
     
     </Box>

     <Box>
       <Button
         className={classes.button}
         variant="contained"
         color="primary"
         fullWidth
         size="large"
         onClick={handleClick}
       >
         アイコンを変更
       </Button>
     </Box>
     <Box>
       <Button
         className={classes.button}
         variant="contained"
         color="default"
         fullWidth
         size="large"
         onClick={handleCancel}
         
       >
         cancel
       </Button>
     </Box>
     
   </Box>
  )
}

