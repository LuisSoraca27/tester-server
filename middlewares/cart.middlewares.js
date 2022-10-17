//models
const { Product } = require("../models/product.model");
const { Cart } = require("../models/cart.model");


// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");



const cartExist = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { status: "active", userId: sessionUser.id },
  });

  if (!cart) {
    return new AppError("Cart not found", 404);
  }
  req.cart = cart
  next();
});



const excessQtyProduct = catchAsync(async (req, res, next) => {
  const { quantity, productId } = req.body;

  const product = await Product.findOne({
    where: { id: productId, status: "active" },
  });

  if (!product) {
    return next(new AppError('Product does not exists', 404));
  } else if (quantity > product.quantity) {
    return next(
      new AppError(`This product only has ${product.quantity} items.`, 400)
    );
  }

  next();
});


module.exports = {
  cartExist,
  excessQtyProduct,
};