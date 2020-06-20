import React,{useContext,useReducer,createContext} from 'react';
import {FirebaseContext} from "gatsby-plugin-firebase";

export const AuthContext = createContext();

const initialState= () =>{
  return {
    user: {
      displayName: localStorage.getItem('auth.displayName') || null,
      email: localStorage.getItem('auth.email') || null,
      photoURL: localStorage.getItem('auth.photoURL') || null,
      uid: null,
      emailVerified: null,
      providerData: null,
    },
    authState: 'notYet',	// notYet - run - ok - error
    message: '',	// error message
  }
};

function reducer(state,action){
  switch(action.type){
    case 'run':{
      return {
        ...state,
        authState:'run',
        message: '',
      }
    }

    case 'ok':{
      const user = action.user;
			localStorage.setItem('auth.displayName',user.displayName);
			localStorage.setItem('auth.email',user.email);
      localStorage.setItem('auth.photoURL',user.photoURL);
      return {
        user:action.user,
        authState: 'ok',
        message: ''
      }      
    }
    case 'error' : {
      return {
        user:initialState.user,
        authState:'error',
        message:action.message
      }
    }
    case 'signOut': {
      return {
        ...initialState(),

      }
    }

    default :
    throw new Error(`invalid action ${action.type}`);
  }
}

export default function AuthProvider(props){
  const firebase = useContext(FirebaseContext);
  const [state,dispatch] = useReducer(reducer,initialState());


}