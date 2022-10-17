// models
const { Commerce } = require("../models/commerce.model");
const { CategoryCommerce } = require("../models/categoryCommerce.model");
const { User } = require("../models/user.model");
const { LogoImg } = require("../models/logoImg.model");

// utils
const { catchAsync } = require("../utils/catchAsync.util");
const { uploadLogoCommerce, getLogoCommerce } = require("../utils/firebase.util");
const { AppError } = require('../utils/appError.util')


const createCommerce = catchAsync(async (req, res, next) => {
  const { name, description, address, categoryCommerceId } = req.body;

  const { sessionUser } = req;

  const newCommerce = await Commerce.create({
    name,
    description,
    address,
    categoryCommerceId,
    userId: sessionUser.id,
  });

  await uploadLogoCommerce(req.file, newCommerce.id);

  res.status(201).json({
    status: "success",
    data: { newCommerce },
  });
});

const createCategoryCommerce = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await CategoryCommerce.create({ name });

  res.status(201).json({
    status: "success",
    data: { newCategory },
  });
});

const getAllCommerce = catchAsync(async (req, res, next) => {
  const commerces = await Commerce.findAll({
    where: { status: "active" },
    attributes: ["id", "name", "description", "address", "createdAt",  ],
    include: [
      { model: User, attributes: ["id", "firstName", "lastName"] },
      { model: CategoryCommerce, attributes: ["id", "name"] },
      { model: LogoImg },
    ],
  });

   await getLogoCommerce(commerces)
   
  res.status(200).json({
    status: "success",
    data: { commerces },
  });
});

const getCommerceById = catchAsync( async (req, res, next) => {

  const {id} = req.params 

  const commerce = await Commerce.findAll({
    where: {status: "active", id},
    attributes: ["id", "name", "description", "address", "createdAt",  ],
    include: [
      { model: User, attributes: ["id", "firstName", "lastName"] },
      { model: CategoryCommerce, attributes: ["id", "name"] },
      { model: LogoImg },
    ],
  })

  if(!commerce) {
    next(new AppError("Commerce not found", 400))
  }

   await getLogoCommerce(commerce)

  res.status(200).json({
    status:'success',
    data: {commerce}
  })
})

module.exports = {
  createCommerce,
  createCategoryCommerce,
  getAllCommerce,
  getCommerceById,
};
