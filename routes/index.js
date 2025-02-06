const express = require("express");
const router = express.Router();
const loginRoutes = require("./auth");
const addRooms = require("./crud_rooms");
const materials = require("./crud-materials");
const { auth } = require("../middlewares/auth");

router.use("/", loginRoutes);
router.use("/", auth, addRooms);
router.use("/", auth, materials);

module.exports = router;
