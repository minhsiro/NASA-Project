const axios = require('axios');

// when you loop through a map object, it always returns the same order
// of properties in which you declare them, which is not guaranteed by normal object.
// const launches = new Map();

// launches database

// mongo.js => database layer
// model.js => data access layer
// data access layer shouldn't be talking to other data access layers.
// it should be talking to the database layer
const launchesMongoDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

async function findLaunch(filter) {
  return await launchesMongoDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  // sort ascending order: low to high
  const latestLaunch = await launchesMongoDatabase
    .findOne()
    .sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesMongoDatabase
    .find(
      {},
      // exclude _id & __v from the response
      { _id: 0, __v: 0 }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.find({ keplerName: launch.target });

  if (planet.length === 0) {
    throw new Error('No matching planet was found!');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['ZTM', 'Minh'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('downloading launches data');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) console.log('launch data already loaded');
  else await populateLaunches();
}

async function saveLaunch(launch) {
  // first parameter check if the flightNumber is already existed,
  // if existed, update the data
  // if it hasn't existed, insert new data

  // findOneAndUpdate will exclude "$setOnInsert" from the response
  // so that the hackers don't know that we are using mongodb
  await launchesMongoDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function abortLaunchById(launchId) {
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  console.log(aborted);
  return aborted.modifiedCount;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  // addNewLaunch,
  scheduleNewLaunch,
  abortLaunchById,
  loadLaunchesData,
};
