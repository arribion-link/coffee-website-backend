implementing **JWT access + refresh tokens** with **cookies** using `cookie-parser`.

---

## 🔑 Core Concepts
- **Access Token**: Short-lived (e.g., 15 minutes). Used for authenticating API requests.
- **Refresh Token**: Long-lived (e.g., 7 days). Used to issue new access tokens without forcing the user to log in again.
- **Cookies**: Secure way to store refresh tokens on the client. Access tokens are usually sent in headers (`Authorization: Bearer <token>`).

---

## ⚙️ Setup
Install dependencies:
```bash
npm install jsonwebtoken cookie-parser
```

In your `server.js`:
```js
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
```

---

## 📝 Register Controller
When a user registers:
1. Hash password with `bcrypt`.
2. Save user in DB.
3. Generate **access** and **refresh** tokens.
4. Send refresh token in a **HTTP-only cookie**.
5. Send access token in JSON response.

```js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import user_model from "../models/user.model.js";

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

export const register_user = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await user_model.create({ email, password: hashedPassword });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Store refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,       // use true in production (HTTPS)
      sameSite: "strict", // CSRF protection
    });

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user" });
  }
};
```

---

## 📝 Login Controller
Similar flow:
1. Verify user exists.
2. Compare password.
3. Issue tokens.
4. Send refresh token in cookie, access token in JSON.

```js
export const login_user = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await user_model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in" });
  }
};
```

---

## 🔄 Refresh Token Endpoint
When the access token expires, the client calls `/refresh`:
```js
export const refresh_token = (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(user);
    return res.json({ accessToken: newAccessToken });
  });
};
```

---

## 🚪 Logout Endpoint
Clear the cookie:
```js
export const logout_user = (req, res) => {
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully" });
};
```

---

## ✅ Best Practices
- Store **refresh tokens only in cookies** (HTTP-only, Secure, SameSite).
- Store **access tokens in memory** (frontend state, not localStorage).
- Rotate refresh tokens on each login for extra security.
- Use different secrets for access and refresh tokens.

---

👉 With this setup:
- Register/Login → issues both tokens.
- Access token → used in headers for API calls.
- Refresh token → stored in cookie, used to get new access tokens.
- Logout → clears cookie.

Would you like me to also show you how to **protect routes with middleware** that checks the access token before allowing access?
