
interface configObj{
    "webSiteTag":string,
    "gameTag":string,
    "apiPath":string,
    "version":string,
    "spec":string,
    "appName":string,
    "title":string,
    "model":string,
    "agentLoginUrl":string,  
    "devImgUrl":string,   
    "api":string,
}

export declare global {
    var PCWidget:any
    interface Window {
        actions:any,
        config:configObj,
        fontSize:number,
        jsq:any,//APP弹窗注入脚本计时器
        signalR:any,//长连接实例
        Promise:any,//解决IE兼容
        tabIndex:number,//首页UI组件保存当前激活下标
        plus:any,//app原生对象
        Responses:Response,
        CS:any,//组件申明对象
        routerHistory:any, //router的history实例
        location:any,
        purechatApi:any
    }
  
}