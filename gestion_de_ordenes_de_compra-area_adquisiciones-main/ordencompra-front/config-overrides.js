// config-overrides.js
const path = require("path");

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "src/"),
    "@components": path.resolve(__dirname, "src/components"),
    "@funcionesTS": path.resolve(__dirname, "src/funcionesTS"),
    "@helpers": path.resolve(__dirname, "src/helpers"),
    "@hooks": path.resolve(__dirname, "src/hooks"),
    "@interfaces": path.resolve(__dirname, "src/Interfaces"),
    "@modals": path.resolve(__dirname, "src/modals"),
    "@pages": path.resolve(__dirname, "src/pages"),
    "@providers": path.resolve(__dirname, "src/providers"),
    "@routes": path.resolve(__dirname, "src/routes"),
    "@utils": path.resolve(__dirname, "src/utils"),
  };
  return config;
};
