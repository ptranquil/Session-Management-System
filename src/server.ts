import dotenv from 'dotenv';
import { connectToDB } from './db';
import cors from "cors";
import express from "express";
import router from './api/routes';

dotenv.config();
const app = express();

app.use(cors({
    origin: "*",
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || "3000";
app.listen(PORT, () => {
    connectToDB();
    app.use('/api', router);
});
