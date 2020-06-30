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

  readJson: (name) => {
    if(isBrowser()){
      const payload = localStorage.getItem(name) || null;
      if(payload){
        return JSON.parse(payload)
      }
    }
    return undefined;
  },

  setJson: (name,value) =>{
    if(isBrowser()){
      const payload = JSON.stringify(value);
      localStorage.setItem(name,payload);
    }
  }

}