import React, {useEffect} from "react";
import {navigate} from "gatsby";

export default function index(props){
  useEffect(()=>{
    navigate('/fairybiome/')
  },[]);
  return (
    <div>

    </div>
  )
}
