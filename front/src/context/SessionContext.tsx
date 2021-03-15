import Cookies from "js-cookie";
import { Profile } from "passport-google-oauth20";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getProfile } from "../sessionService";
import { socketService } from "../socketService";

interface ISessionContext {
  user: undefined | Profile;
  connected: boolean;
  setUser: any;
}
const initalContext: ISessionContext = {
  connected: false,
  user: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUser: () => {}
};

export const SessionContext = React.createContext(initalContext);

export function Session(props) {
  const [user, setUser] = useState<Profile>();
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (window.location.pathname === "/login" || user) {
      return;
    }

    getProfile()
      .then(profile => {
        socketService.init();
        socketService.socket
          .on("disconnect", () => setConnected(false))
          .on("connect", () => setConnected(true));

        setUser(profile);
      })
      .catch(err => {
        if (err.response.status === 401) {
          logout();
        }
        toast.error("Failed to fetch profile...");
      });
  });
  return (
    <SessionContext.Provider value={{ user, setUser, connected }}>
      {props.children}
    </SessionContext.Provider>
  );
}

export const logout = () => {
  Cookies.set("loggedIn", "");
  window.location.href = "/login";
};
