import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../setting.js";

class GroupMember extends Model {}
GroupMember.init(
	{
		groupId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
		},
		targetId: {
			type: DataTypes.STRING(10),
			allowNull: false,
			primaryKey: true,
		},
	},
	{
		sequelize,
		tableName: "groupMember",
		indexes: [
			{
				name: "PRIMARY",
				unique: true,
				using: "BTREE",
				fields: [{ name: "groupId" }, { name: "targetId" }],
			},
		],
	}
);
export default GroupMember;
