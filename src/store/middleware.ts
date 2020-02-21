
// import {getStorage} from "commonFun";
import {getStorage,setStorage,param} from "tollPlugin/commonFun";
import { Modal ,message} from 'antd';
// import 'isomorphic-fetch';//解决IE不支持fetch
// const modalAlert = Modal.alert;
let flag =false;
 
interface ApiRequestObj{
    method:string,
    headers:JSON | any,
    body?:string
}
const apiRequest = (action:any, callback:any) => {
    action.params = action.params || {};
    let user = getStorage("user") || {};
    let authorization="";
    let method  = action.method.toLocaleUpperCase();
    let url = action.url;
    let timeOutId:any;
    if (user && user.Token) {
        authorization = user.UserName+' '+user.Token;
    }
    let obj:ApiRequestObj= {
        method:method,
        headers :{
            "Authorization":authorization,
            "Content-Type":"application/json",
        },

    };

    if(method === "GET"){
        url = url+'?'+param(action.params);
    }else if(method==="POST"){
        obj.body = JSON.stringify(action.params);
    }

    Promise.race([
        fetch(window.config.apiPath + url, obj),
        new Promise((resolve,reject)=>{
            timeOutId= setTimeout(()=> {
                if(url.indexOf('User/GetUnreadSiteMsgs')<0){
                    reject(
                        new Error('请求超时!')
                    )
                }
            },120000)
        }
    )])
        .then((res)=>{
            if (timeOutId) {
                 clearTimeout(timeOutId);
                timeOutId = null;
            }
            return res;
        })
        .then((res:any) => {
            if (res.status >= 200 && res.status < 300) {
                return res;
            }

            const error:any = new Error(res.statusText);
            error.status = res.status;
            if(res.url.indexOf('User/GetUnreadSiteMsgs')>=0){//如果是请求未读信息是错误 忽略
                error.url='User/GetUnreadSiteMsgs';
            }
            throw error;
        })
        .then(res => {
            return res.json();
        })
        .then(resJson => {
            if (resJson.StatusCode === 0) {
                if (resJson.token) {
                    user.token = resJson.token;
                    setStorage("user", user);
                }
            }
            callback(resJson);
        })
        .catch(err=>{
            console.error(url,"中间件捕获异常：",err)
            if(err.message === "请求超时!"){
                if(!flag){
                    flag=true;
                    // modalAlert('请求超时!','请您稍后再试！',[
                    //     {text:"确认",onPress:()=>{
                    //         flag =false;
                    //     }}
                    // ])
                }
                return;
            }
            if(err.status>300 ){
                callback({status:err.status,url:err.url});
                return;
            }
            callback({StatusCode:-888,Message:err});
        })
}
export default (store:any) => (next:any) => (action:any) => {
    let mesload:any;
    if (action.type !== "api_start") {
        return next(action);
    }
    next(action);
    if (action.loadMsg) {
        mesload = message.loading(action.loadMsg.message, 0);
    }
    apiRequest(action, (resp:any)=>{
        if (action.loadMsg) {
            mesload();
        }
        if(resp.StatusCode === -1 && resp.Message ==="未登录"){
            if(window.location.pathname==="/Login")return;
            if(!flag && !sessionStorage.getItem("allowPopup")){
                window.actions.clearUser();
                Modal.destroyAll();
                window.routerHistory.push("/Home")
                return
            }
            if(!flag && sessionStorage.getItem("allowPopup")){
                flag=true;
                window.actions.clearUser();
                Modal.destroyAll();
                window.actions.popWindowAction({
                    type:"loginWindow",
                    title:'未登录或登录超时',
                    content:'因为长时间未操作或其他原因导致本次登录超时,请重新登录',
                    okText:"登录",
                    closeFc:()=>{
                        window.actions.popWindowAction({type:""})
                        window.routerHistory.push("/Home")
                    },
                    okFc:()=>{
                        window.actions.popWindowAction({type:""})
                        window.routerHistory.push("/Login")
                    },
                })
                flag =false;
                return;
            }
        }

        if (resp.StatusCode === 0 && action.successMsg) {
           message.success(action.successMsg.message,1);
            
        } else if (resp.StatusCode !== 0 && resp.StatusCode !== 10110 && action.errorMsg) {
            message.error(resp.Message,1);
        }
        action.response = resp;
        action.type = "api_finish";
        next(action);
    })
}