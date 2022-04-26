const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse");
const planets = require("./planets.mongo");

const isHabitablePlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    1.11 > planet["koi_insol"] &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_prad"] < 1.6
  );
};

// this code run asynchronously
/*
const promise = new Promise((resolve, reject) => {
})
top level await
const data = await promise;
 */

// createReadStream inherit properites from Event Emitter.
// data without csv-parse is raw data (heximal values)
// data (a JS object) =  a chunk of data =  1 row
function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv"),
      "utf-8"
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // we have to use async/await here because it is mongoDB that
          // is storing our data, not javascript
          // upsert = insert + update
          await savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  // find, remove, create, ...
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  ); // {} => return all
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error("cloud not save planet, ", err);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
