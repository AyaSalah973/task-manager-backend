const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../config/database"); 
const { secret } = require("../../config/jwt"); 


exports.register = async ({ name, email, password }) => {
 
  const userExists = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new Error("Email already in use"); // رسالة واضحة للـ frontend
  }

  // تشفير الباسورد
  const hashedPassword = await bcrypt.hash(password, 10);

  // إدخال المستخدم الجديد في قاعدة البيانات
  await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
    [name, email, hashedPassword]
  );
};

// تسجيل الدخول
exports.login = async ({ email, password }) => {
  // جلب المستخدم من قاعدة البيانات
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password"); // لو المستخدم مش موجود
  }

  const user = result.rows[0];

  // التحقق من الباسورد
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password"); // لو الباسورد خطأ
  }

  // توليد التوكن
  const token = jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: "1d" } // صلاحية التوكن يوم واحد
  );

  return token;
};
