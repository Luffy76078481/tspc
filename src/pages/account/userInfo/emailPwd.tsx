import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Modal,message } from 'antd';
import BaseClass from '@/baseClass';
let emailCodeTimeInter:any;// 验证码倒计时-定时器

class EmailPwd extends BaseClass {
    constructor(props: any) {
        super(props, [])
        this.state={
            code:"",
            emailSubmitFlag:true,
            emailVerifyClickFlag:true,
            sendEmailVerifyButtonMes:"获取验证码" as number|string       
        }
    }
    changeUserInfo(e:any){
        e.preventDefault();
        if(!this.state.emailSubmitFlag)return
        let code = this.state.code;
        if(!code){
          Modal.warning({
            title: '温馨提示',
            content: '未输入验证码，请输入验证码！',
            okText: "确定",
          });     
          return    
        } 
        this.setState({
            emailSubmitFlag:false
        })
        new window.actions.ApiValidateEmailAction(this.props.user.email,code).fly((res:any)=>{
          this.setState({
            emailSubmitFlag:true
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
    getEmailCode(){
        if(emailCodeTimeInter)clearInterval(emailCodeTimeInter);
        new window.actions.ApiSendMobileVCodeAction().fly((resp:any)=>{
            if(resp.StatusCode === 0){   
            message.success({
                content:"发送成功，请注意查收",
                duration:2,
            })    
            this.setState({
                sendEmailVerifyButtonMes:60,
            },()=>{
                emailCodeTimeInter = setInterval(()=>{
                if(this.state.sendEmailVerifyButtonMes===1){
                    this.setState({
                        sendEmailVerifyButtonMes:"获取验证码",
                        emailVerifyClickFlag:true,
                    })
                    clearInterval(emailCodeTimeInter);
                    return;
                }else{
                    this.setState({
                    sendEmailVerifyButtonMes:+this.state.sendEmailVerifyButtonMes-1
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
                emailVerifyClickFlag:true
            })
            }         
        })
        }
        changeCode(e:any){
        this.setState({
            code:e.target.value
        })
        }
        changeemail(e:any){
        this.setState({
            emailNum:e.target.value
        })   
    }
    render() {
        return (
            <div className='Personal'>
            {
              this.props.user.email?
              (
                this.props.user.verfyEmail?
                <p className='infoNotice'>* 您的邮箱账号{this.props.user.email}已验证</p>:
                <form onSubmit = {this.changeUserInfo.bind(this)}>
                  <div>
                    <label>邮箱账号：</label>
                    <div>
                      <input type="text" maxLength={11} defaultValue={this.props.user.email} readOnly/>
                    </div>
                  </div>
                  <div>
                    <label>验证码</label>
                    <div>
                      <input type="text" className='code' onChange={this.changeCode.bind(this)}/>
                      <span className='get' onClick={this.getEmailCode.bind(this)}>{this.state.sendEmailVerifyButtonMes}</span>
                    </div>                
                  </div>
                  <div>
                    <button className='Preservation'>保存</button>
                  </div>
                </form>            
              )
              :
              <p className='infoNotice'>* 您未绑定邮箱账号，请先绑定邮箱地址后再进行验证！</p>          
            }
          </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(EmailPwd));
