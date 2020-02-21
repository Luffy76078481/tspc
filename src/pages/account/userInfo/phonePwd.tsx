import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { Modal,message } from 'antd';
let phoneCodeTimeInter:any;// 验证码倒计时-定时器

class PhonePwd extends BaseClass {
  constructor(props: any) {
      super(props, [])
      this.state={
        code:"",
        phoneSubmitFlag:true,
        phoneVerifyClickFlag:true,
        sendPhoneVerifyButtonMes:"获取验证码" as number|string       
      }
  }
  changeUserInfo(e:any){
    e.preventDefault();
    if(!this.state.phoneSubmitFlag)return
    this.setState({
      phoneSubmitFlag:false
    })
    let code = this.state.code;
    if(!code){
      Modal.warning({
        title: '温馨提示',
        content: '未输入验证码，请输入验证码！',
        okText: "确定",
      });     
      return    
    } 
    new window.actions.ApiValidatePhoneAction(this.props.user.phone,code).fly((res:any)=>{
      this.setState({
        phoneSubmitFlag:true
      })
      if(res.StatusCode === 0){
          new window.actions.ApiPlayerInfoAction().fly();
          Modal.success({
            title:"温馨提示",
            content:"您的手机号码验证成功，您已可以进行提款操作！",
            okText: "确定",
          })
      }else{
        Modal.error({
          title:"错误提示",
          content:res.Message,
          okText: "确定",
        });
      }
    })
  }
  getPhoneCode(){
    if(phoneCodeTimeInter)clearInterval(phoneCodeTimeInter);
    new window.actions.ApiSendMobileVCodeAction().fly((resp:any)=>{
      if(resp.StatusCode === 0){   
        message.success({
          content:"发送成功，请注意查收",
          duration:2,
        })    
        this.setState({
          sendPhoneVerifyButtonMes:60,
        },()=>{
          phoneCodeTimeInter = setInterval(()=>{
            if(this.state.sendPhoneVerifyButtonMes===1){
                this.setState({
                  sendPhoneVerifyButtonMes:"获取验证码",
                  phoneVerifyClickFlag:true,
                })
                clearInterval(phoneCodeTimeInter);
                return;
            }else{
              this.setState({
                sendPhoneVerifyButtonMes:+this.state.sendPhoneVerifyButtonMes-1
              })             
            }
          },1000)            
        })   
      }else{
        message.error({
          content:resp.Message,
          duration:2,
        })        
        this.setState({
          phoneVerifyClickFlag:true
        })
      }         
    })
  }
  changeCode(e:any){
    this.setState({
      code:e.target.value
    })
  }
  changePhone(e:any){
    this.setState({
      phoneNum:e.target.value
    })   
  }
  render() {
    return (
      <div className='Personal'>
        {
          this.props.user.phone?
          (
            this.props.user.verfyPhone?
            <p className='infoNotice'>* 您的手机号码{this.props.user.phone}已验证</p>:
            <form onSubmit = {this.changeUserInfo.bind(this)}>
              <div>
                <label>手机号码：</label>
                <div>
                  <input type="number" maxLength={11} defaultValue={this.props.user.phone} readOnly/>
                </div>
              </div>
              <div>
                <label>验证码</label>
                <div>
                  <input type="text" className='code' onChange={this.changeCode.bind(this)}/>
                  <span className='get' onClick={this.getPhoneCode.bind(this)}>{this.state.sendPhoneVerifyButtonMes}</span>
                </div>                
              </div>
              <div>
                <button className='Preservation'>保存</button>
              </div>
            </form>            
          )
          :
          <p className='infoNotice'>* 您未绑定手机号码，请先绑定手机号码后再进行验证！</p>          
        }
      </div>
    );
  }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(PhonePwd));
