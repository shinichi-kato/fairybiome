import React,{useEffect,useReducer,createContext} from 'react';
import Landing from '../Landing/Landing';
import AuthDialog from './AuthDialog';
import {localStorageIO} from '../../utils/localStorageIO';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';


export const FirebaseContext = createContext();

const initialState={
  user: {
    displayName: null,
    email: "",
    photoURL: null,
    uid: null,
    emailVerified: null,
    providerData: null,
  },
  authState: 'notYet', // notYet-run-ok-error
  message: '',
  firestore: null,
  firebaseApp: null,
}

function reducer(state,action){
  switch(action.type){
    case 'initFirebase' : {
      return {
        ...initialState,
        firebaseApp:action.firebaseApp,
      }
    }

    case 'run' : {
      return {
        ...state,
        authState:'run',
      }
    }

    case 'ok' : {
      const user = action.user;
      localStorageIO.setItem('auth.displayName',user.displayName);
      localStorageIO.setItem('auth.email',user.email);
      localStorageIO.setItem('auth.photoURL',user.photoURL);
      return {
        user:action.user,
        authState:'ok',
        message: '',
        firestore: action.firestore,
        firebaseApp:state.firebaseApp,
      }
    }

    case 'error' : {
      return {
        ...initialState,
        authState:'error',
        message: action.message,
        firebaseApp: state.firebaseApp,
      }
    }

    case 'signOut' : {
      return {
        ...initialState,
        firebaseApp:state.firebaseApp,
      }
    }

    default :
    throw new Error(`invalid action ${action.type}`);
  }
}


export default function FirebaseProvider(props){
  const [state,dispatch] = useReducer(reducer,initialState);

  useEffect(()=>{
    if (!state.firebaseApp && typeof window !== "undefined") {
      // firebase initialization
      const firebaseApp = firebase.initializeApp({
        apiKey: process.env.GATSBY_FIREBASE_API_KEY,
        authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL,
        projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
        storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.GATSBY_FIREBASE_APP_ID,    
      });
      dispatch({type:'initFirebase',firebaseApp:firebaseApp})
      
      // firestore initialization
      firebaseApp.auth().onAuthStateChanged(user=>{
        if(user){
          const fs = firebase.firestore()
          dispatch({type:'ok',user:user,firestore:fs})
        }
        else{
          dispatch({
            type:'error',
            message:'ユーザが認証されていません',
          })
        }       
      })
    }

  },[]);

  function authenticate(email,password){
    dispatch({type:'run'});
    console.log("auth",email,password)

    firebase.auth().signInWithEmailAndPassword(email,password)
    .then(()=>{
      // userの更新はonAuthStateChangedで検出
    })
		.catch(error=>{
			switch(error.code){
				case 'auth/user-not-found':
					dispatch({type:'error',message:"ユーザが登録されていません"});
					break;
				case 'auth/wrong-password' :
					dispatch({type:'error',message:"パスワードが違います"});
					break;
				case 'auth/invalid-email' :
					dispatch({type:'error',message:"不正なemailアドレスです"});
					break;
				default:
					dispatch({type:'error',message:`${error.code}: ${error.message}`});
			}
		});
  }
  
  function createUser(email,password){
    dispatch({type:'run'});
		firebase.auth().createUserWithEmailAndPassword(email,password)
		.then(user=>{
      // 成功したら自動でログインされる
      // userの更新はonAuthStateChangedで検出
		})
		.catch(error=>{
			dispatch({type:'error',message:error.message})
		})
  }

  function changeUserInfo(displayName,photoURL){
		let user = firebase.auth().currentUser;
		if(user){
			user.updateProfile({
				displayName:displayName,
				photoURL: photoURL
			}).then(()=>{
				// userの更新はonAuthStateChangedで検出
			}).catch(error=>{
				dispatch({type:'error',message:error.code});
			})
		}
  }

  function signOut(){
		firebase.auth().signOut().then(()=>{
			dispatch({type:'signOut'});
		}).catch(error=>{
			dispatch({type:'error',message:error.message})
		});    
  }

  

  return (
    <FirebaseContext.Provider 
      value={{
        firebaseApp:state.firebaseApp,
        firestore:state.firestore,
        user:state.user,
      }}
    >
      { state.firebaseApp === null 
        ? 
        <Landing />
        :
        (state.authState !== 'ok' ?
          <AuthDialog 
            user={state.user}
            message={state.message}
            handleLogin={authenticate}
            handleSignUp={createUser}
            handleChangeUserInfo={changeUserInfo}
          /> 
          :
          props.children
        )
      } 
    </FirebaseContext.Provider>
  )
}