/**
 * 工具类
 */
// import { Modal } from 'antd';
function setCookie(cname: string, cvalue: string, exdays: number) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}


export const getCookie = (cname: string) => {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}
export const setStorage = (key: string, value: any) => {
    if (!value) {
        value = "";
    } else {
        value = JSON.stringify(value);
    }
    if (window.localStorage) {
        window.localStorage.setItem(key, value);
    } else {
        setCookie(key, value, 1);
    }
}
export const getStorage = (key: string) => {
    var ret: string | null;
    if (window.localStorage && window.localStorage.getItem(key)) {
        ret = window.localStorage.getItem(key);
    } else {
        ret = getCookie(key);
    }
    if (!ret) {
        return null;
    }
    return JSON.parse(ret);
}

export const getSession = (key: string) => {
    var ret: string | null;
    if (window.sessionStorage && window.sessionStorage.getItem(key)) {
        ret = window.sessionStorage.getItem(key);
    } else {
        ret = getCookie(key);
    }
    if (!ret) {
        return null;
    }
    return JSON.parse(ret);
}
export const setSession = (key: string, value: string) => {
    if (!value) {
        value = "";
    }
    if (window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
    } else {
        setCookie(key, value, 1);
    }
}
export const remove = (key: string) => {
    if (!key) {
        return;
    }
    if (window.localStorage) {
        window.localStorage.removeItem(key);
    } else {
        window.sessionStorage.removeItem(key);
    }
}
export const clearHtml = (html: string) => {//清楚html中的style
    var rel = /style\s*?=\s*?([‘"])[\s\S]*?\1/g;
    var newHtml = '';
    if (html) {
        newHtml = html.replace(rel, '')
    }
    return newHtml;
};
//get请求序列化参数
var nextStr: string
export function param<Obj>(obj: Obj): string {
    let str: string = ''
    if (typeof obj == 'object') {
        for (let i in obj) {
            if (typeof obj[i] != 'function' && typeof obj[i] != 'object') {
                str += i + '=' + obj[i] + '&';
            } else if (typeof obj[i] === 'object') {
                nextStr = '';
                str += changeSonType(i, obj[i])
            }
        }
    }
    return str.replace(/&$/g, '');
}
function changeSonType<S>(objName: string, objValue: S) {
    if (typeof objValue === 'object') {
        for (let i in objValue) {
            if (typeof objValue[i] != 'object') {
                let value = objName + '[' + i + ']=' + objValue[i];
                nextStr += encodeURI(value) + '&';
            } else {
                changeSonType(objName + '[' + i + ']', objValue[i]);
            }
        }
    }
    return nextStr;
}

export function windowOpen() {
    let newOpenObj: any = window.open('/gameUrlLoading.html', '_blank');
    newOpenObj.urlError = function (message: string) {
        let r = newOpenObj.confirm(message + '！是否要关闭窗口？');
        if (r) {
            newOpenObj.close();
        }
    }
    return newOpenObj;
}

// 地址
export function getHost(str: string): string {
    return window.location.host + str;
}
///判断数组中是否有指定数据
export function in_array(search: any, array: any[]): boolean {
    if (array.length === 0) {
        return false
    }
    for (var i in array) {
        if (array[i] === search) {
            return true;
        }
    }
    return false;
}
// 星号
export function AsteriskProcessing(val: string, type: string): string {
    if (!val) return "";
    let str = '';
    let reg_bank = /^(\d{4})\d+(\d{4})$/;
    switch (type) {
        case "phone":
            str = val.replace(/\s/g, "").substr(0, 3) + " **** " + val.replace(/\s/g, "").substr(-4);
            break;
        case "qq":
            str = val.replace(/\s/g, "").substr(0, 3) + " **** " + val.replace(/\s/g, "").substr(-2);
            break;
        case "bank":
            str = val.replace(reg_bank, "$1 **** **** $2");
            break;
        default:
            str = val.length < 8 ? "**** " + val.replace(/\s/g, "").substr(-1) : val.replace(/\s/g, "").substr(0, 3) + " **** " + val.replace(/\s/g, "").substr(-3);
    }
    return str;
}

export function toPlayGame(_this: any, game: { GamePlatform: string }, gameUrlCallBack?: any) {
    if (!window.actions.Authority()) return;

    ///神经病突然说又不用提示转入了。。
    if (_this.props.user.AutoTransfer) {//开启自动转入，直接自动转
        gameOpen(game, true,gameUrlCallBack)
    } else {
        gameOpen(game, false,gameUrlCallBack)
    }

    // let currentBalance = 0;//储存当前点击平台余额
    // let totalAmount = parseInt(_this.props.user.amount) > 1 ? parseInt(_this.props.user.amount) : 0;
    // for (var i = 0; i < _this.props.platforms.length; i++) {//循环所有平台余额
    //     let __thisBalance = _this.props.platforms[i].Balance ? parseInt(_this.props.platforms[i].Balance) : 0;//四舍五入各个平台的余额
    //     totalAmount += __thisBalance;
    //     if (_this.props.platforms[i].ID === game.GamePlatform) {
    //         currentBalance = __thisBalance;//储存当前点击平台余额
    //     }
    // }
    // if (totalAmount < 1) {//如果总余额小于1块，那就提示充值或直接进入
    //     Modal.destroyAll();
    //     window.actions.popWindowAction({
    //         type: "gameWindow",
    //         title: "余额不足",
    //         okText: "前往充值",
    //         cancelText: "直接进入",
    //         content: '您可以先去充值,或先进游戏看看',
    //         okFc: () => {
    //             window.actions.popWindowAction({ type: "" })
    //             window.routerHistory.push("/myCenter/deposit");
    //         },
    //         cancelFc: () => {
    //             window.actions.popWindowAction({ type: "" })
    //             gameOpen(game, false, gameUrlCallBack);
    //         }
    //     })
    //     return;
    // }
    // if (currentBalance < 1) {//如果只是当前平台余额没有钱，那就自动转入或提示转入
    //     if (_this.props.user.AutoTransfer) {//开启自动转入，直接自动转
    //         gameOpen(game, true, gameUrlCallBack);
    //     } else {//提示转入
    //         Modal.destroyAll();
    //         window.actions.popWindowAction({
    //             type: "gameWindow",
    //             title: "余额不足",
    //             okText: "自动转入",
    //             cancelText: "直接进入",
    //             content: `您在${game.GamePlatform}的余额不足，是否将资金自动转入${game.GamePlatform}平台`,
    //             okFc: () => {
    //                 window.actions.popWindowAction({ type: "" })
    //                 gameOpen(game, true, gameUrlCallBack);
    //             },
    //             cancelFc: () => {
    //                 window.actions.popWindowAction({ type: "" })
    //                 gameOpen(game, false, gameUrlCallBack);
    //             }
    //         })
    //     }
    // } else {//余额大于1直接进入
    //     gameOpen(game, false, gameUrlCallBack);
    // }
}

function gameOpen(game: any, TransferFlag: boolean, gameUrlCallBack: any) {
    let parma = {
        GamePlatform: game.GamePlatform,
        GameType: game.GameTypeText,
        GameId: game.GameIdentify,
        IsMobile: false,
        IsDemo: false,
        TransferFlag
    }
    if (gameUrlCallBack) {
        new window.actions.ApiGetLoginUrl(parma).fly((res: any) => {
            if (res.StatusCode === 0) {
                let gameLink = res.GameLoginUrl;
                if (TransferFlag) {
                    new window.actions.ApiPlayerInfoAction().fly();
                    new window.actions.ApiGamePlatformAllBalanceAction().fly();
                }
                gameUrlCallBack(gameLink)
            }
        })
    } else {
        let winObj: any = windowOpen();;
        new window.actions.ApiGetLoginUrl(parma).fly((res: any) => {
            if (res.StatusCode === 0) {
                let gameLink = res.GameLoginUrl;
                if (TransferFlag) {
                    new window.actions.ApiPlayerInfoAction().fly();
                    new window.actions.ApiGamePlatformAllBalanceAction().fly();
                }
                winObj.location.href = gameLink;
            } else {
                winObj.urlError(res.Message);
            }
        })
    }

}

export function getNowDate(day: number) {  /*获取当前时间day=-1前一天，day=1后一天*/
    var time: any = new Date();
    var date = day ? new Date(time.getTime() + day * 24 * 60 * 60 * 1000) : time;
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '/' + m + '/' + d + ' ' + h + ':' + minute + ':' + second;
}
export function formatTime(date: any): string {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '/' + m + '/' + d + ' ' + h + ':' + minute + ':' + second;
}

// 通过值查找数组中对应的下标
export function checkIndex<T>(arr: Array<T>, item: T): number {
    if (Array.prototype.indexOf) {
        return arr.indexOf(item);
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) {
                return i;
            }
        }
    }
    return -1;
}
export function isChinese(str: string): boolean {
    var han = /^[\u4e00-\u9fa5]+$/;
    if (!han.test(str)) {
        return false;
    };
    return true;
}
// 复制
export function copyCode<T extends string>(id: T): void {

    let dom: any = document.getElementById(id);
    dom.select();
    try {
        if (document.execCommand('copy', false, "")) {
            //dom.setSelectionRange(0, dom.value.length)
            document.execCommand("Copy");
        }
    } catch{
        alert('无法复制')
    }

}
// 奖池金额
export function numberWithCommas(x: string, fix: number) {
    let value: any = parseFloat(x).toFixed(fix);
    if (isNaN(value)) return x;
    var tmp = value.toString().split(".");
    value = tmp[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (tmp.length > 1) {
        if (fix > 0) {
            tmp[1] = tmp[1].substring(0, fix);
        }
        value += "." + tmp[1];
    } else if (fix > 0) {
        value += ".";
        for (var i = 0; i < fix; i++) {
            value += "0";
        }
    }
    return value;
}
// 在线客服
export function serversOpen(online_service_link: string): void {
    window.open(
        online_service_link,
        'servers',
        'width=800,height=700,directories=no,location=no,menubar=no,scrollbars=no,status=no,toolbar=no,resizable=no,left=5,top=50,screenX=550,screenY=250'
    )
}
// 截取域名后缀
export function getUrlParam(name:string):null|string {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)") as RegExp;
    var r = window.location.search.substr(1).match(reg) as any; 
    if (r != null) return unescape(r[2]);
    return null;
}   


