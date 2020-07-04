import React ,{useState,useRef} from "react";
import { StaticQuery,graphql,navigate,Link } from "gatsby"
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
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

export default function UserSettings({location}){
  const classes = useStyles();
  const nameRef = useRef(location.state && location.state.name);
  const [avatar,setAvatar] = useState(location.state && location.state.avatar);
  const avatarListRef = useRef(null);
  console.log("state",location.state)
  function AvatarButton(props){
    return(
        <Button
          className={classes.iconContainer}
          color={avatar === props.path ? "primary" : "default" }
          variant="contained"
          disableRipple
          disableElevation={avatar !== props.path}
          onClick={()=>setAvatar(props.path)}
        >
          <Avatar 
            src={`../../svg/${props.path}`} 
            className={classes.icon}/>
        </Button>

      )
    
  }

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

    return al.map((node,index)=>(
          <AvatarButton key={index} path={node.node.relativePath} />

        ))
    
  }
  
   function handleClick(){
    navigate('/fairybiome/Dashboard/',
    
      {state:{user:`${avatar} ${nameRef.current.value}`}});
  }

  

  function handleCancel(){
    navigate('/fairybiome/Dashboard/');
  }
  
  console.log("nameRef",nameRef)

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
       名前
     </Box>
     <Box>
       <TextField 
        required
        inputRef={nameRef}
        variant="outlined"
        defaultValue={nameRef.current}
       />
     </Box>

     <Box>
       <Button
        className={classes.button}
        color="primary"
        size="large"
        onClick={handleClick}>
         ユーザ設定を変更
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

