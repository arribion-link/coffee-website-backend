import cookie from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import user_model from "../schemas/user.schema.js";
export const register_user = async (req, res) => { 
    const { user_name, email, password } = req.body;
  try {
    if (!user_name || !email || !password) {
      return res.status(404).json({
        message: "all fields are required",
      });
    }
    const userExist = await user_model.findOne({ email });
    if (userExist) {
      return res
        .status(404)
        .json({ message: "user already exist please login" })
        .redirect("/user/auth/login", 301);
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = {
      user_name,
      email,
      password: hashPassword,
    };
    const User = user_model(newUser);
    await User.save();
    const refreshToken = jwt.sign({ id: User._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Send refresh token in secure cookie
    res.cookie("coffeeJWTToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Send access token in JSON response
    const accessToken = jwt.sign({ id: User._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "successfull user registration",
      accessToken,
    });
  } catch (error) {
        res.status(500).json({
            message: "something went wrong registering the user"
        });
    }
 };
export const login_user = async (req, res) => {
    const { password, email } = req.body;
    try {
      if (!email || !password) {
        return res.status(404).json({
          message: "All fields are required",
        });
      }
      const userMatch = await user_model.findOne({ email });
      if (!userMatch) {
        return res
          .status(404)
          .json({
            message: "this user does not exist please create an account",
          })
          .redirect("/user/auth/register", 301);
      }
      const passwordMatch = await bcrypt.compare(password, userMatch.password);
      if (!passwordMatch) {
        return res.status(404).json({
          message:
            "You have provided wrong credential please check your password",
        });
      }
    
      return res.status(200).json({
        message: "You have logged in successfully...",
      });
    } catch (error) {
        res.status(500).json({
            message: "something went wrong logging in the user"
        });
    }
};

export const logout_user = async (req, res) => {
  res.clearCookie("refreshToken", { path: "/refresh-token" }).json({
    message: "user logged out successfully..."
  })
 };


export default {
    register_user,
    login_user,
    logout_user
}