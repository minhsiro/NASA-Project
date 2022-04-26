const http = require('http');

require('dotenv').config();

const app = require('./app');

const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

// front end runs on port 3000 by default, choose a different port to avoid conflict.
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// we can just use app.listen here
// there is no needed for "const server = ... "
async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
  });
}

startServer();

// app: a huge object with a lot of information
// server: also a huge object like app but have more information
// http.createServer(a requestListener function)
