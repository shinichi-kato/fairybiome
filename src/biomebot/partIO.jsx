export default class PartIO {
  constructor(obj){
    this.type=obj.type;
    this.behavior={
      availability: parseFloat(obj.behavior.availability),
      generosity: parseFloat(obj.behavior.generosity),
      retention: parseFloat(obj.behavior.retention),
    }
    this.dict = [...obj.dict];
  }

  dump = () => {
    return{
      type : this.type,
      behavior:{
        ...this.behavior
      },
      dict: this.dict
    }
  }   
}