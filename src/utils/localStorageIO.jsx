
const isBrowser = () => typeof window !== "undefined";

export const localStorageIO = {

  getItem: (name, defaultValue) => {
    if (isBrowser()) {
      return localStorage.getItem(name) || defaultValue;
    }
    return defaultValue;
  },

  setItem: (name, value) => {
    if (isBrowser()) {
      localStorage.setItem(name, value);
    }
  },

  getJson: (name, defaultValue) => {
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
    return defaultValue;
  },

  setJson: (name, value) => {
    if (isBrowser()) {
      const payload = JSON.stringify(value);
      localStorage.setItem(name, payload);
    }
  }

};
