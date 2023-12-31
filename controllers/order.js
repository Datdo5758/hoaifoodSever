const Order = require("../models/order");
const Product = require("../models/products");
const nodemailer = require("nodemailer");

// Cấu hình transporter (dịch vụ gửi email)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "aia.ecomerce@gmail.com",
    pass: "ubdcypwxbrbsdzyn",
    // ubdcypwxbrbsdzyn
  },
});

exports.postOrder = async (req, res, next) => {
  try {
    const data = req.body;

    // Tạo đơn hàng
    const order = new Order({
      cart: data.cart,
      name: data.name,
      phone: data.phone,
      userId: data.userId,
      address: data.address,
      totalPrice: data.totalPrice,
      status: "Waiting for pay",
      createdAt: new Date(),
    });

    // Lưu đơn hàng vào database
    const savedOrder = await order.save();

    // Lặp qua từng sản phẩm trong giỏ hàng để cập nhật số lượng sản phẩm
    for (const item of data.cart) {
      const product = await Product.findById(item.id);

      if (product) {
        // Trừ đi số lượng sản phẩm đã đặt hàng
        product.count -= item.value;
        await product.save();
      }
    }

    // Gửi email thông báo
    const cartItemsTable = data.cart
      .map(
        item => `
      <tr>
        <td>
          <img src="${item.img1}" alt="${item.name}" width="50" />
        </td>
        <td>${item.name}</td>
        <td>${Number(item.price).toLocaleString()} VND</td>
        <td>${item.value > 0 ? item.value : 1} X ${item.donvi}</td>
        <td>${Number(
          item.price * (item.value > 0 ? item.value : 1)
        ).toLocaleString()} VND</td>
      </tr>
    `
      )
      .join("");

    const emailContent = `
      <h1>Đặt Hàng Thành Công!</h1>
      <p>Xin Chào ${data.name},</p>
      <p>Bạn đã đặt một đơn hàng thành công vào lúc ${new Date()}.</p>
      <p>Địa chỉ: ${data.address}.</p>
      <p>Số điện thoại: ${data.phone}.</p>
      <h2>Chi tiết:</h2>
      <table>
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Số Lượng</th>
            <th>Tổng</th>
          </tr>
        </thead>
        <tbody>
          ${cartItemsTable}
        </tbody>
      </table>
      <h1>Tổng thanh toán: ${data.totalPrice}</h1>
      <h1>Thank you!</h1>
    `;

    const mailOptions = {
      from: "aia.ecomerce@gmail.com",
      to: data.email,
      subject: "Order Confirmation",
      html: emailContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(201).json({ message: "successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};

exports.getOrderUser = (req, res, next) => {
  const userId = req.params.userId;
  Order.find({ userId: userId })
    .then(result => res.status(200).json(result))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getAOrderUser = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(result => res.status(200).json(result))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
