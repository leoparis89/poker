import Axios from "axios";

export const getProfile = (): Promise<IGoogleProfile> =>
  Axios.get("/profile").then(r => r.data);
