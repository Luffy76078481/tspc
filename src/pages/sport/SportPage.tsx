import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { toPlayGame } from "tollPlugin/commonFun";
import GameTabs from "components/gameTabs/GameTabs";
import "./SportPage.scss";

class SportPage extends BaseClass {
    constructor(props: any) {
        super(props, [])
    }
    public activeIndex = 0
    public state = {
        gameUrl: "",
        sportNav: [],
        frameWidth: "1200px"
    }
    componentDidMount() {
        this.init();
    }
    static getDerivedStateFromProps(props: any, state: any) {
        if (props.gameLayout.sportNav.length !== state.sportNav.length) {
            return {
                sportNav: props.gameLayout.sportNav
            }
        }
        return null;
    }
    componentDidUpdate(pevProps: any, pevState: any) {
        if (pevState.sportNav.length !== this.props.gameLayout.sportNav.length) {
            this.init()
        }
    }
    init() {
        if (this.props.gameLayout.sportNav.length > 0 && this.state.gameUrl === "") {
            this.getGameUrl();
        }
    }
    getGameUrl() {
        let GamePlatform = this.props.gameLayout.sportNav[this.activeIndex].Games[0].GamePlatform;
        if (GamePlatform.includes("BTI") || GamePlatform.includes("IBOSPORTS")) {
            this.setState({
                frameWidth: "1400px"
            })
        } else if (GamePlatform.includes("188") || GamePlatform.includes("SBO")) {
            this.setState({
                frameWidth: "1050px"
            })
        } else if (GamePlatform.includes('BBIN')) {
            this.setState({
                frameWidth: "1300px"
            })
        }else if (GamePlatform.includes('TB')) {
            this.setState({
                frameWidth: "1125px"
            })
        }
    
        if (this.props.user.Token) {
            toPlayGame(this, this.props.gameLayout.sportNav[this.activeIndex].Games[0], (gameUrl: string) => {
                this.setState({
                    gameUrl
                })
            })
        } else {//未登录返回试玩链接
            let game = this.props.gameLayout.sportNav[this.activeIndex].Games[0]
            let param = {
                GamePlatform: game.GamePlatform,
                GameType: game.GameTypeText,
                GameId: game.GameIdentify,
                IsMobile: false,
                IsDemo: false,
                TransferFlag: false,
            }
            new window.actions.ApiGetDemoUrl(param).fly((res: any) => {
                if (res.StatusCode === 0) {
                    this.setState({
                        gameUrl: res.GameDemoUrl
                    })
                }
            })
        }
    }
    render() {
        return (
            <div className="SportPage">
                <GameTabs
                    data={this.props.gameLayout.sportNav || []}
                    activeAllBack={this.active.bind(this)}
                    id={"sportNav"}
                />
                <iframe title="sport" src={this.state.gameUrl} width={this.state.frameWidth} frameBorder="0" />
            </div>
        );
    }
    active(item: any) {
        this.activeIndex = item.index;
        this.getGameUrl();
    }
}


const mapStateToProps = (state: any, ownProps: any) => ({
    gameLayout: state.gameLayout,
    gameTabs:state.gameTabs,
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
    platforms: state.game.platforms,
});

export default withRouter(connect(mapStateToProps)(SportPage));
