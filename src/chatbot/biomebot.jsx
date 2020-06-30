const initialMemory={
  "{me}":"私",
};

export default class BiomeBot {
  constructor(){
    this.main={
      id : "",
      displayName : "",
      photoURL : "",
      timestamp : null,
      partOrder : [],
      description : "",
      published : true,
      hub:{
        availability: 0.6,
        generosity: 0.3,
        retention: 0.6,
      },
    };
    this.parts=new Object();
    this.memory=initialMemory;

  }

  setParam({main,parts,memory}){
    if(main !== undefined){ 
      const availability = Number(main.hub.availability);
      const generosity = Number(main.hub.generosity);
      const retention = Number(main.hub.retention);

      this.main = {
        ...params.main,
        hub:{
          availability: availability,
          generosity: generosity,
          retention: retention,
        },
      } 
    }
    
    if(parts !== undefined){
      this.parts = {...params.parts};
    }
    if(memory !== undefined){ 
      this.memory = {...params.memory};
    }
  }

    
}
