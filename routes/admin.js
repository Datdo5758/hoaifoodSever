const express = require("express");
const adminControllers = require("../controllers/admin");
const auth = require("../middleware/auth");
const router = express.Router();
const { body } = require("express-validator");

router.get("/admin/orders", adminControllers.getAllOrder);

router.get("/admin/users", adminControllers.getAllUser);

router.post(
  "/admin/addNewProduct",
  [
    body("name")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Name phải dài hơn 5 ký tự"),
    body("long_desc")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Long description too short"),
    body("short_desc")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Short description too short"),
  ],

  adminControllers.postNewProduct
);
router.put(
  "/admin/editProduct/:prodId",
  [
    body("name")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Name phải dài hơn 5 ký tự"),
    body("long_desc")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Long description too short"),
    body("short_desc")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Short description too short"),
  ],
  auth.authClients,
  adminControllers.editProduct
);

router.get("/admin/products", adminControllers.getProducts);
router.get("/products/hot", adminControllers.getHotProducts);
router.get("/admin/product/:prodId", adminControllers.getProduct);
router.delete(
  "/admin/delete/:prodId",
  auth.authClients,
  adminControllers.deleteProduct
);

router.get("/admin/orders", auth.authClients, adminControllers.getAllOrder);

router.get("/admin/users", auth.authClients, adminControllers.getAllUser);

module.exports = router;
