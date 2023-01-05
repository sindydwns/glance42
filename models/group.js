import { DataTypes, Model } from "sequelize";
import { sequelize } from "../setting.js";

class Group extends Model { }
Group.init({
    groupId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    intraId: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    selected: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0
    }
}, {
    sequelize,
    tableName: 'group'
});
export default Group;
