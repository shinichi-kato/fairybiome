import InternalRepr from './internalRepr.jsx';
import textRetriever from './textRetriever.jsx';
import {randomInt} from 'mathjs';

const internalRepr = new InternalRepr();


export default class Part {
  constructor(obj){
    this.type=obj.type;
    this.behavior={
      availability: parseFloat(obj.behavior.availability),
      generosity: parseFloat(obj.behavior.generosity),
      retention: parseFloat(obj.behavior.retention),
    }
    this.dict = [...obj.dict];
  }

  dump(){
    return{
      type : this.type,
      behavior:{
        ...this.behavior
      },
      dict: this.dict
    }
  }

}