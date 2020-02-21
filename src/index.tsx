import 'babel-polyfill'
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "serviceWorker";
import FreamPage from "pages/fream/FreamPage";
import init from "init/init";
import { ConfigProvider } from 'antd'; // ANTD汉化框架
import zh_CN from 'antd/lib/locale-provider/zh_CN'; // 用于ANTD日历汉化
import 'moment/locale/zh-cn'; // ANTD日历月份汉化


window.Promise = Promise;//解决IE下Promise报错 【1.install babel-runtime和babel-plugin-transform-runtime 2.添加在主页之前添加window.Promise = Promise】
if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
  var protocol = window.location.protocol, hostname = window.location.hostname, pathname = window.location.pathname;
  hostname = hostname.replace(pathname, "") + "/m"+pathname;
  window.location.href = protocol + "//" + hostname + window.location.search;
} else {
  const store = init();
  ReactDOM.render(
    <ConfigProvider locale={zh_CN}>
      <FreamPage store={store} />    
    </ConfigProvider>,
    document.getElementById("root") as HTMLElement
  );
  serviceWorker.unregister();
}


