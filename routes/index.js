const express = require("express");
const router = express.Router();

const loginRoutes = require("./auth");

const addRooms = require("./crud_rooms");
const addMaterial = require("./crud_materials");
const { auth, isAdmin } = require("../middlewares/auth");

// router.use("/firstnames", auth, firstnameRoutes);
router.use("/", loginRoutes);
router.use("/admin", auth, isAdmin, addRooms);
router.use("/admin", auth, isAdmin, addMaterial);
module.exports = router;
