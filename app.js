const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// Routers
const { usersRouter } = require("./routes/users.routes");
const { commerceRouter } = require("./routes/commerce.routes");
const { productRouter } = require("./routes/product.routes");
const { cartRouter } = require("./routes/cart.routes");

// Controllers
const { globalErrorHandler } = require("./controllers/error.controller");

// Init our Express app
const app = express();

// Enable Express app to receive JSON data
app.use(express.json());

app.use(helmet());

app.use(compression());

app.use(morgan("combined"));

// Define endpoints

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/commerce", commerceRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);

// Global error handler
app.use(globalErrorHandler);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
});


// Catch non-existing endpoints
app.all("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `${req.method} ${req.url} does not exists in our server`,
  });
});

module.exports = { app };
