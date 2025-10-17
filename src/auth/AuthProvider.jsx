import { createContext, useContext, useState, useEffect } from "react";
import { getUserMe } from "@/api/AdminServices";
import { get } from "lodash";
import {
  getuserAccessToken,
  removeuserAccessToken,
  setuserAccessToken,
} from "../utils/helper/accessToken";

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const savedUser = localStorage.getItem('userData');
    const savedUser = getuserAccessToken({ tokenName: "userData" });
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      // localStorage.setItem("userData", JSON.stringify(userData));
      setuserAccessToken({
        tokenName: "userData",
        token: JSON.stringify(userData),
      });
      setUser(userData);

      // Fetch and store store_id
      // const response = await getUserMe();
      // const storeId = response?.data?.store_id;
      // if (storeId) {
      //   localStorage.setItem('storeId', storeId);
      // }

      return Promise.resolve();
    } catch (error) {
      console.error("Login error:", error);
      return Promise.reject(error);
    }
  };

  const logout = () => {
    // localStorage.removeItem("userData");
    removeuserAccessToken({ tokenName: "userData" });
    localStorage.removeItem("cartItems");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
