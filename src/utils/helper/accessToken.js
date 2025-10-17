export const getuserAccessToken = ({ tokenName }) => {
  return sessionStorage.getItem(tokenName);
};

export const setuserAccessToken = ({ tokenName, token }) => {
  sessionStorage.setItem(tokenName, token);
};

export const removeuserAccessToken = ({ tokenName }) => {
  sessionStorage.removeItem(tokenName);
};

export const getItemfromSessionStorage = ({ tokenName }) => {
  return sessionStorage.getItem(tokenName);
};

export const setIteminSessionStorage = ({ tokenName, token }) => {
  sessionStorage.setItem(tokenName, token);
};

export const removeItemfromSessionStorage = ({ tokenName }) => {
  sessionStorage.removeItem(tokenName);
};
