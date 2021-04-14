const fs = require("fs");
const asyncRequire = require("async-require");
const Router = require("express");
const router = Router();

async function initAPI(routerRoot) {
  const routerDirs = fs.readdirSync(routerRoot).filter((path) => {
    return fs.lstatSync(routerRoot + path).isDirectory();
  });
  const paths = await routerDirs.map((router) => ({
    path: routerRoot + router,
    router,
  }));
  const routeFiles = paths
    .map(({ path, router }) =>
      fs.readdirSync(path).map((filename) => {
        const method = filename.split(".")[0];
        const fileNameWithoutMethod = filename.split(".")[1];
        const middlewareRoute =
          "/" +
          router +
          "/" +
          fileNameWithoutMethod +
          getParams(filename, method);
        return {
          pathForAsyncRequire: path + "/" + filename.replace(".js", ""),
          middlewareRoute,
          method,
        };
      })
    )
    .flat();

  const routes = [];
  for (const routeFile of routeFiles) {
    const callback = await asyncRequire("../" + routeFile.pathForAsyncRequire);
    routes.push({ callback, ...routeFile });
  }

  return routes.map(({ middlewareRoute, callback, method }) => (database) => {
    console.log({ middlewareRoute, callback, method });
    return router[method](middlewareRoute, callback(database));
  });
}

function getParams(filename, method) {
  const result = filename
    .split(".")
    .filter((partName) => partName.indexOf("by_") !== -1)
    .reduce((acc, curr) => (acc += "/" + curr.replace("by_", ":")), "");

  if (method !== "get" && !!result) throw new Error(filename);
  return result;
}

module.exports = { initAPI };
