import express from "express"
import path from "path"
import cors from "cors"
import dotenv from "dotenv"

const indexRouter = require('./routes/index');

const app = express();

dotenv.config();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(8080)