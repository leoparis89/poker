import pjson from "../../package.json";
const { version } = pjson;

export const settings = {
  port: 3000,
  version,
  oAuth: {
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
    redirectUrl: process.env.REDIRECT_URL!,
  },
};
