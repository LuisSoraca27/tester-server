const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Models
const { User } = require("../models/user.model");
const { Record } = require("../models/record.model");
const { Cart } = require("../models/cart.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const { Product } = require("../models/product.model");


// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");


dotenv.config({ path: "./config.env" });

// Gen random jwt signs
// require('crypto').randomBytes(64).toString('hex') -> Enter into the node console and paste the command

// const getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.findAll({
//     attributes: { exclude: ["password"] },
//     where: { status: "active" },
//   });

//   res.status(200).json({
//     status: "success",
//     data: { users },
//   });
// });

const getDataUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  sessionUser.password = undefined;

  res.status(200).json({
    status: "success",
    data: { sessionUser },
  });
});

const createUser = catchAsync(async (req, res, next) => {

  const { firstName, lastName, address, mobile, email, password, role } =
    req.body;

  if (role !== "admin" && role !== "consumer") {
    return next(new AppError("Invalid role", 400));
  }

  // Encrypt the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    firstName,
    lastName,
    address,
    mobile,
    email,
    password: hashedPassword,
    role,
  });

  // Remove password from response
  newUser.password = undefined;

  // 201 -> Success and a resource has been created
  res.status(201).json({
    status: "success",
    data: { newUser },
  });
});

const updateDataUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, address, mobile, email } = req.body;
  const { user } = req;

  await user.update({ firstName, lastName, address, mobile, email });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: { user },
  });
});


const updatePasswordUser = catchAsync(async (req, res, next) => {
  const {password, newPassword} = req.body
  const { user } = req

  if(!(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Password invalid", 400))
  }

  // Encrypt the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
   
  await user.update({ password: hashedPassword})

  res.status(200).json({
    status:'success'
  })

})


const login = catchAsync(async (req, res, next) => {
  // Get email and password from req.body
  const { email, password } = req.body;

  // Validate if the user exist with given email
  const user = await User.findOne({
    where: { email, status: "active" },
  });

  // Compare passwords (entered password vs db password)
  // If user doesn't exists or passwords doesn't match, send error
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Wrong  credentials", 400));
  }

  // Remove password from response
  user.password = undefined;

  // Generate JWT (payload, secretOrPrivateKey, options)
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.status(200).json({
    status: "success",
    data: { user, token },
  });
});

const getRecordUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const records = await Record.findAll({
    where: { userId: sessionUser.id, status: "active" },
    include: {
      model: Cart,
      attributes: ["id", "userId", "status"],
      include: {
        model: ProductsInCart,
        attributes: ["id", "productId", "quantity", "status"],
        include: { model: Product, attributes: ["id", "name"] },
      },
    },
  });

  res.status(200).json({
    status: "success",
    data: { records },
  });
})

const getRecordById = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const record = await Record.findOne({
    where: { userId: sessionUser.id, id },
    include: {
      model: Cart,
      attributes: ["id", "userId", "status"],
      include: {
        model: ProductsInCart,
        attributes: ["id", "productId", "quantity", "status"],
        include: { model: Product, attributes: ["id", "name"] },
      },
    },
  });

  if (!record) {
    return next(new AppError("this record not exist", 404));
  }

  res.status(200).json({
    status: "success",
    data: { record },
  });
});


module.exports = {
  getDataUser,
  createUser,
  updateDataUser,
  updatePasswordUser,
  login,
  getRecordUser,
  getRecordById,
};
