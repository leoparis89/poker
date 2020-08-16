require("dotenv").config();
import { server } from "./app";
import "./io";
import { settings } from "./settings";

import pjson from "../package.json";
const { port } = settings;

server.listen(port, () => {
  console.log(`Poker v${pjson.version} is listening on port ${port}`);
});
