import { null } from "mathjs";

const isBrowser = () => typeof window !== "undefined";

export const localStorageIO = {
  
  getItem: (name,defaultValue) => {
    if(isBrowser()){
      return localStorage.getItem(name) || defaultValue;
    }
    return defaultValue;
  },

  setItem: (name,value) => {
    if(isBrowser()){
      localStorage.setItem(name,value);
    }
  },

  getJson: (name) => {
    if(isBrowser()){
      const payload = localStorage.getItem(name) || null;
      if(payload){
        try{
          payload =JSON.parse(payload);
        }
        catch (e){
          console.log("localStorageIO.getJson failed",e)
          return null;
        }
        return payload
      }
    }
    return null;
  },

  setJson: (name,value) =>{
    if(isBrowser()){
      const payload = JSON.stringify(value);
      localStorage.setItem(name,payload);
    }
  }

}