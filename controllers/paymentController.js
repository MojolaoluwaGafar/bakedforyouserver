const axios = require('axios');
const Order = require('../models/order');
const Product = require('../models/product');

exports.initializePayment = async (req, res) => {
  try {
    const { email, products } = req.body;

    if (!email || !products?.length) {
      return res.status(400).json({ message: 'Email and products are required' });
    }

    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      totalAmount += product.productPrice * item.quantity;
    }

    const newOrder = await Order.create({
      buyerId: req.user.id,
      products,
      totalAmount,
      status: 'pending',
    });

    const reference = `B4U-${Date.now()}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: totalAmount * 100, // Kobo
        reference,
        callback_url: `${process.env.CLIENT_URL}/payment-complete`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    newOrder.reference = reference;
    await newOrder.save();

    res.status(200).json({
      authorization_url: response.data.data.authorization_url,
      reference,
    });
  } catch (err) {
    res.status(500).json({ message: 'Payment initialization failed', error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    const { status, amount } = response.data.data;

    const order = await Order.findOne({ reference });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status === 'success' && order.totalAmount * 100 === amount) {
      order.status = 'paid';
      order.paymentId = reference;
      await order.save();
      return res.status(200).json({ message: 'Payment verified and order marked as paid' });
    }

    res.status(400).json({ message: 'Payment verification failed or mismatch in amount' });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification error', error: err.message });
  }
};
