const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://192.168.1.44", // Địa chỉ máy chủ API
      changeOrigin: true, // Thay đổi Origin để bypass CORS
    })
  );
};
