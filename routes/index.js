const express = require("express");
const router = express.Router();

const loginRoutes = require("./auth");

const addRooms = require("./crud_rooms");
const { auth, isAdmin } = require("../middlewares/auth");

// router.use("/firstnames", auth, firstnameRoutes);
router.use("/", loginRoutes);
router.use("/admin", auth, isAdmin, addRooms);
module.exports = router;
