/*
    需要ajax或者需要reducer管理状态才写这儿，其他可写工具类
*/
import { getNowDate } from "../tollPlugin/commonFun";
import { getHost } from "tollPlugin/commonFun";
import { config } from "config/projectConfig"
import { Modal } from 'antd';
window.config = config;
//将加好中间件的redux塞进来保存
export var _dispatch: any, _getState: any;
export function setStorage(dispatch: any, getState: any) {
    _dispatch = dispatch;
    _getState = getState;
}


const WebSiteOperate = "(WEB)";//是哪个类型的站点登陆的
const clientType = 1;//是哪个类型的站点登陆的(新接口用)


//回调处理
var actionResultHandlerMap: any = {}
function registerResultHandler(key: string, handler: object) {
    actionResultHandlerMap[key] = handler;
}
export function onApiResultCallback(action: any) {
    let act = actionResultHandlerMap[action.callbackKey || action.url];
    if (act) {
        let handler = act.callback;
        delete (actionResultHandlerMap[action.url]);
        if (handler) {
            handler(action.response);
        }
    }
    //处理回调的时候顺便处理下长连接登录登出的消息
    if (action.url === "Account/Login" && action.response.StatusCode === 0) {
        window.signalR.PlayerOnline(action.params.UserName);
    } else if (action.url === "Account/Logout" && action.response.StatusCode === 0) {
        window.signalR.PlayerOffine(action.params.username);
    }
}

export function showLoading(show: boolean) {
    let loadBox = document.getElementById("loadBox") as any
    if (show) {
        loadBox.style.display = "block";
    } else {
        loadBox.style.display = "none";
    }
}


// actions具体实现基类
interface ActionsObj {
    type: string,
    loadMsg?: string,
    successMsg?: string,
    errorMsg?: string,
    url?: string,
    params?: any,
    method?: string,
    callbackKey?: string,
    msgType?: string,
    title?: string,
    message?: string,
    id?: number,
}
interface MsgObj {
    obj: object | any
}
class BaseAction {
    public obj: ActionsObj
    constructor(type: string) {
        this.obj = { type: type };
        this.fly.bind(this);
    }
    fly() {
        _dispatch(this.obj);
    }
    // 消息弹窗
    setMsgs(loadMsg: MsgObj, successMsg: MsgObj | any, errorMsg: MsgObj, id = null) {
        var n = id || new Date().getTime();
        if (loadMsg) {
            loadMsg.obj.id = n;
            this.obj.loadMsg = loadMsg.obj;
        }
        if (successMsg) {
            successMsg.obj.id = n;
            this.obj.successMsg = successMsg.obj;
        }
        if (errorMsg) {
            errorMsg.obj.id = n;
            this.obj.errorMsg = errorMsg.obj;
        }
    }
}

//请求类型API继承中间类
class ApiAction extends BaseAction {
    public callback: any
    constructor(url: string, params: object, method: string = 'post') {
        super("api_start");
        this.obj.url = url;
        this.obj.params = params;
        this.obj.method = method;
    }
    fly(callback: any = null, key: string = "") {
        super.fly();
        if (callback) {
            this.callback = callback;
            if (key) {
                this.obj.callbackKey = key;
            } else {
                key = this.obj.url as string;
            }
            registerResultHandler(key, this);
        }
        return this;
    }
}



//各种消息处理
export class MsgAction extends BaseAction {
    constructor(msgType: string, title: string, message: string) {
        super("message");
        this.obj.msgType = msgType;
        this.obj.title = title;
        this.obj.message = message;
    }
}
export class ErrorMsgAction extends MsgAction {
    constructor(title: string, message: string) {
        super("error", title, message);
    }
}
export class SuccessMsgAction extends MsgAction {
    constructor(title: string, message: string, id = 0) {
        super("success", title, message);
        this.obj.id = id;
    }
}
export class WarningMsgAction extends MsgAction {
    constructor(title: string, message: string, id = 0) {
        super("warning", title, message);
        this.obj.id = id;
    }
}
export class LoadingMsgAction extends MsgAction {
    constructor(title: string, message: string, id = 0) {
        super("loading", title, message);
        this.obj.id = id;
    }
}
interface PopWindow {
    type: string,
    title?: string,
    text?: string
}
//弹出弹窗
export function popWindowAction(obj: PopWindow) {
    _dispatch({
        type: obj.type,
        response: { StatusCode: "popWindow", ...obj }
    });
}
export function Authority(justReturn = false) {//是否跳转Login页面
    let state = _getState();
    if (!state.user || !state.user.Token) {
        if (!justReturn) {
            Modal.destroyAll();
            Modal.confirm({
                title: '是否登录',
                content: '请先登录账号,才能了解更多',
                okText: "登录",
                onOk() {
                    window.routerHistory.push("/Login")
                },
                cancelText: "取消",
            });
        }
        return false;
    }
    return true;
}
export function clearUser() {//清除缓存和本地的用户信息;
    _dispatch({ type: "clearUser" });
}
//获取广告图片
export class ApiImageAction extends ApiAction {
    constructor(Type = "pc_home_images") {
        super("News/GetAllAds", { PageIndex: 0, PageSize: 10, Type: Type, SortName: "Sort", SortOrder: "ASC" }, 'get');
    }
}
//获取资讯配置，通过分类获取包含公告走马灯、信息等
export class ApiNoticeAction extends ApiAction {
    constructor(type = "notice") {
        let params = {
            CategoryCode: type,
            PageSize: 10,
            PageIndex: 0,
            SortName: "Sort",
            SortOrder: "DESC"
        };
        super("News/GetList", params, "get");
    }
}


// 导航API
export class PageNavAction extends ApiAction {
    constructor(Tag = "", Type = "", PageNo = 1) {
        Tag = Tag ? Tag : "PCNav";
        let ownerName = window.config.gameTag;
        super("Client/GetGameLayout", { Tag, OwinId: ownerName, Type, PageNo: PageNo - 1 }, "get");
    }
}

//获取各种菜单导航
export class ApiGetMenuAction extends ApiAction {
    constructor(MenuKeys: string) {
        super("Client/GetSubmenuList", { MenuKeys }, "get");
    }
}


//获取PC游戏分类
export class ApiPcGameCategoriesAction extends ApiAction {
    constructor() {
        super("client/pc_game_categories", { Tag: config.gameTag }, "get");

    }
}

//获取游戏
export class ApiQueryGamesAction extends ApiAction {
    constructor(filter: any) {
        let params = {
            ...filter,
            Tag: config.gameTag,
            TerminalType: "PC"
        }
        super("client/games", params, 'get');
    }
}

export function ChangeGameTabs(data: any) {//触发更改游戏内页二级导航事件
    let obj = { type: "ChangeGameTabs", data: data.pram };
    _dispatch(obj);
}



//获取游戏收藏
export class ApiGetFavoritesAction extends ApiAction {
    constructor(PageIndex = 0, PageSize = 51) {
        super("Game/GetFavorites", { PageSize, PageIndex, Tag: window.config.gameTag }, "get");
    }
}

//添加游戏到收藏夹
export class ApiAddFavoriteAction extends ApiAction {
    constructor(GameId: number) {
        super("Game/AddFavorite", { GameId, Tag: window.config.gameTag }, "post");
        this.setMsgs(
            new LoadingMsgAction("", "游戏收藏中"),
            new SuccessMsgAction("", "游戏收藏成功"),
            new ErrorMsgAction("", "游戏收藏失败")
        )
    }
}

//删除游戏收藏
export class ApiDeleteFavoriteAction extends ApiAction {
    constructor(GameId: number) {
        super("Game/DeleteFavorite", { GameId, Tag: window.config.gameTag }, "post");
        this.setMsgs(
            new LoadingMsgAction("", "移除收藏中"),
            new SuccessMsgAction("", "移除收藏成功"),
            new ErrorMsgAction("", "移除收藏失败")
        )
    }
}


//客服信息相關
export class ApiAllSysConfigAction extends ApiAction {
    constructor() {
        super("client/all_sys_cfg", { Tag: window.config.webSiteTag }, "get");
    }
}

//获取会员信息
export class ApiPlayerInfoAction extends ApiAction {
    constructor() {
        super("Account/GetLoginUser", {}, "get");
    }
}


//获取游戏平台
export class ApiGamePlatformsAction extends ApiAction {
    constructor() {
        super("client/game_platforms", {}, "get");
    }
}

//获取指定游戏平台余额
export class ApiGamePlatformBalanceAction extends ApiAction {
    constructor(platformId: string) {
        super("Game/GetBalance", { GamePlatform: platformId }, 'get');
    }
}

//獲取所有游戲平臺的余额
export class ApiGamePlatformAllBalanceAction extends ApiAction {
    constructor() {
        super("Game/GetAllBalance", {}, 'get');
    }
}

// 一键回收余额，主要用于异步刷新各平台余额
export function OneClickRefresh(platform: any[] = []) {
    _dispatch({ type: "RefreshLoading", response: { platform } });
}

//获取游戏登录地址
export class ApiGetLoginUrl extends ApiAction {
    constructor(filter = {}) {//传入的OperateWebSite是错误的，所以直接用全局的WebSiteOperate
        let params = {
            ...filter,
            Tag: window.config.gameTag,
            OperateWebSite: getHost("(WEB)"),
        };
        super("Game/GetLoginUrl", params, 'get');
        this.setMsgs(
            new LoadingMsgAction("", "游戏链接获取中"),
            null,
            new ErrorMsgAction("", "游戏链接异常")
        )
    }
}

//未登录时体育页面调用此API查看试玩API
export class ApiGetDemoUrl extends ApiAction {
    constructor(filter = {}) {//传入的OperateWebSite是错误的，所以直接用全局的WebSiteOperate
        let params = {
            ...filter,
            Tag: window.config.gameTag,
            OperateWebSite: getHost("(WEB)"),
        };
        super("Game/GetDemoUrl", params, 'get');
        this.setMsgs(
            new LoadingMsgAction("", "游戏链接获取中"),
            null,
            new ErrorMsgAction("", "游戏链接异常")
        )
    }
}

//注册相关配置
export class ApiGetRegistrySettingAction extends ApiAction {
    constructor() {
        super("Config/GetRegistrySetting", { clientType }, "get");
    }
}

//获取注册验证码
export class ApiAuthCodeAction extends ApiAction {
    constructor() {
        super("Account/AuthCode", {}, "get");
    }
}

//注册提交
export class ApiSignUpAction extends ApiAction {
    constructor(obj: any) {
        super("Account/SignUp", { ...obj, clientType }, "POST");
    }
}


//登录后 初始化调用的接口
export class LoginAfterInit {
    constructor() {
        new ApiBanksAction().fly()
        new ApiPlayerInfoAction().fly();
        new ApiBankAccountsAction().fly();
        new ApiGetFavoritesAction().fly();
        new ApiSitemsgUnreadCountAction().fly();
        new ApiGamePlatformAllBalanceAction().fly()
    }
}


//登陆
export class ApiLoginAction extends ApiAction {
    constructor(UserName: string, Password: string) {
        let arg = {
            UserName,
            Password
        };
        super("Account/Login", arg);
    }
}

//登出
export class LogoutAction extends ApiAction {
    constructor() {
        let username = _getState().user.username;
        super("Account/Logout", { username }, "get");
    }
}

//放入用户相关信息
export function SetUserAction(params: object) {
    _dispatch({ type: "setUser", response: params });
}


//查询站内信
export class ApiQuerySitemsgsAction extends ApiAction {
    constructor(FromDateTime: string, ToDateTime: string, PageIndex = 0, PageSize = 10) {
        super("User/GetSiteMsgs", { FromDateTime, ToDateTime, PageIndex: PageIndex, PageSize }, 'get');
    }
}

//  存款
export class ApiGetAllPayAction extends ApiAction {
    constructor(mobile = true) {
        super("Deposit/GetAllPay", { mobile }, 'get');
    }
}
//  提交在线支付
export class ApiSubmitOnlinePayAction extends ApiAction {
    constructor(body: any, OperateWebSite = WebSiteOperate) {
        let params = {
            ...body,
            OperateWebSite: window.location.host + OperateWebSite
        };
        super("Pay/SubmitOnlinePay", params);
    }
}
//  银行转账
export class ApiOfflineDepositAction extends ApiAction {
    constructor(params: any) {
        let filter = {
            BankId: "",
            TransType: "",
            Amount: "",
            Province: "",
            City: "",
            Address: "",
            AccountName: "",
            DepositType: 0,
            Tag: config.webSiteTag,//可以不传
            OperateWebSite: window.location.host + WebSiteOperate//可以不传
        };
        params = {
            ...filter,
            ...params
        };
        super("Deposit/Add", params);
    }
}

// 获取行政稽核数
export class ApiGetAuditAction extends ApiAction {
    constructor() {
        super("Withdrawal/GetTotalFee", {}, "get");
    }
}
//新增获取所有收款银行列表
export class ApiGetAdminAllBanksAction extends ApiAction {
    constructor() {
        super("Deposit/GetAdminAllBanks", {}, 'get');
    }
}
//获取用户可用支付银行列表
export class ApiPayBanksAction extends ApiAction {
    constructor(mobile = false) {
        super("Deposit/GetPayBanks", { mobile }, 'get');
    }
}

//获取在线支付银行列表
export class ApiOnlinePayAction extends ApiAction {
    constructor(mobile = false) {
        super("Deposit/GetOnlinePay", { mobile }, 'get');
    }
}
//用户提款
export class ApiWithdrawAction extends ApiAction {
    constructor(params: any) {
        let filter = {//后台要接收的参数
            BankAccountId: "",
            Amount: "",
            WithdrawalPwd: "",
            CodeType: "",
            UserAuditConfirm: true,
            Tag: config.webSiteTag,//可以不传
            OperateWebSite: window.location.host + WebSiteOperate//可以不传
        };
        params = {
            ...filter,
            ...params
        };
        super("Withdrawal/Apply", params);
        let err = params.UserAuditConfirm ? new ErrorMsgAction("取款申请失败", "") : new ErrorMsgAction("申请确认", "");
        this.setMsgs(
            new LoadingMsgAction("取款申请中", ""),
            new SuccessMsgAction("取款申请成功", ""),
            err,
        );
    }
}
// 获取邮箱验证码
export class ApiSendEmailVCodeAction extends ApiAction {
    constructor() {
        super("User/SendEmailVCode", {});
    }
}
//提交邮箱验证码
export class ApiValidateEmailAction extends ApiAction {
    constructor(email: string, emailVCode: string | number) {
        super("User/ValidateEmail", { email, emailVCode });
    }
}
// 获取短信验证码
export class ApiSendMobileVCodeAction extends ApiAction {
    constructor() {
        super("User/SendMobileVCode", {}, "POST");
    }
}
// 提交手机验证码
export class ApiValidatePhoneAction extends ApiAction {
    constructor(Phone: any, PhoneVCode: any) {
        super("User/ValidatePhone", { Phone, PhoneVCode });
    }
}
// 自动转账开关
export class ApiUpdateTransferSettingAction extends ApiAction {
    constructor(open: any, voice: number = 0) {//0关,1开
        super("User/UpdateTransferSetting", { AutoTransfer: open, EnableVoice: voice }, 'post');
        this.setMsgs(
            new LoadingMsgAction("", "自动转账切换中"),
            new SuccessMsgAction("", "自动转账切换成功"),
            new ErrorMsgAction("", "自动转账切换失败")
        );
    }
}
// 转账到中心钱包或游戏平台
export class ApiTransferAction extends ApiAction {
    constructor(GamePlatform: string, type: string, Amount: string | number, isShowMsg: boolean = true) {
        let title = GamePlatform + (type === "in" ? "转入" : "转出");
        Amount = Number(Amount);
        if (type === "in") {
            super("Transfer/ToGame", {
                GamePlatform,
                Amount,
                IsDemo: false,
                OperateWebSite: window.location.host + "WEB",
                Tag: config.webSiteTag
            });
        } else {
            super("Transfer/FromGame", {
                GamePlatform,
                Amount,
                IsDemo: false,
                OperateWebSite: window.location.host + WebSiteOperate,
                Tag: config.webSiteTag
            });
        }
        if (isShowMsg) {
            this.setMsgs(
                new LoadingMsgAction("", title + "中"),
                new SuccessMsgAction("", title + "成功"),
                new ErrorMsgAction("", title + "失败")
            );
        }
    }
}
interface GamePlatforms {
    [key:string]:number|string
}

// 一键转出
export class ApiTransferOutAction extends ApiAction {
    constructor(GamePlatforms:GamePlatforms = {},isShowMsg: boolean = true){
        super("Transfer/FromGames", {
            GamePlatforms,
            IsDemo: false,
            OperateWebSite: window.location.host + "WEB",
            Tag: config.webSiteTag
        });
        if (isShowMsg) {
            this.setMsgs(
                new LoadingMsgAction("","转出中"),
                new SuccessMsgAction("","转出成功"),
                new ErrorMsgAction("","转出失败")
            );
        }
    }
}

// 获取系统配置项
export class LoadBackConfigsAction extends ApiAction {
    constructor() {
        super("Config/GetItems", {}, "get");
    }
}
interface redEnv {
    pageNo: number,
    pageSize: number,
    LuckyNo: string,
    UserName: string
}
// 活动中奖列表
export class AwardslistAction extends ApiAction {
    constructor(param: redEnv) {
        let filter = {
            pageNo: 1,
            pageSize: 10,
            LuckyNo: "LuckyMoney1",//默认红包
        }
        param = {
            ...filter,
            ...param,
        }
        super("Lucky/GetWinners", param, "get");
    }
}
// 个人中奖信息
export class ApiAwardsWinnerListAction extends ApiAction {
    constructor() {
        super("Lucky/GetDrawResult", { LuckyNo: "LuckyMoney1" }, "get");
    }
}
// 活动（红包，转盘）信息
export class ApiActivityInfoAction extends ApiAction {
    constructor(isDZP = false) { // 偷个懒,默认红包,传参就转盘
        super("Lucky/Get", { LuckyNo: isDZP ? "LuckyMoney" : "LuckyMoney1" }, "get");
    }
}
// 活动剩余次数
export class ApiCheckActivityCountsAction extends ApiAction {
    constructor(isDZP = false) {
        let username = _getState().user.username;
        super("Lucky/GetCount", { LuckyNo: isDZP ? "LuckyMoney" : "LuckyMoney1", UserName: username }, "get");
    }
}
// 活动抽奖
export class ApiLuckDrawAction extends ApiAction {
    constructor(isDZP = false) {
        let username = _getState().user.username;
        super("Lucky/Draw", { LuckyNo: isDZP ? "LuckyMoney" : "LuckyMoney1", username: username }, "POST");
    }
}

//获取未读站内信數量
export class ApiSitemsgUnreadCountAction extends ApiAction {
    constructor() {
        super("User/GetUnreadSiteMsgs", {}, "get");
    }
}

//站内信数量全部设置为已读
export class ApiReadAllSiteMsgAction extends ApiAction {
    constructor() {
        super("User/ReadAllSiteMsg", {}, 'get');
    }
}
//读取站内信
export class ApiReadSiteMsgAction extends ApiAction {
    constructor(Ids: any) {
        super("User/ReadSiteMsgs", { Ids }, 'post');
    }
}

//玩家反馈
export class ApiFeedBackAction extends ApiAction {
    constructor(Content: string, Title: string) {
        super("User/AddMessage", { Content, Title }, "post");
    }

}


//登录密码修改
export class ApiChangePwdAction extends ApiAction {
    constructor(OldPwd: any, NewPwd: any) {
        super("User/UpdatePwd", { OldPwd, NewPwd });
        this.setMsgs(
            new LoadingMsgAction("", "登录密码修改中"),
            new SuccessMsgAction("", "登录密码修改成功"),
            new ErrorMsgAction("", "登录密码修改失败")
        );
    }
}

//支付密码修改
export class ApiChangePayPwdAction extends ApiAction {
    constructor(OldPwd: any, NewPwd: any) {
        super("User/UpdateWithdrawalPwd", { OldPwd, NewPwd });
        this.setMsgs(
            new LoadingMsgAction("", "支付密码修改中"),
            new SuccessMsgAction("", "支付密码修改成功"),
            new ErrorMsgAction("", "支付密码修改失败")
        );
    }
}

//获取优惠类型
export class ApiQueryPromotionTypesAction extends ApiAction {
    constructor() {
        super("Promo/GetTypes", { Tag: config.webSiteTag }, "get");
    }
}

//获取优惠列表
export class ApiQueryPromotionsAction extends ApiAction {
    constructor(PageIndex = 0, PageSize = 10, TypeId = null, showLoading = true) {
        super("Promo/GetList", {
            PageIndex: PageIndex,
            PageSize,
            TypeId,
            SortName: "Sort",
            SortOrder: "ASC",
            Tag: config.webSiteTag
        }, 'get');
    }
}

//获取会员绑定的银行卡
export class ApiBankAccountsAction extends ApiAction {
    constructor() {
        super("User/GetBankCards", {}, "get");
    }
}

//最新总合各种记录查询
export class ApiQueryHistoryAction extends ApiAction {
    constructor(obj: any, queryType: any, NeedAlert: any) {
        let params = {
            PageIndex: 0,
            PageSize: 10,
            SortName: "Id",
            SortOrder: "DESC",
            FromDateTime: getNowDate(-7),
            ToDateTime: getNowDate(0),
            ...obj
        }
        switch (queryType) {
            case "投注记录":
                params.SortName = "UpdateTime"
                super("Bet/GetBetList", params, "get");
                break;
            case "转账记录":
                super("Transfer/GetList", params, "get");
                break;
            case "存款记录":
                super("Deposit/GetList", params, "get");
                break;
            case "取款记录":
                super("Withdrawal/GetList", params, "get");
                break;
            case "优惠记录":
                super("User/GetUserBonusRecord", params, "get");
                break;
            case "站内信":
                super("User/GetSiteMsgs", params, "get");
                break;
        };

    }
}

//获取银行配置信息
export class ApiBanksAction extends ApiAction {
    constructor() {
        super("Config/GetBanks", {}, "get");
    }
}

//会员绑定银行卡
export class ApiBindCardAction extends ApiAction {
    constructor(params: any) {
        let filter = {//后台要接收的参数
            BankId: "",
            Province: "",
            City: "",
            BranchName: "",
            AccountNo: "",
            AccountName: ""
        };

        params = { ...filter, ...params };
        super("Withdrawal/AddBankCard", params);
        this.setMsgs(new LoadingMsgAction("", "银行卡绑定中"),
            new SuccessMsgAction("", "银行卡绑定成功"),
            new ErrorMsgAction("", "银行卡绑定失败")
        );
    }
}
type UpdateInfo = {
    TrueName: any,
    qq: any,
    email: any,
    WebChat: any,
    birthday: any,
    phone: any
}
//  修改用户信息（首次绑定提款信息真实姓名）
export class ApiUpdateInfoAction extends ApiAction {
    constructor(obj: UpdateInfo) {
        var user = _getState().user;
        super("User/UpdateInfo",
            {
                TrueName: obj.TrueName || user.realName,
                Phone: obj.phone || user.phone,
                QQ: obj.qq || user.qq,
                Email: obj.email || user.email,
                WebChat: obj.WebChat || user.webChat,
                Birthday: obj.birthday || user.birthday,
                Province: user.province,
                City: user.city,
                Address: user.address
            })
    }
}

// 获取推荐好友人数
export class ApiShareAction extends ApiAction {
    constructor() {
        super("account/GetRecommendedList", {}, "get");
    }
}

//代理注册提款银行的列表
export class ApiagentBanks extends ApiAction {
    constructor() {
        super("Agent/Portal_Bank", {}, "get")
    }
}

//代理注册提交
export class ApiAgentRegisterAction extends ApiAction {
    constructor(params: any) {
        let filter = {//后台要接收的参数
            UserName: "",
            TrueName: "",
            Password: "",
            Email: "",
            Phone: "",
            QQ: "",
            Birthday: "",
            Wechat: "",
            Referer: "",
            WithdrawalPassword: "",//可以不传
        };
        params = { ...filter, ...params };
        super("Agent/Apply", params);
    }
}

//WAP端代理注册 配置项获取
export class ApiAgentGetRegistSetting extends ApiAction {
    constructor() {
        super("Agent/GetRegistSetting", {}, "get");
    }
}

//图片
export class ApiGetConfigImgAction extends ApiAction {
    constructor() {
        super("Config/GetList", { configType: 3, clientType }, "GET");
    }
}