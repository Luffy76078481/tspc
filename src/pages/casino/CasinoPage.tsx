import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { toPlayGame } from "tollPlugin/commonFun";
import GameTabs from "components/gameTabs/GameTabs";
import "./CasinoPage.scss";

class CasinoPage extends BaseClass {
    constructor(props: any) {
        super(props, [])
    }

    public state = {
        activeIndex: 0
    }

    render() {
        return (
            <div className="CasinoPage">
                <GameTabs
                    data={this.props.gameLayout.casinoGame || []}
                    activeAllBack={this.active.bind(this)}
                    id={"casinoGame"}
                />
                {
                    this.runImg()
                }
            </div>
        );
    }
    active(item: any) {
        this.setState({
            activeIndex: item.index
        });
    }

    runImg() {
        let gameDom = [];
        for (let index = 0; index < this.props.gameLayout.casinoGame.length; index++) {
            const games = this.props.gameLayout.casinoGame[index];
            let style = { "display": this.state.activeIndex === index ? "block" : "none" }
            gameDom.push(
                <div className="imgBox" style={style} key={index}>
                    <img className="leftImg fadeLeft-enter" src={window.config.devImgUrl + games.BigPictureUrl} alt="" />
                    <img className="rightImg fadeRight-enter" src={window.config.devImgUrl + games.MinPictureUrl} alt="" />
                    <button className="fadeRight-enter" onClick={this.openGame.bind(this,games)}>立即游戏</button>
                </div>
            );
        }
        return gameDom;
    }

    openGame(games:any) {
        toPlayGame(this,games.Games[0]);
    }
}


const mapStateToProps = (state: any, ownProps: any) => ({
    gameLayout: state.gameLayout,
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
    platforms: state.game.platforms,
});

export default withRouter(connect(mapStateToProps)(CasinoPage));
