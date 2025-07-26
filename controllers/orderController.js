const Order = require('../models/order');
const Product = require('../models/product');

exports.placeOrder = async (req, res, next) => {
  try {
    const { products } = req.body;
    const buyerId = req.user.id;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one product' });
    }

    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      totalAmount += product.productPrice * item.quantity;
    }

    const order = await Order.create({
      buyerId,
      products,
      totalAmount,
      status: 'pending',
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate('products.productId')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};
