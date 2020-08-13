require("dotenv").config();
import { server } from "./app";
import "./io";
import { settings } from "./settings";

const { port } = settings;

server.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
