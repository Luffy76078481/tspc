import React from "react";
import { connect } from "react-redux";
import { withRouter, Link } from 'react-router-dom';
import BaseClass from '@/baseClass';
import LC from "@/LC"
import NoticeBar from "components/noticeBar/NoticeBar"
import "./HomePage.scss";


const QRCode = require('qrcode.react');
class HomePage extends BaseClass {
    public state = {
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        phoneUrl: window.location.origin + '/m',
        gameData: "" as any
    }
    public needAni = true
    public homePage: any;
    constructor(props: any) {
        super(props, [])
    }


    componentDidMount() {
        this.homePage = document.getElementById("content") as any;
        this.homePage.addEventListener('scroll', this.handleScroll.bind(this))
        if (!this.props.homeGameData) {//获取赛事信息
            new window.actions.ApiNoticeAction("today").fly((res: any) => { }, "homeGameData")
        }
    }

    static getDerivedStateFromProps(props: any, state: any) {
        if (props.homeGameData && !state.gameData) {
            return {
                gameData: props.homeGameData
            }
        }
        return null;
    }

    handleScroll(e: any) {
        //滚动条高度...
        let scrollTop = e.target.scrollTop;  //滚动条滚动高度
        if (scrollTop > 2000 && this.needAni) {
            this.needAni = false;
            for (let index = 0; index < 61; index++) {
                setTimeout(() => {
                    this.setState({
                        a: index
                    })
                }, (10 + index / 2) * index)
            }
            for (let index = 0; index < 80; index++) {
                setTimeout(() => {
                    this.setState({
                        b: index
                    })
                }, (10 + index / 2) * index)
            }
            for (let index = 0; index < 90; index++) {
                setTimeout(() => {
                    this.setState({
                        c: index
                    })
                }, (10 + index / 2) * index)
            }
            for (let index = 0; index < 51; index++) {
                setTimeout(() => {
                    this.setState({
                        d: index
                    })
                }, (10 + index / 2) * index)
            }
        }

    }

    runGame() {
        if (this.state.gameData[0] && this.state.gameData[0].Content) {
            let gameEle = [];
            let oriData = this.state.gameData[0].Content.replace(/<[^>]+>/g, "");
            oriData = oriData.replace(/amp;/g, "");
            oriData = oriData.replace(/<\/?.+?>/g, "");
            oriData = oriData.replace(/[\r\n]/g, "");
            oriData = oriData.split("&");
            for (let index = 0; index < oriData.length; index++) {
                const elementData = oriData[index];
                const SD = elementData.split("#");
                gameEle.push(
                    <div className="gameContent" key={index}>
                        <p className="gcGameName">{SD[1]}</p>
                        <span>{SD[0]}</span>
                        <div className="gcVSbox">
                            <div className="vsL">{SD[2]}</div>
                            <div className="vsR">{SD[3]}</div>
                        </div>
                        <p className='goBetting' onClick={() => { this.props.history.push('/sport') }}>进入投注</p>
                    </div>
                )
            }
            return gameEle;
        }

        return <div></div>
    }
    render() {
        return (
            <div className="HomePage" ref="homepage">
                <LC comKey="Carousel" />
                <NoticeBar />
                <div className="homeBody">
                    <div className="gameDataBox">
                        {this.runGame()}
                    </div>
                    <div className="sportBox">
                        <div className="leftImg"></div>
                        <div className="box">
                            <h1>掌上更直观 玩法更齐全</h1>
                            <h3>立即下载AG体育APP</h3>
                            <div className='btns'>
                                <button onClick={()=>{window.open(this.props.remoteSysConfs.channel_push_url)}}>下载AG体育APP</button>
                            </div>
                            <div className='boxContent'>
                                <div className='boxText'>
                                    <p>业内赔率最高！覆盖世界各地赛事,让球、大小、半全场、波胆、单双、</p>
                                    <p>总入球、连串过关等多元竞猜。更有动画直播、视频直播，让您体验轻</p>
                                    <p>松聊球，娱乐投注两不误 。</p>
                                </div>
                                <div className='boxQrcode'>
                                    <div className='box1'>
                                        <div className='boxImg'>
                                            <QRCode className="qrImg"
                                                size={133}  //二维码大小
                                                value={this.props.remoteSysConfs.channel_push_url || ""} //地址
                                            />
                                            <p>扫码下载APP</p>
                                            <span>支持iOS & Android 全部移动设备</span>
                                            <a href={this.props.remoteSysConfs.channel_push_url} target={"_blank"}>{this.props.remoteSysConfs.channel_push_url}</a>
                                        </div>
                                        <div className='boxImg'>
                                            <div className='img'></div>
                                            <p>无需下载直接访问</p>
                                            <span>无需下载，手机输入网址即可访问</span>
                                            <a href={this.state.phoneUrl} target={"_blank"}>{this.state.phoneUrl}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='sportBox'>
                        <div className='box'>
                            <h1>AG电竞 热门竞技一网打尽</h1>
                            <h3>赛事齐全 实时数据 玩法多样</h3>
                            <div className='btns'>
                                <button onClick={() => { this.props.history.push('/eSport') }}>立即下注</button>
                            </div>
                            <div className='boxContent'>
                                <div className='boxText'>
                                    <p>AG电竞上线以来就与多项国家级大型电子竞技赛事及赛事厂商达成了合作。为</p>
                                    <p>电子竞技赛事更好地运营与进行进行提供助力的同时也收获了良好的运营口碑。</p>
                                </div>
                                <div className='boxGame'></div>
                            </div>

                        </div>
                        <div className='rightImg'></div>
                    </div>
                    <div className='gameBox'>
                        <Link to='/sport'><div className='boxGameImg'><div className='boxGameImage boxImage1'></div></div></Link>
                        <Link to='/eSport'><div className='boxGameImg'><div className='boxGameImage boxImage7'></div></div></Link>
                        <Link to='/streetMachine'><div className='boxGameImg'><div className='boxGameImage boxImage2'></div></div></Link>
                        <Link to='/casino'><div className='boxGameImg'><div className='boxGameImage boxImage3'></div></div></Link>
                        <Link to='/fish'><div className='boxGameImg'><div className='boxGameImage boxImage4'></div></div></Link>
                        <Link to='/games'><div className='boxGameImg'><div className='boxGameImage boxImage5'></div></div></Link>
                        <Link to='/bingo'><div className='boxGameImg'><div className='boxGameImage boxImage6'></div></div></Link>
                    </div>
                    <div className='numBox'>
                        <div className='footBoxContent'>
                            <h1>用户至上 转制为您</h1>
                            <h3>AG体育平台为您提供最优质的服务</h3>
                        </div>
                        <div className='footBoxContent'>
                            <ul>
                                <li>
                                    <div className='boxNumBg'>
                                        <div>
                                            <span className='timeA'>{this.state.a}</span>
                                            <span className='timeB'>秒</span>
                                        </div>
                                        <img alt="timeout" src={require('./images/img_buletime.png.webp')} />
                                        <div className='aaa'>
                                            <div className='bbb'>
                                                <div className='ccc'></div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className='boxTitle'>
                                        <h5>AGSPORTS</h5>
                                        <h5>ADVANTAGE</h5>
                                        <p>平均存款时间</p>
                                    </div>
                                </li>
                                <li>
                                    <div className='boxNumBg'>
                                        <div>
                                            <span className='timeA'>{this.state.b}</span>
                                            <span className='timeB'>家</span>
                                        </div>
                                        <img alt="timeout" src={require('./images/img_buletime.png.webp')} />
                                        <div className='aaa'>
                                            <div className='bbb b2'>
                                                <div className='ccc'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='boxTitle'>
                                        <h5>AGSPORTS</h5>
                                        <h5>ADVANTAGE</h5>
                                        <p>合作支付平台</p>
                                    </div>
                                </li>
                                <li>
                                    <div className='boxNumBg'>
                                        <div>
                                            <span className='timeA'>{this.state.c}</span>
                                            <span className='timeB'>秒</span>
                                        </div>
                                        <img alt="timeout" src={require('./images/img_buletime.png.webp')} />
                                        <div className='aaa'>
                                            <div className='bbb b3'>
                                                <div className='ccc'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='boxTitle'>
                                        <h5>AGSPORTS</h5>
                                        <h5>ADVANTAGE</h5>
                                        <p>平均取款时间</p>
                                    </div>
                                </li>
                                <li>
                                    <div className='boxNumBg'>
                                        <div>
                                            <span className='timeA'>{this.state.d}</span>
                                            <span className='timeB'>家</span>
                                        </div>
                                        <img alt="timeout" src={require('./images/img_buletime.png.webp')} />
                                        <div className='aaa'>
                                            <div className='bbb b4'>
                                                <div className='ccc'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='boxTitle'>
                                        <h5>AGSPORTS</h5>
                                        <h5>ADVANTAGE</h5>
                                        <p>合作游戏平台</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='bottomBox'>
                        <ul>
                            <li>
                                <img alt="timeout" src={require('./images/pb_icon.png.webp')}  />
                                <div className='bottomContent'>
                                    <span>更专业</span>
                                    <p>每天为您提供近千场精彩体育赛事，更有真人、彩票、电子游戏等多种娱乐方式 选择，让您拥有完美游戏体验。</p>
                                </div>
                            </li>
                            <li>
                                <img alt="timeout" src={require('./images/convenient_icon.png.webp')}  />
                                <div className='bottomContent'>
                                    <span>更安全</span>
                                    <p>独家开发，采用128位加密技术和严格的安全管理体系，客户资金得到最 完善的保障，让您全情尽享娱乐、赛事投注，无后顾之忧！</p>
                                </div>
                            </li>
                            <li>
                                <img alt="timeout" src={require('./images/security_icon1.png.webp')}  />
                                <div className='bottomContent'>
                                    <span>更便捷</span>
                                    <p>引领市场的卓越技术，自主研发了全套终端应用，让您畅享 Web、H5，更有 iOS、Android原生App，让您随时随地，娱乐投注随心所欲！7×24小时在线 客服提供最贴心、最优质的服务。</p>
                                </div>
                            </li>
                            <li>
                                <img alt="timeout" src={require('./images/icon_kuaijie.png.webp')} />
                                <div className='bottomContent'>
                                    <span>更快速</span>
                                    <p>最新技术自主研发的财务处理系统，真正做到极速存、取、转。独家网络优 化技术，为您提供一流的游戏体验，最大优化网络延迟。</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }



}


const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
    homeGameData: state.homeGameData
});

export default withRouter(connect(mapStateToProps)(HomePage));
