// models
const { ProductsInCart } = require("../models/productsInCart.model");
const { Cart } = require("../models/cart.model");
const { CategoryProduct } = require("../models/categoryProduct.model");
const { Commerce } = require("../models/commerce.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { Product } = require("../models/product.model");

const getProductInCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: "active" },
    attributes: ["id"],
    include: [
      {
        model: ProductsInCart,
        required: false,
        where: { status: "active" },
        attributes: ["id", "productId", "quantity"],
        include: [
          {
            model: Product,
            attributes: ["id", "name", "description", "price", "quantity"],
            include: [{ model: CategoryProduct, attributes: ["id", "name"] }],
          },
        ],
      },
    ],
  });

  if (!cart) {
    next(new AppError("There are no products in the cart", 400));
  }

  res.status(200).json({
    status: "success",
    data: { cart },
  });
});

const addProductInCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: "active" },
  });

  if (!cart) {
    // Assign cart to user (create cart)
    const newCart = await Cart.create({ userId: sessionUser.id });

    await ProductsInCart.create({ cartId: newCart.id, productId, quantity });
  } else {
    // Cart already exists
    const productInCart = await ProductsInCart.findOne({
      where: { productId, cartId: cart.id },
    });

    if (!productInCart) {
      // Add product to current cart
      await ProductsInCart.create({ cartId: cart.id, productId, quantity });
    } else if (productInCart.status === "active") {
      return next(
        new AppError("This product is already active in your cart", 400)
      );
    } else if (productInCart.status === "removed") {
      await productInCart.update({ status: "active", quantity });
    }
  }

  res.status(200).json({
    status: "success",
  });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { quantity, productId } = req.body;
  const { cart } = req;

  const productInCart = await ProductsInCart.findOne({
    where: { productId, cartId: cart.id },
  });

  if (quantity === 0 && productInCart.status === "active") {
    productInCart.update({ status: "removed" });
  } else if (quantity !== 0 && productInCart.status === "removed") {
    productInCart.update({ status: "active" });
  }

  await productInCart.update({ quantity });

  res.status(200).json({
    status: "success",
  });
});

const deleteProductInCart = catchAsync(async (req, res, next) => {
  const { cart } = req;
  const { productId } = req.params;

  const productInCart = await ProductsInCart.findOne({
    where: { productId, cartId: cart.id, status: "active" },
  });

  if (!productInCart) {
    return next(new AppError("This product is not in your cart"));
  }

  await productInCart.update({
    quantity: 0,
    status: "removed",
  });

  res.status(200).json({
    status: "success",
  });
});

module.exports = {
  addProductInCart,
  updateProductInCart,
  deleteProductInCart,
  getProductInCart,
};
