const router = require("express").Router();
const verifyBearerToken = require("../helper/verifyBearerToken");
const Locations = require("../models/Locations");

router.get("/all/countries", async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 10;
    const locations = await Locations.find({
      country: { $regex: query, $options: "i" },
    }).limit(limit);
    return res.status(200).json(locations);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/countries/:id/cities", async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 10;
    const locations = await Locations.findById(req.params.id);
    if (!query) {
      const cities = locations.cities.slice(0, limit);
      return res.status(200).json(cities);
    } else {
      const city = [];
      const cities = locations.cities.filter((city) => {
        return city.toLowerCase().includes(query.toLowerCase());
      });
      return res.status(200).json(cities);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
