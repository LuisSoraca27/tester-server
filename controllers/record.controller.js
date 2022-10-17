// models
const { Record } = require("../models/record.model");
const { Cart } = require("../models/cart.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const { Product } = require("../models/product.model");

//utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");

const purchased = catchAsync(async (req, res, next) => {

  const { sessionUser } = req;
  let totalPrice = 0;

  const cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: "active",
    },
    include: [{ model: ProductsInCart }],
  });


  if(!cart) {
    return next(new AppError('Cart not found', 404))
  }

  const promisesCart = cart.productsInCarts.map(async (productInCart) => {


    const productId = productInCart.productId;
    const Qproduct = productInCart.quantity;

    const product = await Product.findOne({ where: { id: productId } });

    const newQproduct = (product.quantity - Qproduct)

    await product.update({ quantity: newQproduct });

    await productInCart.update({ status: "purchased" });

    const subTotal = (Qproduct * product.price)
    totalPrice += subTotal;


  });

  await Promise.all(promisesCart);

  await cart.update({ status: "purchased" });

  await Record.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  res.status(201).json({
    status: "success",
  });
});

module.exports = {
  purchased,
};
