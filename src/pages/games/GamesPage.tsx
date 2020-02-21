import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import JackMoney from 'components/jackMoney/jackMoney'
import GameTabs from "components/gameTabs/GameTabs";
import Pagination from "components/pagination/Pagination";
import { in_array, toPlayGame } from "tollPlugin/commonFun";
import "./GamesPage.scss";

interface Item {
    ID: string
    Name: string
    MarkIds: string
    PlatformIds: string
    Jackpot: number
    GameType: string
    YoPlay: string
}


var filter = {//游戏查询参数
    GameMarks: "",
    GamePlatform: "",
    Jackpot: -1,
    YoPlay: "",
    GameType: "",
    GameName: ""
}

class GamesPage extends BaseClass {
    constructor(props: any) {
        super(props, []);
        this.state = {
            hasMore: false,
            tabsId: "",//当前选中游戏分类ID
            Loading: true,
            depositModalShow: false,//是否显示充值弹出层
            transferModalShow: false,//是否显示转入弹出层
            IntoRoomShow: false,//是否显示加入房间，棋牌专用
            IntoRoomGamePlatform: "",
            IntoRoomGameTypeText: "",
            gamesData: [],
            noData: false,//是否显示没有数据
            gameNav: [],
            searchValue: "",
            TotalRecord:0,//游戏总数
        };
    }


    componentDidMount() {
        // 初始化参数
        filter = {//游戏查询参数
            GameMarks: "",
            GamePlatform: "",
            Jackpot: -1,
            YoPlay: "",
            GameType: "",
            GameName: "",
        }
        if (this.props.gameLayout.game.length > 0) {
            this.init();
        }
    }

    static getDerivedStateFromProps(props: any, state: any) {
        if (props.gameLayout.game.length !== state.gameNav.length) {
            return {
                gameNav: props.gameLayout.game
            }
        }
        return null;
    }

    componentDidUpdate(pevProps: any, pevState: any) {
        if (pevState.gameNav.length !== this.props.gameLayout.game.length) {
            this.init();
        }
    }

    init() {
        //有导航了才进行初始化,默认显示第一个导航中的第一个分类
        filter.GameType = this.props.gameLayout.game[0].Games[0].GameType;
        filter.GamePlatform = this.props.gameLayout.game[0].Games[0].GamePlatform;
        new window.actions.ApiPcGameCategoriesAction().fly((resp: any) => {//根据后台配置的分类来渲染默认分类游戏
            if (resp.StatusCode === 0) {
                this.tabsChange(resp.Data[0]);
            }
        });
    }

    topSwichTab(): JSX.Element[] {//渲染头部分类选项卡
        let tabs: JSX.Element[] = [];
        this.props.categores.forEach((item: Item, index: number) => {
            let className = "";
            if (index === 0 && this.state.tabsId === "") {
                className = "tabsCate active";//默认选中第一个
            } else {
                className = this.state.tabsId === item.ID ? "tabsCate active" : "tabsCate"
            }

            tabs.push(
                <a key={index} className={className} onClick={this.tabsChange.bind(this, item)}>
                    {item.Name}
                </a>
            )
        })
        if (this.props.user.Token) {
            tabs.push(
                <a key="collect" className={this.state.tabsId === "collect" ? "tabsCate active" : "tabsCate"} onClick={this.tabsChangeToCollect.bind(this)}>
                    我的收藏
                </a>
            )
        }
        return tabs;
    }

    tabsChange(item: any) {
        if (item.ID === this.state.tabsId) return;
        window.actions.showLoading(true);
        this.setState({
            tabsId: item.ID
        });
        filter.GameMarks = item.MarkIds;
        // filter.Jackpot = item.Jackpot;
        if (item.ID === "YOPLAY") {
            filter.GameMarks = "";
            filter.GamePlatform = "";
            filter.GameType = "4";
            filter.YoPlay = "1";
        } else if (item.ID === "more_all") {
            filter.YoPlay = "";
        }
        this.getList();
    }

    getList(pageNo?:any) {//获取游戏
        filter.GameName = this.state.searchValue;
        window.actions.showLoading(true);
        new window.actions.ApiQueryGamesAction({ ...filter, PageSize: 24, PageNo: pageNo || 1 }).fly((resp: any) => {
            if (resp.StatusCode === 0) {
                this.setState({
                    gamesData: resp.Page,
                    TotalRecord:resp.TotalRecord
                })
            }
            window.actions.showLoading(false);
        })
        filter.GameName = ""
    }

    tabsChangeToCollect() {//最爱游戏处理
        if ("collect" === this.state.tabsId) return;
        this.setState({
            tabsId: "collect",
            gamesData: this.props.favoritesGames,
            TotalRecord:0
        });
    }


    render() {
        return (
            <div className="GamesPage">
                <JackMoney />
                <div className="gameBox">
                    <GameTabs
                        data={this.props.gameLayout.game || []}
                        activeAllBack={this.active.bind(this)}
                        id={"gameNav"}
                        tabAmount={8}
                    />
                    <div className="secondBox">
                        {this.topSwichTab()}
                        <div className="searchBox">
                            <i className="icon iconfont iconsousuo" onClick={this.getList.bind(this,1)}></i>
                            <input type="text" placeholder="输入查找游戏名"
                                value={this.state.searchValue}
                                onChange={(e) => { this.setState({ searchValue: e.target.value }) }}
                                onKeyUp={(e) => { if (e.keyCode === 13) { this.getList() } }}
                            />
                        </div>
                    </div>
                    <div className="gameContent">
                        {
                            this.state.gamesData.length > 0 ?
                                this.renderGames()
                                :
                                <img className="noGame" src={require("./images/noGame.png")} alt="" />
                        }
                    </div>
                    <Pagination
                        portion={25}//一页显示多少个
                        callBackFunc={this.callBackFunc.bind(this)}//回调
                        // 总数
                        Count={this.state.TotalRecord}>

                    </Pagination>

                </div>
            </div>
        );
    }

    active(item: any) {
        filter.GameType = this.props.gameLayout.game[item.index].Games[0].GameType;
        filter.GamePlatform = this.props.gameLayout.game[item.index].Games[0].GamePlatform;
        this.setState({
            tabsId:""
        })
        this.getList();
    }

    callBackFunc(pageNo:number){
        this.getList(pageNo+1);
    }



    renderGames() {
        return this.state.gamesData.map((game: any, index: number) => {
            if (in_array(game.Id, this.props.favoritesIds)) {
                //已经收藏
                return (
                    <div key={index} className="gameConBox">
                        <div className="gameImgBox" onClick={this.openGame.bind(this, game)}>
                            <img src={window.config.devImgUrl + game.IconUrl} alt="" />
                            <div className="imgShadow">
                                <div className="startButton">
                                    开始游戏
                                </div>
                            </div>
                        </div>
                        <div className="gameTitleBox">
                            <span>{game.Title}</span>
                            <i onClick={this.removeOrAddFavorite.bind(this, game, true)} className="icon iconfont iconicon3"></i>
                        </div>
                    </div>
                )
            } else {//可以收藏
                return (
                    <div key={index} className="gameConBox">
                        <div className="gameImgBox" onClick={this.openGame.bind(this, game)}>
                            <img src={window.config.devImgUrl + game.IconUrl} alt="" />
                            <div className="imgShadow">
                                <div className="startButton">
                                    开始游戏
                                </div>
                            </div>
                        </div>
                        <div className="gameTitleBox">
                            <span>{game.Title}</span>
                            <i onClick={this.removeOrAddFavorite.bind(this, game, false)} className="icon iconfont iconshoucang"></i>
                        </div>
                    </div>
                )
            }
        })
    }

    removeOrAddFavorite(item: any, isRemove: boolean, event: any) {
        event.preventDefault();
        event.stopPropagation();
        if (!window.actions.Authority()) return;
        if (isRemove) {//删除收藏
            new window.actions.ApiDeleteFavoriteAction(item.Id).fly((resp: any) => {
                if (resp.StatusCode === 0) {
                    new window.actions.ApiGetFavoritesAction().fly();
                }

            });
        } else {//添加收藏
            if (!window.actions.Authority(true)) return false;
            new window.actions.ApiAddFavoriteAction(item.Id).fly((resp: any) => {
                if (resp.StatusCode === 0) {
                    new window.actions.ApiGetFavoritesAction().fly();
                }
            });
        }
    }

    openGame(games: any) {
        toPlayGame(this, games);
    }



}


const mapStateToProps = (state: any, ownProps: any) => ({
    gameLayout: state.gameLayout,
    categores: state.categores.slot_category,
    user: state.user,
    favoritesIds: state.favoritesIds.Fids,//最爱游戏ID
    favoritesGames: state.favoritesIds.favoriteGames,//最爱游戏
    remoteSysConfs: state.remoteSysConfs,
    platforms: state.game.platforms,
});

export default withRouter(connect(mapStateToProps)(GamesPage));
