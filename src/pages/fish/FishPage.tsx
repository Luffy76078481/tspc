import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { toPlayGame } from "tollPlugin/commonFun";
import GameTabs from "components/gameTabs/GameTabs";
import "./FishPage.scss";

class FishPage extends BaseClass {
    constructor(props: any) {
        super(props, [])
    }

    public state = {
        activeIndex: 0
    }

    render() {
        return (
            <div className="FishPage">
                <GameTabs
                    data={this.props.gameLayout.fishNav || []}
                    activeAllBack={this.active.bind(this)}
                    id={"fishNav"}
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
        for (let index = 0; index < this.props.gameLayout.fishNav.length; index++) {
            const games = this.props.gameLayout.fishNav[index];
            let style = { "display": this.state.activeIndex === index ? "block" : "none" }
            gameDom.push(
                <div className="imgBox" style={style} key={index}>
                    <img className="leftImg fadeLeft-enter" src={window.config.devImgUrl + games.BigPictureUrl} alt="" />
                    <img className="rightImg fadeRight-enter" src={window.config.devImgUrl + games.MinPictureUrl} style={{'right': games.Title === '财神捕鱼' ? '424px': '512px'}} alt="" />
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

export default withRouter(connect(mapStateToProps)(FishPage));
