const service = require("./auth.service");

exports.register = async (req, res) => {
  try {
    await service.register(req.body);
    res.json({ message: "User registered" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await service.login(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ message: "Login successful" });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};
