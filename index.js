const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {
  MONGO_IP,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASS,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");
console.log(
  MONGO_IP,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASS,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
  "nnnff"
);
const postRouter = require("./routes/postRoute");
const userRouter = require("./routes/authRoute");
const app = express();
const redis = require("redis");
const session = require("express-session");

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({ host: REDIS_URL, port: REDIS_PORT });
const connectWithRetry = () => {
  mongoose
    .connect(
      `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`
    )
    .then(() => console.log("Successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
app.use(cors());
app.enable("trust proxy");

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: SESSION_SECRET,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

app.use(express.json());
app.get("/api/v1", (req, res) => {
  res.send("<H1>Hello There!!!</H1>");
  console.log("herehere");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App is listening on port ${port}`));
