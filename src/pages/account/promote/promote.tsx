import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import "./promote.scss"
import {copyCode} from 'tollPlugin/commonFun'
const QRCode = require('qrcode.react');



class promote extends BaseClass {
    public state = {

    }
    constructor(props:any) {
        super(props,[])
    }
    
    
    render() {
        return (
            <div className="promote">
                <h2>推广链接</h2>
                <QRCode includeMargin={true} size={150} value={this.props.user.recommendCode?window.location.protocol+"//"+window.location.hostname+"/Home/LoginRegist/reg?channel="+this.props.user.recommendCode:"无"} className="qrImg" />
                <div className='promoteContent'>
                  <div>
                      <label className='extensionUrl'>推广链接</label>
                      <div className='extensionUrl'>
                        <input id='copyDom' 
                        defaultValue={
                            this.props.user.recommendCode?
                            window.location.protocol+"//"+window.location.hostname+"/Home/LoginRegist/reg?channel="+this.props.user.recommendCode:"无"}></input>
                    </div>
                      <button className='Preservation' onClick={()=>copyCode('copyDom')}>复制</button>
                  </div>
                </div>
                {/* <QRCode includeMargin={true} size={150} value={this.props.user.recommendCode?window.location.protocol+"//"+window.location.hostname+"/Home/LoginRegist/reg?channel="+this.props.user.recommendCode:"无"} className="qrImg" /> */}
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
  user: state.user
});

export default withRouter(connect(mapStateToProps)(promote));
