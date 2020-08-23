
const isBrowser = () => typeof window !== "undefined";

export const localStorageIO = {

  getItem: (name, defaultValue) => {
    if (isBrowser()) {
      return localStorage.getItem(name) || defaultValue;
    }
    return defaultValue;
  },

  setItem: (name, value) => {
    console.log(`biomebotIO localStorage write(${name})`);
    if (isBrowser()) {
      localStorage.setItem(name, value);
    }
  },

  removeItem: (name) => {
    if (isBrowser()) {
      localStorage.removeItem(name);
    }
  },

  getJson: (name) => {
    if (isBrowser()) {
      const payload = localStorage.getItem(name) || null;
      let data = null;
      if (payload) {
        try {
          data = JSON.parse(payload);
        } catch (e) {
          return null;
        }
        return data;
      }
    }
    return null;
  },

  setJson: (name, value) => {
    console.log(`biomebotIO localStorage write(${name})`);
    if (isBrowser()) {
      const payload = JSON.stringify(value);
      localStorage.setItem(name, payload);
    }
  }

};
