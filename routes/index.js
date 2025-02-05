const express = require("express");
const router = express.Router();

const loginRoutes = require("./auth");

const addRooms = require("./crud_rooms");
// const auth = require("../middlewares/auth");

// router.use("/firstnames", auth, firstnameRoutes);
router.use("/", loginRoutes);
router.use("/admin", addRooms);
module.exports = router;
