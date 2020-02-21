const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    proxy("/api/**", {
      //__start target: '#{spec}',
target: 'http://688317.com/',
//__end
      changeOrigin: true
    })

  );
  app.use(
    proxy("/api/v0/Pay/**", {
      //__start target: '#{spec}',
target: 'http://688317.com/',
//__end
      changeOrigin: true
    })
  );
  app.use(
    proxy("/signalr", {
      target: "http://comet.cgtest02.com/",//长连接地址
      changeOrigin: true
    })
  );
};
