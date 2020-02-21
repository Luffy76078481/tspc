import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Modal} from 'antd';
import BaseClass from '@/baseClass';
import { PassWord } from "components/pui/Pui";

interface PWD{
  oldPwd:string|number,
  newPwd:string|number,
  enterPwd:string|number,
  pwdlock:boolean
}

class LoginPwd extends BaseClass {
  public state:PWD={
    oldPwd:"0000",
    newPwd:"0000",
    enterPwd:"0000",
    pwdlock:true
  }
  constructor(props: any) {
      super(props, [])
  }
  handleSubmitPWD(e:any){
    e.preventDefault();
    if(!this.state.pwdlock)return
    let oldPassword = this.state.oldPwd;
    let newPassWord = this.state.newPwd;
    let enterPassWord = this.state.enterPwd;
    if(!oldPassword){
      Modal.error({
        title:"错误提示",
        content:"未输入原密码",
        okText: "确定",
      })      
      return
    }
    if(!newPassWord){
      Modal.error({
        title:"错误提示",
        content:"未输入新密码",
        okText: "确定",
      })  
      return
    }
    if(newPassWord!==enterPassWord){
      Modal.error({
        title:"错误提示",
        content:"新密码与确认密码不匹配",
        okText: "确定",
      })  
      return
    }
    this.setState({
      pwdlock:false
    })
    new window.actions.ApiChangePayPwdAction(oldPassword,newPassWord).fly(
      (res:any)=>{
        this.setState({
          pwdlock:true
        })
        if(res.StatusCode === 0){
          Modal.success({
            title:"错误提示",
            content:"密码修改成功",
            okText: "确定",
          })      
          this.setState({
            oldPwd:"",
            newPwd:"",
            enterPwd:""
          })
        }else{
          Modal.error({
            title:"修改失败",
            content:res.Message,
            okText: "确定",
          })  
        }
      }
    )
  }
  changePWD(val:string,e:any){
    this.setState({
      [val]:e.target.value
    })
  }
  render() {
    return (
      <div className='LoginPwd'>
        <form onSubmit = {this.handleSubmitPWD.bind(this)}>
          <div>
            <label>原支付密码：</label>
            <div>
              <PassWord
                defaultVal={[0, 0, 0, 0]}
                getVal={(val: string) => {
                  this.setState({
                    oldPwd:val
                  })
                }} />
            </div>
          </div>
          <div>
            <label>新支付密码：</label>
            <div>
            <PassWord
                defaultVal={[0, 0, 0, 0]}
                getVal={(val: string) => {
                  this.setState({
                    newPwd:val
                  })
                }} />
            </div>
          </div>
          <div>
            <label>确认密码：</label>
            <div>
            <PassWord
                defaultVal={[0, 0, 0, 0]}
                getVal={(val: string) => {
                  this.setState({
                    enterPwd:val
                  })
                }} />
            </div>
          </div>
          <div>
            <button className='Preservation'>完成</button>
          </div>
        </form>
      </div>
    );
  }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(LoginPwd));
