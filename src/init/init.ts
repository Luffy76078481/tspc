
import configureStore from "store/store"
import * as actions from "store/anctions"
import { getStorage } from "tollPlugin/commonFun";
import { hubConnection } from 'signalr-no-jquery';
import { createBrowserHistory } from 'history';
import { Modal } from 'antd';
import { config } from "config/projectConfig";

export default function () {
    document.title = config.title
    window.routerHistory = createBrowserHistory();
    const store = configureStore();
    actions.setStorage(store.dispatch, store.getState);
    window.actions = actions;
    //获取导航栏
    new actions.PageNavAction().fly();
    //获取站点LOGO
    new actions.ApiGetConfigImgAction().fly((resp: any) => {
        if (resp.StatusCode === 0) {
            let Icon = resp.Config.Icon;
            let links = document.getElementsByTagName("link");
            var link: any;
            for (var i = 0; i < links.length; i++) {
                link = links[i];
                if (link.rel === 'shortcut icon') {
                    link.href = config.devImgUrl + Icon
                }
            }
        }

    });
    //系统公告
    new actions.ApiNoticeAction("home-promotion").fly();
    //公告走马灯
    new actions.ApiNoticeAction().fly();
    //轮播图
    new actions.ApiImageAction().fly();
    //获取所有平台
    new actions.ApiGamePlatformsAction().fly();
    //获取客服链接等配置
    new actions.ApiAllSysConfigAction().fly();
    new actions.LoadBackConfigsAction().fly()

    let user = getStorage("user");
    if (getStorage("user")) {//有用户信息直接用TOKEN登录
        actions.SetUserAction(user);
        new actions.LoginAfterInit();
    }
    window.signalR = signalR.Init(store);
    return store;
}

export var signalR = {
    __clientId: "" as any,//客户端唯一标识ID
    __connection: "" as any,//链接返回实体
    __frontUserProxy: "" as any,//通讯消息实体
    conSucc: false,//是否链接成功
    count: 1,//尝试重连计数
    interval: undefined,//计时器实体
    onlinInter: undefined as any,//在线定时器
    __clientType: 1, //客户端类型（1:PC 2:APP 3:WAP)
    Init: function (store: any) {
        let _this = this;
        //建立客户端Id，从本地缓存中读取
        _this.__clientId = localStorage.getItem("__clientId");
        if (!_this.__clientId) {
            for (var i = 0; i < 6; i++) { //6位随机数，用以加在时间戳后面。
                _this.__clientId += Math.floor(Math.random() * 10);
            }
            _this.__clientId = new Date().getTime() + _this.__clientId; //时间戳，用来生成唯一ID。
            localStorage.setItem("__clientId", _this.__clientId);
        }

        let userName = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string).username : ""
        // SignalR 连接
        console.log('前方注意：开始长连接')
        let options = {
            useDefaultPath: false,
            qs: 'utype=1&ctype=' + _this.__clientType + '&cid=' + _this.__clientId + '&uid=' + userName,
            logging: true
        }
        _this.__connection = hubConnection('/signalr', options);
        //接收消息函数：
        _this.__frontUserProxy = _this.__connection.createHubProxy('frontuserhub');


        //后台踢出用户
        _this.__frontUserProxy.on('KickOut', function (message: string) {
            console.log("接收到服务端消息:KickOut");
            store.dispatch({ type: "Account_Logout" });
            clearInterval(_this.onlinInter);
            _this.onlinInter = "";
            Modal.destroyAll();
            Modal.warning({
                title: '未登录或登录超时',
                content: '因为长时间未操作或其他原因导致本次登录超时,请重新登录',
                okText: "登录",
                onOk() {
                    window.routerHistory.push("/Login")
                },
            });
        });
        _this.conenct();
        return this;
    },
    conenct: function () {
        let _this = this;
        _this.__connection.start()
            .done(function () {
                console.log("前方喜报：链接成功");
                _this.conSucc = true;
                interface User {
                    username: string
                }
                let user: User = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : "";
                if (_this.interval) {
                    clearInterval(_this.interval)
                }
                if (user) {
                    _this.PlayerOnline(user.username);
                }


            })
            .fail(function () {
                console.log("二臣贼子，你枉活七十有六，一生未立寸功，只会摇唇鼓舌！助曹为虐！一条断脊之犬，还敢在我军阵前狺狺狂吠，我从未见过有如此厚颜无耻之人...");
                console.log("尝试重新连接 " + _this.count);
                if (_this.count > 9) {
                    console.log("超过最大重连次数，关闭连接！");
                    return false;
                }
                _this.count++
                setTimeout(() => {
                    _this.conenct();
                }, 10000);
            });

    },
    PlayerOnline: function (userName: string) {//通知后台用户上线
        let _this = this;
        if (!_this.conSucc) {//如果没链接成功的话就不发消息
            return;
        }
        if (!_this.onlinInter) {
            _this.onlinInter = window.setInterval(() => {
                console.log(userName, "用户在线一直发")
                _this.PlayerOnline(userName);
            }, 120000);
        }
        var req = {
            UserName: userName,
            ClientType: this.__clientType,
            ClientId: this.__clientId,
            ConnectionId: this.__connection.id
        }
        this.__frontUserProxy.invoke('PlayerOnline', req)
            .done(function () {
                console.log('Invocation of playerOnline succeeded');
            })
            .fail(function (error: string) {
                console.log('Invocation of playerOnline failed. Error: ' + error);
            });
    },
    PlayerOffine: function (__userName: string) {//通知后台用户下线
        let _this = this;
        if (!_this.conSucc) {//如果没链接成功的话就不发消息
            return;
        }
        var req = {
            UserName: __userName,
            ConnectionId: this.__connection.id
        }
        this.__frontUserProxy.invoke('PlayerOffine', req)
            .done(function () {
                clearInterval(_this.onlinInter);
                _this.onlinInter = "";
                console.log('用户自己登出了,清除在线状态', __userName);
            })
            .fail(function (error: string) {
                console.log('Invocation of playerOffine failed. Error: ' + error);
            });
    },

}


