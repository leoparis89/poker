require("dotenv").config();
import { server } from "./app";
import "./io";
import { settings } from "./settings";

const { port, version } = settings;

server.listen(port, () => {
  console.log(`Poker v${version} is listening on port ${port}`);
});
