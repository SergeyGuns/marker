const { DataTypes } = require("sequelize");

module.exports = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.INTEGER, unique: true, allowNull: false },
};
