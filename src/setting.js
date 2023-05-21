import Sequelize from "sequelize";
import process from "process";
import dotenv from "dotenv";

dotenv.config();
export const sequelize = new Sequelize({
	host: process.env.DEV_MODE
		? process.env.DEV_DB_HOST
		: process.env.RDS_HOSTNAME,
	database: process.env.DEV_MODE
		? process.env.DEV_DB_DATA
		: process.env.RDS_DB_NAME,
	username: process.env.DEV_MODE
		? process.env.DEV_DB_USER
		: process.env.RDS_USERNAME,
	password: process.env.DEV_MODE
		? process.env.DEV_DB_PASS
		: process.env.RDS_PASSWORD,
	dialect: "mysql",
});
export default sequelize;
