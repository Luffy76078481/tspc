import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import {AsteriskProcessing} from 'tollPlugin/commonFun'

class Personal extends BaseClass {
    constructor(props: any) {
        super(props, [])
    }
    render() {
        return (
            <div className='Personal'>
            <div>
                <label className='username'>姓名</label>
                <div className='username'>
                    <span>{AsteriskProcessing(this.props.user.realName,"")}</span>
                </div>
            </div>
            <div>
                <label className='birth'>出生日期</label>
                <div className='birth'>
                    <span>{
                    this.props.user.birthday?
                    this.props.user.birthday.substr(0,this.props.user.birthday.indexOf("T")):
                    "未填写"}</span>
                </div>
            </div>
            <div>
                <label className='qq'>QQ</label>
                <div className='qq'>
                    <span>{this.props.user.qq?AsteriskProcessing(this.props.user.qq,'qq'):"未填写"}</span>
                </div>
            </div>
            <div>
                <label className='wechat'>微信</label>
                <div className='wechat'>
                    <span>{this.props.user.weChat?AsteriskProcessing(this.props.user.weChat,""):"未填写"}</span>
                </div>
            </div>
            {/* <div>
                <label className='extensionUrl'>推广链接</label>
                <div className='extensionUrl'>
                    <input id='copyDom' 
                    defaultValue={
                        this.props.user.recommendCode?
                        window.location.protocol+"//"+window.location.hostname+"/Home/LoginRegist/reg?channel="+this.props.user.recommendCode:"无"}></input>
                </div>
                <button className='Preservation' onClick={()=>copyCode('copyDom')}>复制</button>
            </div> */}
        </div>
      );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(Personal));
