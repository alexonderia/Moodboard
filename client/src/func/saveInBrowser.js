export const saveInBrowser = {
  save: (name, value) => {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    localStorage.setItem(name, value);
  },
  load: (name) => {
    const value = localStorage.getItem(name);
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
  remove: (name) => {
    localStorage.removeItem(name);
  }
};

export default saveInBrowser;
