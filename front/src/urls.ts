const socketIO = process.env.POI_APP_SOCKET_IO_URL;
const googleAuth = process.env.POI_APP_GOOGLE_AUTH_URL;

// TODO move this in build stage
if (!socketIO) throw new Error("Env var POI_APP_SOCKET_IO_URL is missing!");
if (!googleAuth) throw new Error("Env var POI_APP_GOOGLE_AUTH_URL is missing!");

module.exports = {
  socketIO,
  googleAuth,
};
