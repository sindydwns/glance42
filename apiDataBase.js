import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATA,
    ssl: { rejectUnauthorized: true },
});

export default pool;
