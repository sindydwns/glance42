import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../setting.js";

class ErrorLog extends Model { }
ErrorLog.init({
    message: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'errorLog',
});
export default ErrorLog;
