import { combineReducers } from 'redux';
import { onApiResultCallback } from "./anctions";
import { setStorage, remove, getStorage} from "tollPlugin/commonFun";


const apiResult = (state = null, action: any) => {//api回调
    if (action.type === "api_finish") {
        setTimeout(() => {
            onApiResultCallback(action)
        });
        return action;
    }
    return state;
};

function deepCopy(state: any) {
    let newState: any = JSON.stringify(state);//进行深拷贝
    return JSON.parse(newState);
}

interface PopWindow {
    type: string
}
//各种状态临时存储
const popWindow = (state: PopWindow = { type: "" }, action: any) => {
    if (action.response && action.response.StatusCode === "popWindow") {
        let newState: any = deepCopy(state);
        if (action.type) {
            newState = { ...action.response, type: action.type };
        } else {
            newState = { type: "" }
        }
        return newState;
    }
    return state;
};



//获取首页是否需要弹出框
const homePromotion = (state = [], action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0 && action.url === "News/GetList" && (action.params.CategoryCode === "home-promotion" || action.params.CategoryCode === "app_home_promotion")) {
        state = action.response.NewsInfo;
    }
    return state;
}

//获取首页比赛数据
const homeGameData = (state = null, action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0 && action.url === "News/GetList" && action.params.CategoryCode === "today") {
        state = action.response.NewsInfo;
    }
    return state;
}

///轮播图
const pcAdsList = (state = [], action: any) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "News/GetAllAds") {
        state = action.response.List;
    }
    return state;
}


//图片LOGO配置
const imagesConfig = (state = { PCLogo: "" }, action: any) => {
    if (action.type === "api_finish" && action.url === "Config/GetList" && action.response.StatusCode === 0) {
        let newState = deepCopy(state);
        newState.PCLogo = action.response.Config.PCLogo;
        return newState;
    }
    return state;
}


//获取公告走马灯
const notices = (state = [], action: any) => {
    if (action.type === "api_finish" && action.url === "News/GetList" && action.params.CategoryCode === "notice" && action.response.StatusCode === 0) {
        let newState = deepCopy(state)
        newState = action.response.NewsInfo;
        return newState;
    }
    return state;
};
type objSys = {
    config:string,
    content:string
}
type RemoteSysConfs = {
    [key:string]:string;
}
//客服信息
const remoteSysConfs = (state:RemoteSysConfs = { 
    channel_push_url:"",
    agent_qq:"",
    online_service_email:"",
    suggestion:"",
    agent_regist_link:""
}, action: any) => {
       if (action.type === "api_finish" && action.url === "client/all_sys_cfg" && action.response.StatusCode === 0) {
        state = { ...state, ...action.response.Config };
    }
    return state;
}

/*
游戏中心接口，包含首页导航各种游戏内页导航、以及游戏。
*/
const gameLayout = (state = {
    // 〓〓〓PC〓〓〓
    mainNav: [] as any,//主导航
    chessNav: [],//棋牌内页导航
    chessGame: [],//棋牌游戏
    bingoNav: [],//彩票内页导航
    bingoGame: [],//彩票游戏
    eSportNav: [],//电竞导航
    eSportGame: [],//电竞游戏
    sportNav: [],//体育导航
    No188SportNav: [] as any,//不包含188的体育导航
    Have188SportNav: [],//包含188的体育导航
    fishNav: [],//捕鱼导航
    fishGame: [],//捕鱼游戏
    game: [],//电子游戏
    casinoGame: [],//真人导航
    mainIndex: -1,//体育在主导航的下标
}, action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0 && action.url === "Client/GetGameLayout") {
        let newState = deepCopy(state);
        switch (action.params.Type) {
            case "chessGame"://请求的是棋牌游戏
                newState.chessGame = action.response.Data[0];
                break;
            case "bingoGame"://请求的是彩票游戏
                newState.bingoGame = action.response.Data[0];
                break;
            case "eSportGame"://请求的是电竞游戏
                newState.eSportGame = action.response.Data[0];
                break;
            case "fishGame"://请求捕鱼游戏
                newState.fishGame = action.response.Data[0].Games;
                break;
            default://请求的是所有初始数据
                let dataSource = action.response.Data[0].Data;
                for (let i = 0; i < dataSource.length; i++) {
                    let dataList = dataSource[i];
                    newState.mainNav.push(dataList);//将处理好的主导航放入数组
                    if (dataList.Data) {//存在子导航
                        switch (dataList.Tag) {
                            case "chess":
                                newState.chessNav = dataList.Data;//初始棋牌子导航
                                newState.chessGame = dataList.Data[0];//初始首屏棋牌数据
                                continue;
                            case "bingo":
                                newState.bingoNav = dataList.Data;//初始棋牌子导航
                                newState.bingoGame = dataList.Data[0];//初始首屏棋牌数据
                                continue;
                            case "fish":
                                newState.fishNav = dataList.Data;//初始捕鱼子导航
                                newState.fishGame = dataList.Data[0];//初始首屏捕鱼数据
                                continue;
                            case "eSport":
                                newState.eSportNav = dataList.Data;//初始电竞子导航
                                newState.eSportGame = dataList.Data[0];//初始首屏电竞数据
                                continue
                            case "sport":
                                newState.sportNav = dataList.Data;//初始体育导航
                                newState.Have188SportNav = dataList.Data;//初始包含188的体育导航体育导航
                                let No188SportNav = [];
                                newState.mainIndex = i;
                                for (let index = 0; index < dataList.Data.length; index++) {
                                    if (dataList.Data[index].Tag.indexOf("188") === -1) {
                                        No188SportNav.push(dataList.Data[index]);
                                    }
                                }
                                newState.No188SportNav = No188SportNav;//初始不包含188的体育导航体育导航
                                continue
                            case "casino":
                                newState.casinoGame = dataList.Data;// 真人游戏
                                continue;
                            case "game":
                                newState.game = dataList.Data;// 电子游戏
                                continue;
                        }
                        // dataList.Data = null;//清空主导航里子导航的数据
                    } else if (dataList.Games) {//不存在子导航，直接包含游戏
                        switch (dataList.Tag) {
                            case "fish":
                                let fishLogoObj = dataList.CustomizeData ? JSON.parse(dataList.CustomizeData) : {};
                                // 捕魚平台LOGO
                                for (let i = 0; i < dataList.Games.length; i++) {
                                    dataList.Games[i].fishLogoUrl = fishLogoObj[dataList.Games[i].GamePlatform] || "";
                                }
                                newState.fishGame = dataList.Games;//放入捕鱼游戏
                                continue;
                        }
                    }
                }
                if (getStorage("user")) {//一系列你看不懂的骚操作，by alone 2019-12-03
                    newState.sportNav = newState.Have188SportNav;
                    if (newState.mainIndex !== -1 && newState.mainNav[newState.mainIndex]) {
                        newState.mainNav[newState.mainIndex].Data = newState.Have188SportNav;
                    }
                } else {
                    newState.sportNav = newState.No188SportNav;
                    if (newState.mainIndex !== -1 && newState.mainNav[newState.mainIndex]) {
                        newState.mainNav[newState.mainIndex].Data = newState.No188SportNav
                    }
                }
                return newState;
        }
    }
    //一系列你看不懂的骚操作，by alone 2019-12-03
    if (getStorage("user")) {
        state.sportNav = state.Have188SportNav;
        if (state.mainIndex !== -1 && state.mainNav[state.mainIndex]) {
            state.mainNav[state.mainIndex].Data = state.Have188SportNav;
        }
    } else {
        state.sportNav = state.No188SportNav;
        if (state.mainIndex !== -1 && state.mainNav[state.mainIndex]) {
            state.mainNav[state.mainIndex].Data = state.No188SportNav
        }
    }
    return state;
}


//客服信息
const menus = (state = {
    helpMenu: {},//帮助中心导航
}, action: any) => {
    if (action.type === "api_finish" && action.url === "Client/GetSubmenuList" && action.response.StatusCode === 0) {
        let newState = deepCopy(state);
        switch (action.params.MenuKeys) {
            case "helpMenu": {//帮助中心的菜单特殊处理，因为之前没这个接口数据是写死的，所以现在按照写死的数据进行格式化
                let newList: any = {}
                for (let index = 0; index < action.response.Data.length; index++) {
                    const data = action.response.Data[index];
                    newList[data.MenuKeys] = {
                        title: data.SubTitle,
                        key: index + 1,
                        keyName: data.MenuKeys,
                        icon: data.ClassName,
                        listData: []
                    }
                }
                newState.helpMenu = newList;
                return newState;
            }
        }
    }
    return state;
}




//跳转到指定的游戏tab   
const gameTabs = (state = "", action: any) => {
    if (action.type === "ChangeGameTabs") {
        state = action.data;
    }
    return state;
}


//游戏分类
const categores = (state = { slot_category: [] }, action: any) => {
    if (action.type === "api_finish" && action.url === "client/pc_game_categories" && action.response.StatusCode === 0) {
        state = deepCopy(state);
        state.slot_category = action.response.Data;
        return state;
    }
    return state;
}
interface User {
    [key: string]: any
}
const user = (
    state: User = {
        amount: 0,
        bankAccounts: [],// 银行卡
        userBalance: 0.00,
        verfyPhone: false,
        verfyEmail: false,
        realName: ""
    },
    action: any) => {
    let changed = false;
    //自动登录从本地储存取出的用户信息
    if (action.type === "setUser") {
        state = {
            ...state, ...action.response
        };
    }
    //清除本地和内存的user信息
    if (action.type === "clearUser" || action.type === "Account_Logout") {
        let newState: any = deepCopy({ amount: 0, bankAccounts: [] });
        remove("user")
        return newState;
    }

    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        //登录API返回的用户信息
        if (action.url === "Account/Login") {
            state = {
                ...state, ...action.response
            };
            sessionStorage.setItem("allowPopup","true");
            changed = true;
        }
        if (action.url === "Account/Logout") {
            let newState: any = deepCopy({ amount: 0, bankAccounts: [] });
            remove("user")
            return newState;
        }
        if (action.response.Token) {
            state = { ...state, Token: action.response.Token };
            changed = true;
        }
        if (action.url === "Game/GetAllBalance") {
            let obj = action.response.Data;
            let amount = state.amount;
            for (var i in obj) {
                amount += obj[i]
            }
            state = deepCopy(state)
            state = { ...state, userBalance: amount.toFixed(2) }; // 总财富
            changed = true;
        }
        if (action.url === "User/GetBankCards") {
            state = Object.assign(state, { bankAccounts: action.response.List });
            changed = true;
        }
        //用户信息
        if (action.url === "Account/GetLoginUser" && action.type === "api_finish" && action.response.StatusCode === 0) {
            let resp = action.response;
            state = {
                ...state,
                qq: resp.UserInfo.QQ,
                username: resp.UserInfo.UserName,
                recommendCode: resp.UserInfo.RecommendCode,
                userLevel: resp.UserInfo.UserLevel,
                realName: resp.UserInfo.TrueName,
                email: resp.UserInfo.Email,
                phone: resp.UserInfo.Phone,
                amount: resp.UserInfo.Cash,
                userLevelName: resp.UserInfo.UserLevelName,
                LastLoginTime: resp.UserInfo.LastLoginTime,
                verfyPhone: resp.UserInfo.PhoneValidateStatus,
                verfyEmail: resp.UserInfo.EmailValidateStatus,
                birthday: resp.UserInfo.Birthday,
                SingleMinWithdraw: resp.UserInfo.SingleMinWithdraw,
                weChat: resp.UserInfo.Wechat,
                province: resp.UserInfo.Province,
                city: resp.UserInfo.City,
                integral: resp.UserInfo.Integral,
                address: resp.UserInfo.Address,
                AutoTransfer: resp.UserInfo.AutoTransfer,
                SourceWithdrawalPassword: resp.UserInfo.SourceWithdrawalPassword,
                IsSourceUser: resp.UserInfo.IsSourceUser,
                ImagePath: resp.UserInfo.ImagePath,
                SceneImage: resp.UserInfo.SceneImage,
                HasWithdrawalPassword: resp.UserInfo.HasWithdrawalPassword,
            };
            changed = true;
        }
    }
    if (changed) {
        state = { ...state, ...action.response };
        setStorage("user", state);
    }
    return state;
};

//查询站内信
const sitemsg = (state = { unread: 0 }, action: any) => {
    if (action.url === "User/GetUnreadSiteMsgs" && action.type === "api_finish" && action.response.StatusCode === 0) {
        let newState: any = deepCopy(state);
        newState.unread = action.response.Count;
        return newState;
    }
    return state;
};


//游戏相关数据
const game = (state = {
    platforms: [],
    gameMoney: 0
}, action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        let ret = deepCopy(state);
        if (action.url === "client/game_platforms") {//获取游戏平台
            let resp = action.response;
            ret.platforms = resp.Data;
            let sps = [];
            for (var i = 0; i < ret.platforms.length; i++) {
                let p = ret.platforms[i];
                if (p.ShowSlot) {
                    sps.push(p);
                }
                if (p.MarkInfos) {
                    let mms = p.MarkInfos.split("##");
                    sps.push({
                        id: mms[0].trim(),
                        markId: mms[0].trim(),
                        name2: mms[1].trim(),
                        order: parseInt(mms[2] || 0),
                        showSlot: 1
                    });
                }
            }
            sps.sort((a1, a2) => {
                return a2.order - a1.order;
            })
            ret.slot_platforms = sps;
            return ret
        }
        if (action.url === "Game/GetBalance") {//获取平台的余额
            let resp = action.response;
            let gameMoney: number = 0;
            for (let t = 0; t < ret.platforms.length; t++) {
                let platform = ret.platforms[t];
                if (platform.ID === action.params.GamePlatform) {
                    platform.Balance = resp.Balance;
                }
            }
            for (let ts = 0; ts < ret.platforms.length; ts++) {
                let platform = ret.platforms[ts];
                gameMoney += platform.Balance;
            }
            ret.gameMoney = gameMoney.toFixed(2);//游戏总余额
            return ret;
        }
        if (action.url === "Game/GetAllBalance") {//获取所有平台的余额
            let resp = action.response.Data;
            let gameMoney: number = 0;
            Object.keys(resp).forEach((key) => {
                gameMoney = +gameMoney + resp[key]
            })
            ret.gameMoney = gameMoney.toFixed(2);//游戏总余额
            for (let i = 0; i < state.platforms.length; i++) {
                let platform = ret.platforms[i];
                platform.Balance = resp[platform.ID] ? resp[platform.ID] : 0;
            }
            return ret;
        }
    }
    return state;
}
// 一键回收Loading控制
const refreshLoading = (state: any[] = [], action: any) => {
    if (action.response && action.type === "RefreshLoading") {
        state = deepCopy(action.response.platform);
    }
    return state
};
//最爱游戏
interface favoriteObj {
    Id: string;
}
const favoritesIds = (state = { Fids: [], favoriteGames: [] }, action: any) => {
    if (action.type === "api_finish" && action.url === "Game/GetFavorites") {
        let Fid: any = [];
        action.response.List.forEach((list: favoriteObj) => {
            Fid.push(list.Id)
        });
        state.Fids = Fid;

        state.favoriteGames = action.response.List;
    }
    return state;
}


interface ActionInterface {
    method: string,
    params: {
        mobile?: boolean,
        UserName?: string,
        LuckyNo?: string,
        pageNo?: number,
        pageSize?: number
    },
    response: any,
    type: string,
    url: string
}

// 支付方式
interface PayList {
    PayList: any[],
    QuickPrice: string
}
const getAllPay = (state: PayList = { PayList: [], QuickPrice: "" }, action: ActionInterface) => {
    if (action.type === "api_finish" && action.url === "Deposit/GetAllPay") {
        state = deepCopy({
            PayList: action.response.PayList,
            QuickPrice: action.response.QuickPrice
        });
    }
    return state;
}

//系统配置项
const backConfigs = (state = {isDecimal:"0"}, action: ActionInterface) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Config/GetItems") {
            state = action.response;
        }
    }
   
    return state;
}
// 红包
const Activity = (state = {
    List: [],//所有中奖列表
    WinnerList: [],//用户单独中奖信息
    Description: "<div></div>",
    RuleDes: "<div></div>",
    TurnTableDescription: "<div></div>",
    TurnTableRuleDes: "<div></div>"
}, action: ActionInterface) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        let ret = deepCopy(state);
        // LuckyMoney1红包 LuckyMoney转盘
        if (action.url === "Lucky/GetWinners" && action.params.LuckyNo === "LuckyMoney1") {
            ret.List = action.response.List;
            return ret
        }
        if (action.url === "Lucky/Get" && action.params.LuckyNo === "LuckyMoney1") {
            ret.Description = action.response.LuckyInfo.Description;
            ret.RuleDes = action.response.LuckyInfo.RuleDes;
            return ret
        }
        if (action.url === "Lucky/GetDrawResult") {
            ret.WinnerList = action.response.List;
            return ret
        }
        if (action.url === "Lucky/Get" && action.params.LuckyNo === "LuckyMoney") {
            ret.TurnTableDescription = action.response.LuckyInfo.Description;
            ret.TurnTableRuleDes = action.response.LuckyInfo.RuleDes;
            return ret
        }
    }
    return state
}

interface AllState {
    [key: string]: any; // Add index signature
}
function computePage(action: any, page: any) {
    let state: AllState = {};

    function mathTotalPage(total: number, size: number) {
        if (Number.isInteger(total / size) && (total / size > 0)) {//如果是正整数
            return total / size;
        } else {
            return (total / size) + 1;
        }
    }

    state.rows = page.List;
    state.total = page.Count;
    state.totalPage = mathTotalPage(state.total, action.params.PageSize);
    state.pageNo = action.params.PageIndex;
    state.pageSize = action.params.PageSize;
    state.startRowIndex = state.pageNo * state.pageSize + 1;
    state.endRowIndex = state.startRowIndex + state.rows.length - 1;
    if (state.total <= 0) {
        state.startRowIndex = 0;
    }
    return state;
}
// 页码，总页数，数量，开始，结束，总数
function initPage() {
    return { pageNo: 1, totalPage: 1, pageSize: 10, startRowIndex: 0, endRowIndex: 0, total: 0, rows: [] };
}

//投注/充值/提款/转账/优惠 记录
const records = (state: AllState = {
    betRecords: initPage(),
    transferRecords: initPage(),
    depositRecords: initPage(),
    withdrawRecords: initPage(),
    myMsgsRecords: initPage(),
    myPromoRecords: initPage()
}, action: any) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    state = deepCopy(state);
    if (action.url === "Bet/GetBetList") {
        state.betRecords = computePage(action, action.response);
    } else if (action.url === "Transfer/GetList") {//转账记录
        state.transferRecords = computePage(action, action.response);
    } else if (action.url === "Deposit/GetList") {
        state.depositRecords = computePage(action, action.response);
    } else if (action.url === "Withdrawal/GetList") {
        state.withdrawRecords = computePage(action, action.response);
    } else if (action.url === "User/GetSiteMsgs") {
        state.myMsgsRecords = computePage(action, action.response);
    } else if (action.url === "User/GetUserBonusRecord") {
        state.myPromoRecords = computePage(action, action.response);
    }
    return state;
}

//优惠
const promotions = (state = {
    promotions: initPage(),
    promoData: [],//首屏
    promoTypes: [] as any[],//分类
    Count: 0
}, action: any) => {
    if (action.type !== "api_finish" || action.response.StatusCode !== 0) {
        return state;
    }
    if (action.url === "Promo/GetList") {
        state = deepCopy(state);
        state.Count = action.response.Count;
    }
    if (action.url === "Promo/GetList" && !action.params.TypeId) {  //  全部
        state = deepCopy(state);
        state.promoData = action.response.List;
    } else if (action.url === "Promo/GetList" && action.params.TypeId) { // 单个优惠
        state = deepCopy(state);
        let ps: any = computePage(action, action.response);
        state.promotions = ps;
    } else if (action.url === "Promo/GetTypes") {
        state = deepCopy(state);
        state.promoTypes = [{ Id: "", TypeName: "全部优惠" }].concat(action.response.List);
    }
    return state;
};

//銀行配置信息
const bankInfos = (state = [], action: any) => {
    if (action.type === "api_finish" && action.url === "Config/GetBanks" && action.response.StatusCode === 0) {
        state = action.response.List;
    }
    return state;
}

// WAP端代理注册 配置项获取
const AgentRegisterSetting = (
    state = {
        Birthday: { IsVisible: false },
        Email: { IsVisible: false },
        Phone: { IsVisible: false },
        QQ: { IsVisible: false },
        TrueName: { IsVisible: false },
    }, action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Agent/GetRegistSetting") {
            state = action.response.Setting;
        }
    }
    return state;
}
//注冊相關配置
const registerSetting = (state = {}, action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Account/GetRegistSetting") {
            state = action.response;
        }
    }
    return state;
}

//最新注册相关配置
const getRegisterSetting = (state = {}, action: any) => {
    if (action.type === "api_finish" && action.response.StatusCode === 0) {
        if (action.url === "Config/GetRegistrySetting") {
            state = action.response;
        }
    }
    return state;
}



export default combineReducers({
    apiResult,
    popWindow,
    pcAdsList,
    notices,
    user,
    game,
    remoteSysConfs,
    homePromotion,
    getAllPay,
    backConfigs,
    Activity,
    records,
    categores,
    promotions,
    bankInfos,
    AgentRegisterSetting,
    registerSetting,
    getRegisterSetting,
    gameTabs,
    favoritesIds,
    refreshLoading,
    gameLayout,
    homeGameData,
    imagesConfig,
    sitemsg,
    menus
});

