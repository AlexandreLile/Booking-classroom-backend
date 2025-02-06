const express = require("express");
const router = express.Router();
const loginRoutes = require("./auth");
const addRooms = require("./crud_rooms");
const { auth } = require("../middlewares/auth");

router.use("/", loginRoutes);
router.use("/", auth, addRooms);

module.exports = router;
