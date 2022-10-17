// Models
const { CategoryProduct } = require('../models/categoryProduct.model')
const { Product } = require('../models/product.model')
const { Commerce } = require('../models/commerce.model')
const { ProductImg } = require('../models/productImg.model')

//Utils
const { catchAsync } = require('../utils/catchAsync.util')
const { AppError } = require('../utils/appError.util')
const { uploadImgProduct, getImgProducts } = require('../utils/firebase.util')



const createCategoryProduct = catchAsync( async (req, res, next) => {

    const { name } = req.body

    const newCategory = await CategoryProduct.create({
        name,
    })

    res.status(200).json({
        status:'success',
        data:{newCategory}
    })
})

const createProduct = catchAsync( async (req, res, next) => {

    const { name, description, quantity, price, categoryProductId } = req.body;

    const { sessionUser } = req;

    const commerce = await Commerce.findOne({
        where: {userId: sessionUser.id, status:'active'}
    })
  
    const newProduct = await Product.create({
      name,
      description,
      quantity,
      price,
      categoryProductId,
      commerceId: commerce.id,
    });

    await uploadImgProduct(req.file, newProduct.id)

    res.status(200).json({
        status: "success",
        data: {newProduct}
    })
})

const getAllProducts = catchAsync(async (req, res, next) => {

    const products = await Product.findAll({
      where: { status: "active" },
      attributes: ["id", "name", "description", "quantity", "price","createdAt",  ],
      include: [
        { model: Commerce, attributes: ["id", "name"] },
        { model: CategoryProduct, attributes: ["id", "name"] },
        { model: ProductImg },
      ],
    });
  
      await getImgProducts(products)
     
    res.status(200).json({
      status: "success",
      data: { products },
    });
  });


module.exports = {
    createCategoryProduct,
    createProduct,
    getAllProducts,
}