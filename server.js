import express from "express"
import gameRoute from "./routes/game.js"
import playerRoute from "./routes/player.js";
import authRoute from "./routes/auth.js"
import { serverError } from "./configs/vars.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
const app = express()

app.use(session({
  name: "volleyball.sid",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
}));


app.use(helmet());

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: "Too many requests from this ip !"
})

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/game", gameRoute);
app.use("/player", playerRoute);
app.use("/auth",authLimiter,authRoute);
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        success: false,
        message: serverError
    });
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`app is running on port ${PORT}`);
});