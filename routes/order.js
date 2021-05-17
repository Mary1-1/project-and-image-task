const express = require("express")
const router = express.Router()

const orderCtrl = require('../controllers/order')
const userAuth = require('../middleware/user-auth')


router.get("/", userAuth, orderCtrl.getAllOrders)

router.post("/", userAuth, orderCtrl.createOrder)

router.get("/:orderId", userAuth, orderCtrl.getOneOrder)

router.delete("/:orderId", userAuth, orderCtrl.deleteOrder)

module.exports = router