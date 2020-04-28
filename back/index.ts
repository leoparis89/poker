import * as express from "express";

const app = express();

const root = "/api";

app.get(root + "/new", function (req, res) {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("app started");
});
