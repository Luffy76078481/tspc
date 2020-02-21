import React from "react";
import { connect } from "react-redux";
import BaseClass from "@/baseClass";
import { withRouter, NavLink, Link } from "react-router-dom";
import Swiper from "swiper";
import { serversOpen, toPlayGame } from "tollPlugin/commonFun";
import { message } from 'antd';
import "swiper/dist/css/swiper.min.css";
import "./NavBar.scss"

class NavBar extends BaseClass {
    public navList: number[] = [];//有二级的导航集合
    public hide = true;
    public timeInterval: any;
    public state = {
        activeIndex: -1,
        mainNav: [],
        time: this.nowTime(),
        username: "",
        password: "",
    }

    static getDerivedStateFromProps(props: any, state: any) {
        if (props.mainNav.length !== state.mainNav.length) {
            return {
                mainNav: props.mainNav
            }
        }
        return null;
    }

    componentDidUpdate(pevProps: any, pevState: any) {
        if (pevState.mainNav.length !== this.props.mainNav.length) {
            setTimeout(() => {
                this.init();
            }, 800);
        }

    }

    componentDidMount() {
        this.timeInterval = window.setInterval(() => {
            this.setState({ time: this.nowTime() })
        }, 1000);
        setTimeout(() => {
            this.init();
        }, 800);
    }

    componentWillUnmount() {
        clearInterval(this.timeInterval);
    }

    nowTime() {
        let d = new Date();
        let dt = d.getTime();
        // dt = dt + (d.getTimezoneOffset() - 4 * 60) * 60 * 1000
        return new Date(dt).toLocaleString('chinese', { hour12: false }).split('/').join('-');
    }


    init() {
        let swipList: any = document.getElementsByClassName("initSwiper");
        for (let i = 0; i < swipList.length; i++) {
            //官方要求绑定事件必须是display不能隐藏才能成功绑定，所以初次下策
            swipList[i].style.display = "block";
        }
        new Swiper('.initSwiper', {
            slidesPerView: 6,
            spaceBetween: 0,
            navigation: {
                nextEl: '.swiper-button-next-navbar',
                prevEl: '.swiper-button-prev-navbar',
            },
        });
        for (let i = 0; i < swipList.length; i++) {
            //绑定好后再恢复隐藏
            swipList[i].style.display = "none";
        }
    }
    serversOpen() {
        serversOpen(this.props.remoteSysConfs.online_service_link);
    }
    render() {
        return (
            <div className="NavBar">
                <div className="navTop">
                    <div className="navTopCon">
                        <span className="timezon">GMT-8&nbsp;&nbsp;{this.state.time}</span>
                        <Link className="goHome tophover" to={"/Home"}>网站首页</Link>
                        
                        <span className="tophover" onClick={this.serversOpen.bind(this)}>｜在线客服</span>
                        {this.props.user.Token ? this.renderUserInfo() : this.renderLoginForm()}
                    </div>
                </div>
                <div className="navCen">
                    <div className="navCenCon">
                        {this.renderNav()}
                    </div>
                    <div className="navBarBox"
                        style={{ bottom: this.state.activeIndex === -1 ? "300px" : "-300px" }}
                        onMouseEnter={() => { this.hide = false }}
                        onMouseLeave={() => { this.hide = true; this.mainNavLeave() }}
                    >
                        {this.renderNavBar()}
                    </div>
                </div>
            </div >
        );
    }

    renderLoginForm() {
        return (
            <form className="login-form" onSubmit={this.onLogin.bind(this)}>
                <input className='userName' value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }) }} type='text' placeholder='用户名' />
                <input className='password' value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }} type='password' placeholder='密码' />
                <span onClick={() => { this.serversOpen() }} className="forget">忘记?</span>
                <button>登录</button>
                <Link to='/Home/LoginRegist/reg' className='form-reg'>注册</Link>
            </form>
        );
    }

    //登录API
    onLogin(event: any) {
        event.preventDefault();
        if (!this.state.username || !this.state.password) {
            return message.error("用户名和明码不能为空", 1);
        }
        let mesload = message.loading("登录中", 0);
        new window.actions.ApiLoginAction(this.state.username, this.state.password).fly((resp: any) => {
            mesload();
            if (resp.StatusCode === 0) {
                new window.actions.LoginAfterInit()//登陆后初始化接口
                message.success("登录成功", 1);
            } else {
                message.error(resp.Message, 1);
            }
        });
    }

    renderUserInfo() {
        return (
            <div className="userInfo">
                <span>欢迎您, </span>
                <Link to="/myCenter/userInfo">{this.props.user.UserName}&nbsp;&nbsp;｜&nbsp;&nbsp;</Link>
                <Link to="/member">钱包:<span className="headMoney">{this.props.user.amount}</span>元</Link>
                <Link to="/myCenter/deposit">存款</Link>
                <Link to="/myCenter/withdraw">取款</Link>
                <Link to="/myCenter/transfer">转账&nbsp;&nbsp;｜&nbsp;&nbsp;</Link>
                <Link to="/myCenter/news">消息</Link>
                <span className="loginOut" onClick={this.onLogout.bind(this)}>退出登录</span>
            </div>
        )
    }

    onLogout() {

        new window.actions.LogoutAction().fly();
        setTimeout(() => {
            this.props.history.push("/");
        }, 300);
    }

    renderNav() {
        let mainNav = this.props.mainNav;
        let mainNavDom = [];
        let logoIndex = parseInt(mainNav.length / 2 + "")
        for (let i = 0; i < mainNav.length; i++) {
            let mainNavData = mainNav[i];
            if (i === logoIndex) {
                mainNavDom.push(
                    <NavLink
                        key={"homeLogo" + i}
                        to={"/Home"}
                    >
                        <img className="navLogo" src={window.config.devImgUrl + this.props.logo} alt="后期取接口的图片" />
                    </NavLink>
                );
            }
            if((mainNavData.Tag==="mobile"||mainNavData.Title.includes('手机')) && !mainNavData.GotoUrl){
                mainNavDom.push(
                    <a
                        key={i}
                        href={this.props.remoteSysConfs.channel_push_url}
                        rel="noopener noreferrer" target="_blank"
                    >
                        <span>{mainNavData.Title}</span>
                        <i className="icon iconfont iconjiantou"></i>
                        <div className="bord"></div>
                    </a>
                );
            }else if(mainNavData.Title.includes('客服')||mainNavData.Tag.includes('service')){
                mainNavDom.push(
                    <a
                        key={i}
                        onClick={() => { this.serversOpen() }}
                    >
                        <span>{mainNavData.Title}</span>
                        <i className="icon iconfont iconjiantou"></i>
                        <div className="bord"></div>
                    </a>
                );            
            }else{
                mainNavDom.push(
                    <NavLink
                        key={i}
                        to={mainNavData.GotoUrl}
                        onMouseEnter={this.mainNavHover.bind(this, i)}
                        onMouseLeave={() => { this.hide = true; this.mainNavLeave() }}
                    >
                        <span>{mainNavData.Title}</span>
                        <i className="icon iconfont iconjiantou"></i>
                        <div className="bord"></div>
                    </NavLink>
                );               
            } 
        }
        return mainNavDom;
    }

    mainNavHover(index: number) {
        if (this.navList.indexOf(index) !== -1) {
            this.hide = false
            this.setState({
                activeIndex: index
            })
        }
    }

    mainNavLeave() {
        setTimeout(() => {
            if (this.hide) {
                this.setState({
                    activeIndex: -1
                });
            }
        }, 1);
    }


    renderNavBar() {
        this.navList = [];
        let mainNav = this.props.mainNav;
        let navBarDom = [];
        for (let i = 0; i < mainNav.length; i++) {
            if(mainNav[i].Tag === "eSport" || mainNav[i].Tag === "fish"){//电竞和捕鱼暂时不需要二级导航
                continue;
            }
            //真人和捕鱼直接进入游戏
            if ((mainNav[i].Tag === "casino" || mainNav[i].Tag === "fish" || mainNav[i].Tag === "bingo" || mainNav[i].Tag === "chess") && mainNav[i].Games) {
                //如果存在二级导航就保存下标为显示做准备;
                this.navList.push(i);
                if (mainNav[i].Games.length < 7) {
                    navBarDom.push(//循环二级导航
                        <div key={i} className="secNavBarBox" style={{ display: this.state.activeIndex === i ? "flex" : "none" }}>
                            {
                                mainNav[i].Games.map((data: any, index: number) => {
                                    return (
                                        <div key={index} className="secNavBar" onClick={this.playGame.bind(this, data)}>
                                            <img src={window.config.devImgUrl + data.ImageUrl} alt="" />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                } else {
                    navBarDom.push(//循环SWIPER二级导航
                        <div key={i} className="secNavBarBox swiper-container initSwiper" style={{ display: this.state.activeIndex === i ? "block" : "none" }}>
                            <div className="swiper-wrapper">
                                {
                                    mainNav[i].Games.map((data: any, index: number) => {
                                        return (
                                            <div key={index} className="swiper-slide secNavBar-swper" onClick={this.playGame.bind(this, data)}>
                                                <img src={window.config.devImgUrl + data.ImageUrl} alt="" />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="swiper-button-next swiper-button-next-navbar"></div>
                            <div className="swiper-button-prev swiper-button-prev-navbar"></div>
                        </div>
                    )
                }
            } else if (mainNav[i].Data && mainNav[i].Data.length > 0) {
                //如果存在二级导航就保存下标为显示做准备;
                this.navList.push(i);
                if (mainNav[i].Data.length < 7) {
                    navBarDom.push(//循环二级导航
                        <div key={i} className="secNavBarBox" style={{ display: this.state.activeIndex === i ? "flex" : "none" }}>
                            {
                                mainNav[i].Data.map((data: any, index: number) => {
                                    return (
                                        <div key={index} className="secNavBar" onClick={this.goGamePage.bind(this, data)}>
                                            <img src={window.config.devImgUrl + data.BackgroundImgUrl} alt="" />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                } else {
                    navBarDom.push(//循环SWIPER二级导航
                        <div key={i} className="secNavBarBox swiper-container initSwiper" style={{ display: this.state.activeIndex === i ? "block" : "none" }}>
                            <div className="swiper-wrapper">
                                {
                                    mainNav[i].Data.map((data: any, index: number) => {
                                        return (
                                            <div key={index} className="swiper-slide secNavBar-swper" onClick={this.goGamePage.bind(this, data)}>
                                                <img src={window.config.devImgUrl + data.BackgroundImgUrl} alt="" />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="swiper-button-next swiper-button-next-navbar"></div>
                            <div className="swiper-button-prev swiper-button-prev-navbar"></div>
                        </div>
                    )
                }
            }
        }
        return navBarDom;
    }

    playGame(gameParame: any) {//直接进入游戏
        toPlayGame(this, gameParame);
    }

    goGamePage(tag: any) {//进入游戏页面
        this.props.history.push(tag.GotoUrl);
        window.actions.ChangeGameTabs({
            pram:tag.Tag,
        })
    }


}

const mapStateToProps = (state: any, ownProps: any) => ({
    mainNav: state.gameLayout.mainNav,
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
    platforms: state.game.platforms,
    logo: state.imagesConfig.PCLogo,
});

export default withRouter(connect(mapStateToProps)(NavBar));
