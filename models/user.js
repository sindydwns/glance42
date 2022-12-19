import { DataTypes, Model } from "sequelize";
import { sequelize } from "../setting.js";

class User extends Model { }
User.init({
    intraId: {
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true
    },
    slackId: {
        type: DataTypes.STRING(11),
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'user',
    indexes: [{
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [ { name: "intraId" } ]
    }]
});
export default User;
