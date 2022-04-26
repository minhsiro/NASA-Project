const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const api = require('./routes/api');

// this is a huge object
const app = express();

/**
 * app.use() add a new middleware to the app
 * essentially, whenever a request hits your backend,
 * Express will execute the functions you passed to app.use()
 * in order.
 */

/**
 * a middleware is a function or a piece of code that
 * runs between when a server gets a request from a client
 */

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

// a middleware for logging out information about users' requests
app.use(morgan('combined'));

// you don't need express.json() or express.urlencoded() for GET or DELETE requests
// express use body-parser under the hood for this express.json() middleware
//
// JSON parsing is the process of converting a JSON object in text format to a javascript
// object that can be used inside a program.
// without express.json(), the request body will not be populated & will be undefined.
app.use(express.json());
// console.log("express.json(): ", express.json()); // [Function: jsonParser]

// api endpoints
app.use('/v1', api);

// this code allow express/node to access our built React project using the express.static
// function
// app.use(express.static(path.join(__dirname, '..', 'public')));

// if all the requests come in are not handled by our apis, our server will response with
// our react app.
// if we don't have this code and the user type something like:
// http://localhost:5000/asd123asd123
// it will show: CANNOT GET /asd123asd123
app.get('/*', (req, res) => {
  console.log('run');
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/*
if there is only express.static: user can only call to localhost:5000/
if there is no express.static: user cant get anything
*/

module.exports = app;
