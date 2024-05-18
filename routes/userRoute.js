const express = require("express");
const {
  registerUser,
  loginUser,
  logoutuser,
  getUserDetails,
} = require("../controllers/userController.js");
const { isAuthenticatedUser, authorizeRole } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutuser);
router.route("/me").get(isAuthenticatedUser, getUserDetails);

module.exports = router;
