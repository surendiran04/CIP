const jwt = require("jsonwebtoken");
const secret = process.env.secretKey;
const Admin_pin = process.env.ADMIN_PIN;

async function signInAdmin(req, res) {
  try {
    const { pin } = req.body;

    if (!pin || pin.length > 4) {
      return res.status(401).json({
        success: false,
        message: "pin is missing or wrong",
      });
    }

    if (pin == Admin_pin) {
      const token = jwt.sign({ role: ["admin"] }, secret, {
        expiresIn: 60 * 15, //session time
      });
      return res.status(200).json({
        success: true,
        message: "Sign In successful",
        token: token,
        user: {
          mentor_name: "Admin",
          email: "demowebuser004@gmail.com",
          phone: "9876543210",
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Pin does not match!",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {signInAdmin }
