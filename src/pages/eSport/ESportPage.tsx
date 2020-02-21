import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { toPlayGame } from "tollPlugin/commonFun";
import "./ESportPage.scss";

class ESportPage extends BaseClass {
    constructor(props: any) {
        super(props, [])
    }
    public state = {
        activeIndex:0
    }

    render() {
        return (
            <div className="ESportPage">
                {this.runImg()}
                <div className="bottomChess"></div>
            </div>
        );
    }

    runImg() {
        let gameDom = [];
        for (let index = 0; index < this.props.gameLayout.eSportNav.length; index++) {
            const games = this.props.gameLayout.eSportNav[index];
            let style = { "display": this.state.activeIndex === index ? "block" : "none" }
            gameDom.push(
                <div className="imgBox" style={style} key={index}>
                    <img className="leftImg" src={window.config.devImgUrl + games.BackgroundImgUrl} alt="" />
                    <button  onClick={this.openGame.bind(this,games)}>立即游戏</button>
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

export default withRouter(connect(mapStateToProps)(ESportPage));
