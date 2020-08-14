import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { getProfile } from "./sessionService";
import { ToastContainer, toast } from "react-toastify";
import { Profile } from "passport-google-oauth20";

interface ISessionContext {
  user: undefined | Profile;
  setUser: any;
}
const initalContext: ISessionContext = {
  user: undefined,
  setUser: () => {}
};

export const SessionContext = React.createContext(initalContext);

export function Session(props) {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    if (window.location.pathname === "/login" || user) {
      return;
    }

    getProfile()
      .then(profile => {
        setUser(profile as any);
      })
      .catch(err => {
        if (err.response.status === 401) {
          logout();
        }
        toast.error("Failed to fetch profile...");
      });
  });
  return (
    <SessionContext.Provider value={{ user, setUser }}>
      {props.children}
    </SessionContext.Provider>
  );
}

export const logout = () => {
  Cookies.set("loggedIn", "");
  window.location.reload();
};
