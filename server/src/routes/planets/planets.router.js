const express = require("express");
const { httpGetAllPlanets } = require("./planets.controller");

const planesRouter = express.Router();

planesRouter.get("/planets", httpGetAllPlanets);

module.exports = {
  planesRouter,
};
