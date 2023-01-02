import Sequelize from "sequelize";
import process from "process";
import dotenv from "dotenv";

dotenv.config();
export const sequelize = new Sequelize({
	username: process.env.DEV_MODE ? process.env.DEV_DB_USER : process.env.DB_USER,
    password: process.env.DEV_MODE ? process.env.DEV_DB_PASS : process.env.DB_PASS,
    database: process.env.DEV_MODE ? process.env.DEV_DB_DATA : process.env.DB_DATA,
    host: process.env.DEV_MODE ? process.env.DEV_DB_HOST : process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    dialectOptions: {
        ssl: {trustServerCertificate: true}
    },
});
export default sequelize;
