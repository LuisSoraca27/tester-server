const express = require("express");

//controllers
const {
  createCategoryProduct,
  createProduct,
  getAllProducts,
} = require("../controllers/products.controller");

// Middlewares
const {
  protectSession,
  protectUsersAccount,
  protectAdmin,
} = require("../middlewares/auth.middlewares");

//utils
const { upload } = require("../utils/multer.util");



const productRouter = express.Router();

productRouter.get("/", getAllProducts)

productRouter.use(protectSession);

productRouter.post("/category", createCategoryProduct);

productRouter.post("/", upload.single("productImg"), createProduct);

module.exports = {
  productRouter,
};
