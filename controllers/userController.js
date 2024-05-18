const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const { sendToken } = require("../utils/jwtToken");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const getDataUri = require("../utils/dataUri");
const Cart = require("../models/cartModel");

// Regiser a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  let myCloud;
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already registered. Please use a different email address.",
      });
    }

    const image = req.files.image;
    const fileUri = getDataUri(image);
    myCloud = await cloudinary.uploader.upload(fileUri.content, {
      folder: "csci467",
    });
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      verificationToken: "ldhkddk",
      verified: true,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    res.status(200).json({
      success: true,
      message: `${user.email} SignUp successfull!`,
    });
  } catch (error) {
    await cloudinary.uploader.destroy(myCloud.public_id);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // all the details of the current login user is saved in user
  const user = await User.findOne({ email: email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }
  if (!user.verified) {
    return next(
      new ErrorHandler("Please verify your account before logging in.", 401)
    );
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }
  sendToken(user, 200, res);
});

// logout
exports.logoutuser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res
    .status(200)
    .cookie("token", null, {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Logged Out",
    });
});

// Get User deatails
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});
