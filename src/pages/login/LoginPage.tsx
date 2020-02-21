import React from "react";
import { connect } from "react-redux";
import { withRouter, Link } from 'react-router-dom';
import { serversOpen, setSession } from "tollPlugin/commonFun";
import { PassWord } from "components/pui/Pui";
import BaseClass from '@/baseClass';
import { message, Checkbox, DatePicker, Modal } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import "./LoginPage.scss";

interface State {
    username: string,
    password: string,
    Fields: any,
    inpActive: string,
    comObj: any,
    reqKeyList: string[],
    getLock: boolean,
    AuthCode: string
}
class LoginPage extends BaseClass {
    public state: State = {
        username: "",
        password: "",
        Fields: [],//接口返回需要输入的信息
        inpActive: "",//当前用户点击的框，给提示用
        comObj: {//提交注册的参数
            IsReceiveEmail: true,//需要收到emall默认选中
            IsReceiveSMS: true,//需要收到短信默认选中
            WithdrawalPassword: "0000",//取款密码默认四个0
            WebSite: ""
        },
        reqKeyList: [],//必填并且需要效验的参数,
        getLock: false,//防止重复获取验证码
        AuthCode: "",//验证码图片地址
    }
    constructor(props: any) {
        super(props, [])
    }

    componentDidMount() {
        if (this.props.history.location.pathname === "/Home/LoginRegist/reg") {
            new window.actions.ApiGetRegistrySettingAction().fly((resp: any) => {
                this.setState({
                    Fields: resp.Fields
                })
            });
            this.getAuthCode();
            let isAutoLogin = window.location.search;//如果是代理落地页注册过来的直接填入代理号
            if (isAutoLogin.indexOf('channel') > 0) {
                setSession('channel', isAutoLogin.split('=')[1]);
                this.setState({
                    comObj: {
                        ...this.state.comObj,
                        WebSite: sessionStorage.getItem("channel")
                    }
                })
            }
        }

    }

    render() {
        return (
            <div className="LoginPage">
                <video autoPlay loop>
                    <source src={require("./images/img_bg.mp4")} type="video/mp4" />
                </video>
                <div className="loginBox">
                    <div className="topText"></div>
                    <Link to={"/Home"} className="topLogo" style={{ "background": 'url("./images/_thumb_15140.png") 0 0/100% 100% no-repeat' }}>
                        <img src={require("./images/_thumb_15140.png")} alt=""/>
                        <img src={require("./images/_thumb_15143.png")} alt=""/>
                    </Link>
                    {
                        this.props.history.location.pathname === "/Login" ?
                            <ul className="inputBox">
                                <li>
                                    <i className="icon iconfont iconicon" />
                                    <input value={this.state.username} onChange={(e) => { this.setState({ username: e.target.value }) }} type='text' placeholder='用户名' />
                                </li>
                                <li>
                                    <i className="icon iconfont iconmimaffffffpx" />
                                    <input value={this.state.password} onChange={(e) => { this.setState({ password: e.target.value }) }} type='password' placeholder='密码' />
                                </li>
                                <li>
                                    <button onClick={this.onLogin.bind(this)}>登录</button>
                                </li>
                                <li>
                                    <span onClick={() => { this.serversOpen() }} className="forget">忘记密码?</span>
                                    <Link to='/Home/LoginRegist/reg' className='form-reg'>注册账号</Link>
                                </li>
                            </ul>
                            :
                            this.runRegister()
                    }

                </div>
            </div>
        );
    }

    serversOpen() {
        serversOpen(this.props.remoteSysConfs.online_service_link);
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
                this.props.history.push("/Money")
            } else {
                message.error(resp.Message, 1);
            }
        });
    }


    runRegister() {
        interface InpData {
            Field: string,
            Required: boolean,
        }
        let isRequired = (required: boolean, key: string) => {//是否必填处理
            if (required) {//必填
                this.state.reqKeyList = [...new Set([...this.state.reqKeyList, key])];
            }
        }
        let inputList = [];
        for (let i = 0; i < this.state.Fields.length; i++) {
            let inpData: InpData = this.state.Fields[i];
            switch (inpData.Field) {
                case "UserName"://用户名
                    isRequired(inpData.Required, "UserName")
                    inputList.push(
                        <li key="username">
                            <i className="icon iconfont iconicon" />
                            <input id="demo1" type="text" placeholder="用户名" maxLength={12}
                                onFocus={() => { this.setState({ inpActive: "UserName" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "UserName")}
                            />
                            <div style={{ "display": `${this.state.inpActive === "UserName" ? "block" : "none"}` }}>
                                <span className="iconFont">用户名必须是6-12位的字母或数字</span>
                            </div>
                        </li>

                    )
                    break;
                case "TrueName"://真实姓名
                    isRequired(inpData.Required, "TrueName")
                    inputList.push(
                        <li key="TrueName">
                            <i className="icon iconfont iconicon" />
                            <input type="text" placeholder="真实姓名" maxLength={40}
                                onFocus={() => { this.setState({ inpActive: "TrueName" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "TrueName")}
                            />
                            <div style={{ "display": `${this.state.inpActive === "TrueName" ? "block" : "none"}` }}>
                                <span className="iconFont">必须是非数字真实姓名</span>
                            </div>
                        </li>
                    )
                    break;

                case "Password"://密码
                    isRequired(inpData.Required, "Password")
                    inputList.push(
                        <li key="Password">
                            <i className="icon iconfont iconmimaffffffpx" />
                            <input type="password" placeholder="密码"
                                onFocus={() => { this.setState({ inpActive: "Password" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "Password")}
                            />
                            <div style={{ "display": `${this.state.inpActive === "Password" ? "block" : "none"}` }}>
                                <span className="iconFont">请输入6-12为数字和字母</span>
                            </div>
                        </li>
                    )
                    break;
                case "Password2"://再次密码
                    isRequired(inpData.Required, "Password2")
                    inputList.push(
                        <li key="Password2">
                            <i className="icon iconfont icon-mima iconmimaffffffpx" />
                            <input type="password" placeholder="密码"
                                onFocus={() => { this.setState({ inpActive: "Password2" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "Password2")}
                            />
                            <div className="conslo" style={{ "display": `${this.state.inpActive === "Password2" ? "block" : "none"}` }}>
                                <span className="iconFont">请再次输入密码</span>
                            </div>
                        </li>
                    )
                    break;
                case "WithdrawalPassword"://取款密码
                    isRequired(inpData.Required, "WithdrawalPassword")
                    inputList.push(
                        <li key="WithdrawalPassword">
                            <i className="icon iconfont icon-mima iconmimaffffffpx" />
                            <PassWord
                                defaultVal={[0, 0, 0, 0]}
                                getVal={(val: string) => {
                                    this.setState({
                                        comObj: {
                                            ...this.state.comObj,
                                            WithdrawalPassword: val
                                        }
                                    })
                                }} />
                        </li>

                    )
                    break;
                case "Phone"://手机
                    isRequired(inpData.Required, "Phone")
                    inputList.push(
                        <li key="Phone" >
                            <i className="icon iconfont icon-mima iconshoujihaomaguizheng" />
                            <input type="number" placeholder="手机号" onInput={this.imposeLenth.bind(this,11)}
                                onFocus={() => { this.setState({ inpActive: "Phone" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "Phone")}
                            />
                        </li>
                    )
                    break;
                case "ExtendCode":
                    isRequired(inpData.Required, "ExtendCode")
                    var channel = sessionStorage.getItem('channel') || "";
                    inputList.push(
                        <li key="ExtendCode">
                            <i className="icon iconfont icon-mima iconshoujihaomaguizheng" />
                            {channel ?
                                <input type="text" value={this.state.comObj.WebSite} readOnly />
                                :
                                <input type="text" placeholder="请输入推广码(可不填写)"
                                    onFocus={() => { this.setState({ inpActive: "ExtendCode" }) }}
                                    onBlur={() => { this.setState({ inpActive: "" }) }}
                                    onChange={this.inputVal.bind(this, "ExtendCode")}
                                />
                            }
                        </li>
                    );
                    break;
                case "AuthCode"://验证码
                    isRequired(inpData.Required, "AuthCode")
                    inputList.push(
                        <li key="AuthCode">
                            <i className="icon iconfont icon-gengduo iconverify-fill" />
                            <input type="text" maxLength={4} placeholder="验证码"
                                onFocus={() => { this.setState({ inpActive: "AuthCode" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "AuthCode")}
                            />
                            <img className="AuthCode" onClick={this.getAuthCode.bind(this, true)} src={this.state.AuthCode} alt="验证码" />
                        </li>
                    )
                    break;
                case "Email"://邮箱
                    isRequired(inpData.Required, "Email")
                    inputList.push(
                        <li key="Email">
                            <i className="icon iconfont icon-youxiang iconyouxiang" />
                            <input type="text" placeholder="电子邮箱"
                                onFocus={() => { this.setState({ inpActive: "Email" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "Email")}
                            />
                        </li>
                    )
                    break;
                case "QQ"://
                    isRequired(inpData.Required, "QQ")
                    inputList.push(
                        <li key="QQ" >
                            <i className="icon iconfont icon-qq1 iconicon1" />
                            <input type="number" placeholder="QQ号码" onInput={this.imposeLenth.bind(this,19)}
                                onFocus={() => { this.setState({ inpActive: "QQ" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "QQ")}
                            />
                        </li>
                    )
                    break;
                case "Wechat"://微信
                    isRequired(inpData.Required, "Wechat")
                    inputList.push(
                        <li key="Wechat">
                            <i className="icon iconfont icon-weixin iconweixin" />
                            <input type="text" placeholder="微信" maxLength={25}
                                onFocus={() => { this.setState({ inpActive: "Wechat" }) }}
                                onBlur={() => { this.setState({ inpActive: "" }) }}
                                onChange={this.inputVal.bind(this, "Wechat")}
                            />
                        </li>
                    )
                    break;
                case "Birthday"://生日
                    isRequired(inpData.Required, "Birthday")
                    inputList.push(
                        <li key="Birthday">
                            <i className="icon iconfont icon-weixin iconbirthday-reminder" />
                            <DatePicker locale={locale} onChange={this.dateChange.bind(this, 'Birthday')} />
                        </li>
                    )
                    break;
                case "IsReceiveEmail"://愿意收邮件单选框
                    isRequired(inpData.Required, "IsReceiveEmail")
                    inputList.push(
                        <li key="IsReceiveEmail">
                            <Checkbox onChange={this.chexboxChange.bind(this, 'IsReceiveEmail')}>是的，我想收到{window.config.appName}的邮件消息</Checkbox>
                        </li>
                    )


                    break;
                case "IsReceiveSMS"://愿意收短信
                    isRequired(inpData.Required, "IsReceiveSMS")
                    inputList.push(
                        <li key="IsReceiveSMS">
                            <Checkbox onChange={this.chexboxChange.bind(this, 'IsReceiveSMS')}>是的，我想收到{window.config.appName}的短信消息</Checkbox>
                        </li>
                    )
                    break;

            }

        }
        return (
            <ul className="inputBox">
                {inputList}
                <li style={{ marginBottom: "0" }}>
                    <button onClick={this.regist.bind(this)}>注册</button>
                </li>
                <li>
                    <Link to='/Login'>已有账号?请登录</Link>
                </li>
            </ul>
        )
    }

    imposeLenth(len: number,e:any) {
        if (e.target.value.length > len) e.target.value = e.target.value.slice(0, len)
    }


    inputVal(key: string, e: any) {
        this.setState({
            comObj: {
                ...this.state.comObj,
                [key]: e.target.value
            }
        })
    }

    getAuthCode() {//获取验证码
        if (this.state.getLock) return;
        this.state.getLock = true;
        new window.actions.ApiAuthCodeAction().fly((resp: any) => {
            if (resp.StatusCode === 0) {
                this.setState({
                    AuthCode: resp.AuthImg,
                    comObj: {
                        ...this.state.comObj,
                        AuthToken: resp.AuthToken
                    }
                })
            }
            this.state.getLock = false;
        })

    }

    chexboxChange(key: string, e: any) {
        this.setState({
            commitVal: Object.assign(this.state.comObj, {
                [key]: e.target.checked
            })
        });
    }

    dateChange(key: string, date: any, dateString: any) {
        this.setState({
            commitVal: Object.assign(this.state.comObj, {
                [key]: dateString
            })
        });
    }

    erroAelrt(text: string) {
        Modal.destroyAll();
        Modal.error({
            title: '注册失败',
            content: text,
            okText: "确定"
        });
    }


    regist() {
        for (let i = 0; i < this.state.reqKeyList.length; i++) {//必填选项验证不为空
            if (!!!this.state.comObj[this.state.reqKeyList[i]]) {
                this.erroAelrt('请您填写完整信息');
                return;
            }
        }
        let obj = this.state.comObj
        for (const key in obj) {//提交参数验证
            if (obj.hasOwnProperty(key)) {
                switch (key) {
                    case "UserName": {
                        const reg = /[\u4e00-\u9fa5]/g; //判断是中文
                        if (reg.test(obj[key])) {
                            this.erroAelrt('用户名不能是中文,只能是数字或字母');
                            return false;
                        } else if (obj[key].length < 6) {
                            this.erroAelrt('用户名必须是6-15位的字母或数字');
                            return false;
                        }
                        break;
                    }
                    case "TrueName": {
                        const reg = /^\+?[0-9][0-9]*$/; //判断不是数字
                        if (reg.test(obj[key])) {
                            this.erroAelrt('真实姓名必须是非数字');
                            return false;
                        }
                        break;
                    }
                    case "Password": {
                        if ('Password2' in obj) {//需要二次输入效验账号密码
                            if (obj[key] !== obj.Password2) {
                                this.erroAelrt('两次输入的登录密码不一致');
                                return false;
                            }
                        }
                        break;
                    }
                    case "WithdrawalPassword": {
                        if ('WithdrawalPassword2' in obj) {//需要二次输入效验取款密码
                            if (obj[key] !== obj.WithdrawalPassword2) {
                                this.erroAelrt('两次输入的取款密码不一致');
                                return false;
                            }
                        }
                        break;
                    }
                    case "Phone": {
                        const reg = /^1[1-9][0-9]\d{4,8}$/; //判断电话
                        if (!reg.test(obj[key])) {
                            this.erroAelrt('手机号码格式有误');
                            return false;
                        }
                        break;
                    }


                }

            }
        }

        new window.actions.ApiSignUpAction(this.state.comObj).fly((respond: any) => {
            if (respond.StatusCode === 0) {
                new window.actions.LoginAfterInit();
                this.props.history.push("/Money");
            } else {
                if (respond.StatusCode === 512) {//验证码过期
                    this.getAuthCode();
                } else {
                    this.erroAelrt(respond.Message);
                }
            }
        });
    }



}


const mapStateToProps = (state: any, ownProps: any) => ({
    remoteSysConfs: state.remoteSysConfs,
    logo: state.imagesConfig.PCLogo
});

export default withRouter(connect(mapStateToProps)(LoginPage));
