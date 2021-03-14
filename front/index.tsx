import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
require("./disableBootstrapCardStyle.css");
require("cardsJS/dist/cards.js");
require("cardsJS/dist/cards.css");
import "react-toastify/dist/ReactToastify.css";
import ReactDOM from "react-dom";
import { App } from "./App";

ReactDOM.render(<App />, document.getElementById("app"));
