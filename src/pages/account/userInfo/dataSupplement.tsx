import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Modal,message,DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { serversOpen} from "tollPlugin/commonFun";
import BaseClass from '@/baseClass';

interface State{
  changePhone:string,
  changeName:string,
  changeEmail:string,
  changeQ:string,
  changeWachat:string,
  changeBirthday:string
}
class DataSupplement extends BaseClass {
    public state:State =  {
      changePhone:"",
      changeName:"",
      changeEmail:"",
      changeQ:"",
      changeWachat:"",
      changeBirthday:""
    }
    constructor(props: any) {
        super(props, [])
    }
    // 修改资料
    handleChangeInfo=(e:any,val:string)=>{
      this.setState({
          [val]:e.target.value
      })
    }
    dateChange(key: string, date: any, dateString: any) {
      this.setState({
        changeBirthday:dateString
      });
    }
    onSubmit(e:any){
      e.preventDefault();
      let changeName = this.state.changeName; 
      let changeEmail = this.state.changeEmail; 
      let changeQ = this.state.changeQ; 
      let changeWachat = this.state.changeWachat; 
      let changePhone = this.state.changePhone; 
      let changeBirthday = this.state.changeBirthday;
      if(!changeName && !this.props.user.realName){
        Modal.error({
          title:"错误提示",
          content:"未填写真实姓名",
          okText: "确定",
        });
        return
      }
      if(!changeEmail && !this.props.user.email){
          Modal.error({
            title:"错误提示",
            content:"未填写邮箱信息",
            okText: "确定",
          });     
          return    
      }
      if(!changeQ && !this.props.user.qq){   
          Modal.error({
            title:"错误提示",
            content:"尚未QQ信息",
            okText: "确定",
          });     
          return    
      }
      if(!changeWachat && !this.props.user.weChat){ 
          Modal.error({
            title:"错误提示",
            content:"尚未微信信息",
            okText: "确定",
          });   
          return    
      }
      if(!changePhone && !this.props.user.phone){ 
          Modal.error({
            title:"错误提示",
            content:"尚未手机信息",
            okText: "确定",
          });    
          return    
      }
      if(!changeBirthday && !this.props.user.birthday){
        Modal.error({
          title:"错误提示",
          content:"未填写生日信息",
          okText: "确定",
        });
        return
      }
      let filter = {
        TrueName:changeName?changeName:"",
        phone: changePhone?changePhone:"",
        qq: changeQ?changeQ:"",
        email: changeEmail?changeEmail:"",
        WebChat: changeWachat?changeWachat:"",
        birthday:changeBirthday?changeBirthday:""
      }
      new window.actions.ApiUpdateInfoAction(filter).fly((resp:any)=>{
        if(resp.StatusCode===0){
          message.success("修改成功",1)
          new window.actions.ApiPlayerInfoAction().fly(()=>{    
            message.destroy()
            this.props.history.push("/myCenter/userInfo/personal")
          });// 刷新个人信息 
        }
        else{ 
          Modal.error({
            title:"修改失败",
            content:resp.Message,
            okText: "确定",
          }) 
        }
      })
    }
    render() {
      if(this.props.user.realName&&this.props.user.email&&this.props.user.qq&&this.props.user.weChat&&this.props.user.phone&&this.props.user.birthday){
        return(
          <div className='Personal'>
            <p className='infoNotice'>* 只需要补充资料一次，修改资料请联系<a onClick={e=>serversOpen(this.props.remoteSysConfs.online_service_link)}>客服</a></p>
          </div>
        ) 
      }
      return (
        <div className='Personal'>
          <form onSubmit = {this.onSubmit.bind(this)}>
            <div>
              <label>真实姓名：</label>
              <div>
                {
                  this.props.user.realName?
                  <input type='text' defaultValue={this.props.user.realName} readOnly/>:
                  <input type='text' onChange={e=>this.handleChangeInfo(e,'changeName')} placeholder='请如实填写您的真实姓名'/>
                }
              </div>
            </div>
            <div>
              <label>邮箱地址：</label>
              <div>
                {
                  this.props.user.email?
                  <input type='text' defaultValue={this.props.user.email} readOnly/>:
                  <input type='email' onChange={e=>this.handleChangeInfo(e,'changeEmail')} placeholder='填写您的邮箱信息'/> 
                }
              </div>
            </div>
            <div>
              <label>QQ：</label>
              <div>
                {
                  this.props.user.qq?
                  <input type='text' defaultValue={this.props.user.qq} readOnly/>:
                  <input type='number' onChange={e=>this.handleChangeInfo(e,'changeQ')} placeholder='请填写您的QQ号码'/>                           
                }        
              </div>
            </div>
            <div>
              <label>微信：</label>
              <div>
                {
                  this.props.user.weChat?
                  <input type='text' defaultValue={this.props.user.weChat} readOnly/>:
                  <input type='text' onChange={e=>this.handleChangeInfo(e,'changeWachat')} placeholder='请填写您的微信账号' maxLength={20}/>                           
                }   
              </div>
            </div>
            <div>
              <label>手机号码：</label>
              <div>
                {
                  this.props.user.phone?
                  <input type='text' defaultValue={this.props.user.phone} readOnly/>:
                  <input type='number' value={this.state.changePhone.slice(0,11)} onChange={e=>this.handleChangeInfo(e,'changePhone')} placeholder='手机号码只允许填写一次'/>                          
                } 
              </div>
            </div>
            <div>
              <label>生日：</label>
              <div>
              {
                    this.props.user.birthday?
                    <input type='text' defaultValue={this.props.user.birthday.replace("T","  ")} readOnly/>:
                    <DatePicker locale={locale} onChange={this.dateChange.bind(this, 'IsReceiveBirthday')} />
                }    
              </div>
            </div>
            <div>
              <button className='Preservation'>提交修改</button>
            </div>
          </form>
        </div>
      );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
});

export default withRouter(connect(mapStateToProps)(DataSupplement));
