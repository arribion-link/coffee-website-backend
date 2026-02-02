import express from "express";
const auth_router = express.Router();
import { register_user, login_user, logout_user } from "../controllers/auth.controller.js";
auth_router.post("/register", register_user).post("/login", login_user).post("/logout", logout_user);
export default auth_router;