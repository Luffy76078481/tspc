import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { message} from 'antd';
import BaseClass from '@/baseClass';
import "./Feedback.scss"

interface State{
    activeTab:string,
    howManyWords:number,
    texVal:string
}

class Feedback extends BaseClass {
    public problemTypes:string[] = ['存款问题','提款问题','游戏问题','优惠问题','网站/APP登录','修改资料','流水问题','其他']
    public state:State = {
        activeTab:"存款问题",
        howManyWords:0,
        texVal:""
    }
    constructor(props:any) {
        super(props,[])
    }
    changeTab(val:string){
        this.setState({
            activeTab:val
        })
    }
    renderProblem(){
        let ret:JSX.Element[] = [];
        this.problemTypes.map((item:string)=>{
            return ret.push(
                <li key={item} className={this.state.activeTab===item?"active":""} 
                onClick={this.changeTab.bind(this,item)}>{item}</li>
            )
        })
        return(
            <ul>
                {ret}
            </ul>
        )
    }
    // 计算输入了多少字
    howManyWrite(e:any){
        let txtval:string = e.target.value;
        let str_length:number = 0;
        function isChinese(str:string){
            let reCh=/[u00-uff]/;
            return !reCh.test(str);
        }
        for(let i=0;i<txtval.length;i++){
            if(isChinese(txtval.charAt(i))) str_length=str_length+2; //中文为2个字符
            else str_length=str_length+1; //英文为1个字符
        }
        if(Math.ceil(str_length/2)>200){
            message.destroy()
            message.error('字数超限',1.5)
            return
        }
        this.setState({
            howManyWords:Math.ceil(str_length/2),
            texVal:txtval
        })
    }
    handleonSubmit(){
        if(this.state.howManyWords<20){
            message.error('字数小于20字',1.5)
            return
        }
        message.info('提交中...',1.5)
        new window.actions.ApiFeedBackAction(this.state.texVal,this.state.activeTab).fly((res:any)=>{
            message.destroy()
            if (res.StatusCode === 0) {
                message.success('提交成功',1.5)
                this.setState({
                    texVal:""
                })
            }else{
                message.error(res.Message,1.5)
            }
        })
    }
    render() {
        return (
            <div className="Feedback">
                <h2>意见反馈</h2>
                <div className='feedwrap'>
                    <div className='tab'>
                        <div className='matterType'><em>*</em>问题类型：</div>
                        <div className='types'>
                            {this.renderProblem()}
                        </div>
                    </div>
                    <div className='advice'>
                        <div className='matterType'><em>*</em>内容：</div>
                        <div className='tex'>
                            <textarea
                            value={this.state.texVal}
                            rows={6} 
                            onChange={this.howManyWrite.bind(this)}                 
                            placeholder="请输入反馈内容，不能少于20个字"></textarea>
                            <span style={this.state.howManyWords===200?{color:"rgb(255, 0, 0)"}:{}}>{this.state.howManyWords}/200</span>
                        </div>
                    </div>
                    <div className='sub'>
                        <button className='SubBut' onClick={this.handleonSubmit.bind(this)}>立即提交</button>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(Feedback));
