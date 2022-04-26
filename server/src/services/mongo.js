const mongoose = require('mongoose');

require('dotenv').config(); // this if for API tests.

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('mongoDB connection ready!');
});

mongoose.connection.once('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  // these 4 parameters should be set otherwise mongodb will give you a warning
  // mongoose 6 doesn't require option parameters to be set
  await mongoose.connect(MONGO_URL, {
    // useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
  });
}

async function mongoDisconnect() {
  // mongo will know that database wh are connecting to
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
