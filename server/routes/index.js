const fs = require("fs");

const Router = require("express");
const router = new Router();

const routerPath = "./routes/";
const apiInfo = [];
const routerDirs = fs.readdirSync(routerPath).filter((path) => {
  return fs.lstatSync(routerPath + path).isDirectory();
});

routerDirs
  .map((routerDir) => {
    const path = routerPath + routerDir;
    return fs.readdirSync(path).map((fileName) => {
      const [method, name] = fileName.split(".");
      const route = {
        method,
        name,
        fullPath: routerDir + "/" + name,
        callback: (req, res) => {
          res
            .status(200)
            .json({ method, name, fullPath: "/" + routerDir + "/" + name });
        },
      };
      return route;
    });
  })
  .flat()
  .map(({ method, fullPath, callback, name }) => {
    apiInfo.push({ method, fullPath, callback: callback.toString(), name });
    router[method](fullPath, callback);
  });

router.get("/", (req, res) => {
  res.json(apiInfo);
});

module.exports = router;
