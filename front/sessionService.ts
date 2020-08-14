import Axios from "axios";
import { Profile } from "passport-google-oauth20";

export const getProfile = (): Promise<Profile> =>
  Axios.get("/profile").then(r => r.data);
