const Order = require("../models/order");
const Product = require("../models/product");


exports.getAllOrders = (req, res, next) => {
    Order.find().select("product quantity _id").then(data => {
      res.status(200).json({
        allOrders: data.length,
        orders: data.map(order => {
          return {
            orderId: order._id,
            product: order.product,
            quantity: order.quantity
          }
        })
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.createOrder = (req, res, next) => {
    Product.findById(req.body.productId).then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        })
      }
      const order = new Order({
        product: req.body.productId,
        quantity: req.body.quantity
      })
      return order.save()
    })
    .then(result => {
      console.log(result)
      res.status(201).json({
        message: "Order has been created successfully",
        createdOrder: {
          orderId: result._id,
          product: result.product,
          quantity: result.quantity
        },
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
}


exports.getOneOrder = (req, res, next) => {
    Order.findById(req.params.orderId).populate("product").then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        })
      }
      res.status(200).json({
        order: order
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}



exports.deleteOrder = (req, res, next) => {
    const id = req.params.orderId
    Order.findByIdAndDelete(id).then(result => {
      res.status(200).json({
        message: "Order have been deleted"
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}