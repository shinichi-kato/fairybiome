const isBrowser = () => typeof window !== "undefined";

export const localStorageIO = {
  
  getItem: (name,defaultValue=null) => {
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


}