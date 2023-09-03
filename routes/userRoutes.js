const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  res.json({ massege: "Register the user" });
});

router.post("/login", (req, res) => {
  res.json({ massege: "login user" });
});

router.get("/current", (req, res) => {
  res.json({ massege: "Current user information" });
});

module.exports = router;