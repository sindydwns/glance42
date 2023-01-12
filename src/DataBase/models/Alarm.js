import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../setting.js";

class Alarm extends Model {}
Alarm.init(
	{
		alarmId: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
		},
		intraId: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
		targetId: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "alarm",
		timestamps: false,
		indexes: [
			{
				name: "PRIMARY",
				unique: true,
				using: "BTREE",
				fields: [{ name: "alarmId" }],
			},
			{
				name: "intraId",
				unique: true,
				using: "BTREE",
				fields: [{ name: "intraId" }, { name: "targetId" }],
			},
		],
	}
);
export default Alarm;
