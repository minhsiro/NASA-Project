const express = require("express");

const { planesRouter } = require("./planets/planets.router");
const { launchesRouter } = require("./launches/launches.router");

const api = express.Router();

api.use(planesRouter);

api.use("/launches", launchesRouter);

module.exports = api;
