import React from "react"
import { Router } from "@reach/router";

import FirebaseProvider from '../components/Firebase/FirebaseProvider';
import Dashboard from '../components/Dashboard/Dashboard';

export default function index(props){
  return (
    <FirebaseProvider>
      <Router >
        <Dashboard path="/dashboard"/> 
      </Router>
    </FirebaseProvider>
    
  )
}