import express from "express";
import cors from "cors";
import "dotenv/config"
import cookieParser from "cookie-parser";
const app = express();
import connect_db from "./config/db.js";
import bodyParser from "body-parser";
import auth_router from "./src/routes/auth.route.js";
const port = process.env.PORT;
if (!port) {
    console.log("error fetching connection port!!");
    process.exit(1);
}
// middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("hello world");
});
app.use("/user/auth", auth_router);

const init_app = async () => {
    try {
        app.listen(port, () => {
            console.info(`http://localhost:${port}`)
            connect_db();
        })
    } catch (error) {
        console.error("error:", error);
    }
}
init_app()