const express = require("express");
const {
  register,
  login,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  logOut,
} = require("../controllers/userController");

const {
  verifyOrganizerToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/auth");
const validateObjectId = require("../middlewares/validateObjectId");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put(
  "/user/:id",
  validateObjectId,
  verifyTokenAndAuthorization,
  updateUser
);
router.get("/users", verifyOrganizerToken, getAllUsers);
router.get("/user/:id", validateObjectId, verifyOrganizerToken, getUserById);
router.delete("/user/:id", validateObjectId, verifyOrganizerToken, deleteUser);
router.post(
  "/logout/:id",
  validateObjectId,
  verifyTokenAndAuthorization,
  logOut
);
module.exports = router;
