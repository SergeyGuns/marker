const { Sequelize, DataTypes } = require("sequelize");
const asyncRequire = require("async-require");
const fs = require("fs");

async function initModelsFromFiles(modelsPath, sequelize) {
  const modelDirs = fs.readdirSync(modelsPath);

  return await Promise.all(
    modelDirs.map((modelDir) => {
      return new Promise(async (resolve, reject) => {
        let loadedModels;
        const path = modelsPath + "/" + modelDir;
        const models = fs
          .readdirSync(path)
          .map((modelFilePath) => ({
            path: path + "/" + modelFilePath.replace(".js", ""),
            fileName: modelFilePath.replace(".js", ""),
          }))
          .flat();
        try {
          loadedModels = await Promise.all(
            models.map(async ({ path, fileName }) => ({
              model: await asyncRequire(path),
              path,
              fileName,
            }))
          );
          resolve();
        } catch (e) {
          console.log(e);
          reject(e);
        }
        loadedModels.map(({ model, fileName }) => {
          sequelize.define(fileName, model);
        });
      });
    })
  );
}

class Database {
  constructor(configuredOrm, initFunc) {
    this.initFunc = initFunc;
    this.orm = configuredOrm;
  }
  async start() {
    for (const func of this.initFunc) {
      await func();
    }
  }
}
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});
const database = new Database(sequelize, [
  async () => await initModelsFromFiles("./models", sequelize),
  async () => await initModelsRelation(sequelize),
  async () => sequelize.sync({ force: true }),
]);

function initModelsRelation(sequelize) {
  const {
    Basket,
    BasketDevice,
    Device,
    DeviceBrand,
    DeviceInfo,
    DeviceRating,
    DeviceType,
    User,
  } = sequelize.models;
  return new Promise((resolve, reject) => {
    try {
      const DeviceTypeDeviceBrand = sequelize.define("DeviceType_DeviceBrand", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      });

      User.hasOne(Basket);
      Basket.belongsTo(User);

      User.hasMany(DeviceRating);
      DeviceRating.belongsTo(User);

      Basket.hasMany(BasketDevice);
      BasketDevice.belongsTo(Basket);

      DeviceType.hasMany(Device);
      Device.belongsTo(DeviceType);

      DeviceBrand.hasMany(Device);
      Device.belongsTo(DeviceBrand);

      Device.hasMany(DeviceRating);
      DeviceRating.belongsTo(Device);

      Device.hasMany(BasketDevice);
      BasketDevice.belongsTo(Device);

      Device.hasMany(BasketDevice);
      BasketDevice.belongsTo(Device);

      Device.hasMany(DeviceInfo);
      DeviceInfo.belongsTo(Device);

      DeviceType.belongsToMany(DeviceBrand, { through: DeviceTypeDeviceBrand });
      DeviceBrand.belongsToMany(DeviceType, { through: DeviceTypeDeviceBrand });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = database;
