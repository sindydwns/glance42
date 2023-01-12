import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../setting.js";

class StatisticsHost extends Model { }
StatisticsHost.init({
    cluster: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    studentCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "statisticsHost",
});
export default StatisticsHost;
