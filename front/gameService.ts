import Axios from "axios";

export const gameService = {
  new: () => Axios.post("/game/new").then(getData),
};

const getData = (d) => d.data;
