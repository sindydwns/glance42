import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../setting.js";

class LocationStatus extends Model { }
LocationStatus.init({
    targetId: {
        type: DataTypes.STRING(10),
        allowNull: false,
        primaryKey: true
    },
    host: {
        type: DataTypes.STRING(10),
        allowNull: true
    }
}, {
    sequelize,
    tableName: 'locationStatus',
    timestamps: false,
    indexes: [{
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [ { name: "targetId" } ]
    }]
});

export default LocationStatus;
