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
      fs.readdirSync(path).map((filename) => ({
        pathForAsyncRequire: path + "/" + filename.replace(".js", ""),
        middlewareRoute: "/" + router + "/" + filename.split(".")[1],
        method: filename.split(".")[0],
      }))
    )
    .flat();

  const routes = [];
  for (const routeFile of routeFiles) {
    const callback = await asyncRequire("../" + routeFile.pathForAsyncRequire);
    routes.push({ callback, ...routeFile });
  }

  return routes.map(({ middlewareRoute, callback, method }) => (database) =>
    router[method](middlewareRoute, callback(database))
  );
}

module.exports = { initAPI };
