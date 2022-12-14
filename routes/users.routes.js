const express = require("express");

// Controllers
const {
  createUser,
  updateDataUser,
  updatePasswordUser,
  login,
  getDataUser,
  getRecordUser,
  getRecordById,
} = require("../controllers/users.controller");

// Middlewares
const { userExists } = require("../middlewares/users.middlewares");
const {
  protectSession,
  protectUsersAccount,
  protectAdmin,
} = require("../middlewares/auth.middlewares");

const {
  createUserValidators,
} = require("../middlewares/validators.middlewares");

const usersRouter = express.Router();

usersRouter.post("/login", login);

usersRouter.post("/", createUserValidators, createUser);

// Protecting below endpoints
usersRouter.use(protectSession);

usersRouter.get("/", getDataUser);

usersRouter.get("/records", getRecordUser);

usersRouter.get("/records/:id", getRecordById)

usersRouter.put("/:id", userExists, protectUsersAccount, updateDataUser);

usersRouter.patch("/:id", userExists, protectUsersAccount, updatePasswordUser);

module.exports = { usersRouter };
