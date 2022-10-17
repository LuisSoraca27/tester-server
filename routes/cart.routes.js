const express = require("express");


//controllers
const {
    addProductInCart,
    updateProductInCart,
    deleteProductInCart,
    getProductInCart,
  } = require("../controllers/cart.controllers");

  const { purchased } = require("../controllers/record.controller")


  //middlewares
  const { cartExist, excessQtyProduct } = require("../middlewares/cart.middlewares")
const { protectSession } = require("../middlewares/auth.middlewares")


const cartRouter = express.Router();


cartRouter.use(protectSession);

cartRouter.get("/", getProductInCart)

cartRouter.post("/add-product", excessQtyProduct, addProductInCart);

cartRouter.patch(
  "/update-cart",
  cartExist,
  excessQtyProduct,
  updateProductInCart
);

cartRouter.delete("/:productId", cartExist, deleteProductInCart);

cartRouter.post("/purchased", purchased)

module.exports = {
    cartRouter,
}