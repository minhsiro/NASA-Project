const {
  getAllLaunches,
  // addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  scheduleNewLaunch,
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  // if the request body is missing of the required fields
  // response will status code 400
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'Mission required launch property',
    });
  }

  // if launchDate is in the wrong format
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    // convert JS object to a JSON object & send it back to the client
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  await scheduleNewLaunch(launch);
  console.log(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  // launchId = flightNumber
  const launchId = +req.params.id;

  // if launch doesn't exist
  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }

  // if launch does exist
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: 'launch not aborted!',
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
