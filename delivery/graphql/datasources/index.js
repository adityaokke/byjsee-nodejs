"use strict";

const fs = require("fs");
const path = require("path");
const { merge } = require("lodash");
const basename = path.basename(__filename);

let datasources = {};
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    datasources = merge(datasources, require(path.join(__dirname, file)));
  });

module.exports = () => {
  return datasources;
};
