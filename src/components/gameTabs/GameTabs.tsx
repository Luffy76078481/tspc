
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Swiper from "swiper";
import "./GameTabs.scss";

interface State {
    tabActive: any
    defaultActiveKey: any
    gameData: any
    gameType: string
    init?: any
}
interface Pro {
    [Name: string]: any
}
class GameTabs extends Component<Pro> {
    public state: State = {
        tabActive: "",
        defaultActiveKey: "",
        gameData: [],
        gameType: ""
    }
    public tabAmount = this.props.tabAmount || 5
    constructor(props: any) {
        super(props);
        this.state = {
            tabActive: window[props.id] ? window[props.id] : "",
            defaultActiveKey: '0',
            gameData: [],
            gameType: ""
        }
    }

    componentDidMount() {
        this.init();
    }

    init() {
        if (this.props.data.length > this.tabAmount && !this.state.init) {
            setTimeout(() => {
                this.setState({
                    init: new Swiper('.initSwiper-gametabs', {
                        slidesPerView: this.tabAmount,
                        spaceBetween: 15,
                        navigation: {
                            nextEl: '.swiper-button-next-gametabs',
                            prevEl: '.swiper-button-prev-gametabs',
                        },
                    })
                })
            }, 100);
        }
    }


    static getDerivedStateFromProps(props: any, state: State) {
        if (props.data.length !== state.gameData.length) {
            return {
                gameData: props.data,
                init: null,
            }
        } else if (props.gameType !== state.gameType) {
            return {
                gameType: props.gameType
            }
        }
        return null;
    }

    componentDidUpdate(pevProps: any, pevState: any) {
        this.init();
        if (pevState.gameType !== this.props.gameType) {
            for (let index = 0; index < this.state.gameData.length; index++) {
                if (this.state.gameData[index].Tag === this.props.gameType) {
                    this.changeTab(this.props.gameType, index);
                }
            }
        }
    }

    // 切换导航
    changeTab(val: string, index = 0) {
        if (val === this.state.tabActive) return;
        this.setState({
            tabActive: val
        });
        window[this.props.id] = val as any;
        this.props.activeAllBack({ id: val, index })
    }
    // 导航数超过4
    tabsHandleChange = (index: number) => {
        let tag = this.props.data[index].Tag
        this.changeTab(tag, index)
        this.setState({
            defaultActiveKey: index
        })
    }

    setDefaultActiveKey = (gameType: string) => {
        if (!this.props.data.length) return;
        this.props.data.forEach((item: any, index: number) => {
            if (item.Tag === gameType) {
                this.setState({
                    defaultActiveKey: index + ''
                })
            }
        })
    }
    // 判断展示类型
    renderNavList = () => {
        if (!this.props.data.length) return null;
        if (this.props.data.length <= this.tabAmount) {
            return (
                <div className="tabsBox">
                    {this.props.data.map((data: any, index: number) => {
                        if (this.state.tabActive === "" && index === 0) {
                            window[this.props.id] = data.Tag;
                            return (
                                <div
                                    key={index}
                                    onClick={this.changeTab.bind(this, data.Tag, index)}
                                    className="nortabs tabActive">{data.Title}
                                </div>
                            )
                        } else {
                            return (
                                <div
                                    key={index}
                                    onClick={this.changeTab.bind(this, data.Tag, index)}
                                    className={this.state.tabActive === data.Tag ? "nortabs tabActive" : "nortabs"}>{data.Title}
                                </div>
                            )
                        }
                    })}
                </div>
            )
        }
        if (this.props.data.length > this.tabAmount) {
            return (
                <div className="tabsBox">
                    <div className="secNavBarBox swiper-container initSwiper-gametabs">
                        <div className="swiper-wrapper">
                            {
                                this.props.data.map((item: any, index: number) => {
                                    if (this.state.tabActive === "" && index === 0) {
                                        window[this.props.id] = item.Tag;
                                        return (
                                            <div key={index} className="swiper-slide secNavBar-swper tabActive" onClick={this.tabsHandleChange.bind(this, index)}>
                                                {item.Title}
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div key={index} className={`swiper-slide secNavBar-swper ${this.state.tabActive === item.Tag && "tabActive"}`} onClick={this.tabsHandleChange.bind(this, index)}>
                                                {item.Title}
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                        <div className="swiper-button-next swiper-button-next-gametabs"></div>
                        <div className="swiper-button-prev swiper-button-prev-gametabs"></div>
                    </div>
                </div>
            )
        }
        return null
    }
    render() {
        const {hide} = this.props;
        return (
            <div className="GameTabs" style={hide?{"display":"none"}:{}}>
                {
                    this.renderNavList()
                }
            </div>
        );
    }
}

const mapStateToProps = (state: any, ownProps: any) => (
    {
        gameType: state.gameTabs
    }
);
export default connect(mapStateToProps)(GameTabs)