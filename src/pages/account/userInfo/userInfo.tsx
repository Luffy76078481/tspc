import React from "react";
import { connect } from "react-redux";
import { withRouter,NavLink,Route,Redirect, Switch} from 'react-router-dom';
import BaseClass from '@/baseClass';
import "./userInfo.scss"
import Personal from './personal'
import LoginPwd from './loginPwd'
import PhonePwd from './phonePwd'
import EmailPwd from './emailPwd'
import PayPwd from './payPwd'
import DataSupplement from "./dataSupplement"

class UserInfo extends BaseClass {
    constructor(props: any) {
        super(props, [])
    }
    render() {
        return (
            <div className="UserInfo">
                <div className='personalNav'>
                    <div>
                        <NavLink activeClassName='active' to="/myCenter/userInfo/personal">基本资料</NavLink>
                        <NavLink activeClassName='active' to="/myCenter/userInfo/DataSupplement">资料补充</NavLink>
                        <NavLink activeClassName='active' to="/myCenter/userInfo/loginPwd">密码管理</NavLink>
                        <NavLink activeClassName='active' to="/myCenter/userInfo/payPwd">支付密码</NavLink>
                        <NavLink activeClassName='active' to="/myCenter/userInfo/phonePwd">手机管理</NavLink>
                        <NavLink activeClassName='active' to="/myCenter/userInfo/emailPwd">邮箱管理</NavLink>
                    </div>
                </div>
                <div className='userWrap'>
                    <Switch>
                        <Route exact path="/*/*/personal" children={<Personal/>}></Route>   
                        <Route path="/*/*/loginPwd" children={<LoginPwd/>}></Route>   
                        <Route path="/*/*/payPwd" children={<PayPwd/>}></Route>   
                        <Route path="/*/*/phonePwd" children={<PhonePwd/>}></Route>   
                        <Route path="/*/*/emailPwd" children={<EmailPwd/>}></Route> 
                        <Route path="/*/*/DataSupplement" children={<DataSupplement/>}></Route> 
                        <Redirect from="/*/*" to="/*/userInfo/personal" />                        
                    </Switch>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(UserInfo));
