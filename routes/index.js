const express = require("express");
const router = express.Router();

// const firstnameRoutes = require("./firstname");
const loginRoutes = require("./auth");
const auth = require("../middlewares/auth");

// router.use("/firstnames", auth, firstnameRoutes);
router.use("/", loginRoutes);

module.exports = router;
