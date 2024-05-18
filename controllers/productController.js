const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary").v2;

// create product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const uploadedFiles = req.files.images;
  const fileArray = Array.isArray(uploadedFiles)
    ? uploadedFiles
    : [uploadedFiles];
  const uploadedImages = [];
  for (const file of fileArray) {
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.uploader.upload(fileUri.content, {
      folder: "csci467",
    });
    uploadedImages.push({
      public_id: myCloud.public_id,
      url: myCloud.url,
    });
  }
  const productData = {
    ...req.body,
    images: uploadedImages,
    user: req.user.id,
  };
  const product = await Product.create(productData);
  res.status(201).json({
    success: true,
    product,
  });
});

// Get All product
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const productCount = await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .condition();
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

// Update product --Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  if (req.files?.images) {
    const uploadedFiles = req.files.images;
    const fileArray = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : [uploadedFiles];
    const uploadedImages = [];
    for (const file of fileArray) {
      const fileUri = getDataUri(file);
      const myCloud = await cloudinary.uploader.upload(fileUri.content, {
        folder: "uploads",
      });
      uploadedImages.push({
        public_id: myCloud.public_id,
        url: myCloud.url,
      });
    }
    req.body.images = uploadedImages;
  }
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }
  product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete product --Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }
  await product.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    Message: "product deleted successfully",
  });
});

// Get One product
exports.getProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});
