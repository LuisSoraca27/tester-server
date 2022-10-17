const express = require("express");

//controllers
const {
  createCommerce,
  createCategoryCommerce,
  getAllCommerce,
  getCommerceById,
} = require("../controllers/commerce.controller");

//utils
const { upload } = require("../utils/multer.util");

// Middlewares
const {
  protectSession,
  protectUsersAccount,
  protectAdmin,
} = require("../middlewares/auth.middlewares");

const commerceRouter = express.Router();

commerceRouter.post("/category", createCategoryCommerce);

commerceRouter.get("/", getAllCommerce)

commerceRouter.get("/:id", getCommerceById)

// Protecting below endpoints
commerceRouter.use(protectSession);

commerceRouter.post("/", upload.single("logoCommerce"), createCommerce);

module.exports = {
  commerceRouter,
};
