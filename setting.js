import Sequelize from "sequelize";
import process from "process";
import dotenv from "dotenv";

dotenv.config();
export const sequelize = new Sequelize({
	username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_BASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    dialectOptions: {
        ssl: {trustServerCertificate: true}
    },
});
export default sequelize;
