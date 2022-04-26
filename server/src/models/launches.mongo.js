const mongoose = require('mongoose');

// available types: Number, String, Date, Buffer, Boolean, Mixed, Array, Map
// Schema, Decimal128, ObjectId

// Schema is a structure, much like a class for creating document (object for classes)
// a document is like a object that comes in the form of a schema (class)
// documents are stored in a collection. A collection can have many documents
// much like a class can have many objects derived from it unless it is a singleton.
const launchesSchema = new mongoose.Schema({
  flightNumber: { type: Number, required: true },
  launchDate: { type: Date, required: true },
  mission: { type: String, required: true },
  rocket: { type: String, required: true },
  target: {
    type: String,
    required: false,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

// model name should be singular, mongoose will then take what you pass in,
// lowercase it, make it plural & talk to the collection with that lowercase pluralized
// name.
module.exports = mongoose.model('Launch', launchesSchema);
