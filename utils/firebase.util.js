const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const { LogoImg } = require("../models/logoImg.model");
const { ProductImg } = require("../models/productImg.model");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// Storage service
const storage = getStorage(firebaseApp);

const uploadLogoCommerce = async (img, commerceId) => {
  const [originalName, ext] = img.originalname.split(".");

  const filename = `Logo/commerce${commerceId}/${originalName}-${Date.now()}.${ext}`;
  const imgRef = ref(storage, filename);

  // Upload image to Firebase
  const result = await uploadBytes(imgRef, img.buffer);

  await LogoImg.create({
    commerceId,
    imgUrl: result.metadata.fullPath,
  });
};

const getLogoCommerce = async (commerces) => {
  const promisesCommerce = commerces.map(async (commerce) => {
    const imgRef = ref(storage, commerce.logoImg.imgUrl);

    const imgUrl = await getDownloadURL(imgRef);

    commerce.logoImg.imgUrl = imgUrl;
    return commerce;
  });
  await Promise.all(promisesCommerce);
};

const uploadImgProduct = async (img, productId) => {
  const [originalName, ext] = img.originalname.split(".");

  const filename = `ImgProduct/${productId}/${originalName}-${Date.now()}.${ext}`;
  const imgRef = ref(storage, filename);

  // Upload image to Firebase
  const result = await uploadBytes(imgRef, img.buffer);

  await ProductImg.create({
    productId,
    imgUrl: result.metadata.fullPath,
  });
};

const getImgProducts = async (products) => {
  const promisesProducts = products.map(async (product) => {
    const promisesProductImgs = product.productImgs.map(async (productImg) => {
      const imgRef = ref(storage, productImg.imgUrl);

      const imgUrl = await getDownloadURL(imgRef);

      productImg.imgUrl = imgUrl;
      return productImg;
    });
    const productImgs = await Promise.all(promisesProductImgs);
    product.productImgs = productImgs;
    return product;
  });

  return await Promise.all(promisesProducts);
};

module.exports = {
  uploadLogoCommerce,
  getLogoCommerce,
  uploadImgProduct,
  getImgProducts,
};
