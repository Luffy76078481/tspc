import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import GameTabs from "components/gameTabs/GameTabs";
import { toPlayGame } from "tollPlugin/commonFun";
import "./StreetMachinePage.scss";

class StreetMachinePage extends BaseClass {
    public state = {
        activeIndex: 0
    }
    constructor(props: any) {
        super(props, [])
    }

    render() {
        return (
            <div className="StreetMachinePage">
                <GameTabs
                    data={this.props.gameLayout.chessNav || []}
                    activeAllBack={this.active.bind(this)}
                    id={"StreetMachinePage"}
                />
                {
                    this.props.gameLayout.chessNav.map((data: any, index: number) => {
                        return (
                            <div className="chessBG pulse-In"
                                key={index}
                                style={{
                                    "background": `url(${window.config.devImgUrl + data.BigPictureUrl}) 0 0/100% 100% no-repeat`,
                                    "display": this.state.activeIndex === index ? "block" : "none"
                                }}
                            >
                                <button onClick={this.openGame.bind(this, data)}>立即游戏</button>
                            </div>
                        )
                    })
                }

            </div>
        );
    }

    active(item: any) {
        this.setState({
            activeIndex: item.index
        });
    }
    openGame(games: any) {
        console.log(games)
        toPlayGame(this, games.Games[0]);
    }



}


const mapStateToProps = (state: any, ownProps: any) => ({
    gameLayout: state.gameLayout,
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
    platforms: state.game.platforms,
});

export default withRouter(connect(mapStateToProps)(StreetMachinePage));
