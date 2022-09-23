const mongoose = require("mongoose");

const LocationsSchema = new mongoose.Schema(
  {
    iso2: {
      type: String,
    },
    iso3: {
      type: String,
    },
    country: {
      type: String,
    },
    cities: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Locations", LocationsSchema);
