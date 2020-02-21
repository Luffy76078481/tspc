import React from "react";
import BaseClass from '@/baseClass';
import {provinces} from "tollPlugin/provincesJson"
import {isChinese,AsteriskProcessing} from "tollPlugin/commonFun"
import {PassWord} from "components/pui/Pui";
import "./bank.scss"
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {Modal} from 'antd';;
;

class Bank extends BaseClass {
    public state = {
        banding_bank:false,// 显示绑定银行卡页
        selProvince:provinces[0], // 省份
        branchName:"", // 支行地址 InputVal
        WithdrawalPwd:"0000",// 取款密码，如果没有设置全款密码，直接设置
        accountName:this.props.user.realName?this.props.user.realName:"", // 账户名称 InputVal
        bankNum:"", // 银行账号 inputVal
        Opening:provinces[0].cities[0].name,//开户市区
        userBank:"",//选择的银行
        OpeningPro:provinces[0].name,// 开户省
        clickFlag:false
    }
    constructor(props: any) {
        super(props, [])
    }
    bindingBanks(){
        this.setState({
            banding_bank:true
        })
    }
    static getDerivedStateFromProps(props: any, state: any) {
        if(props.bankInfos[0].Id!==state.userBank){
            return({
                userBank:props.bankInfos[0].Id
            })
        }
        return null;
      }
    // 银行信息
    renderBankInfos(){
        let bankInfos = [];
        for (var i = 0; i < this.props.bankInfos.length; i++){
            var  bank = this.props.bankInfos[i] ;
            bankInfos.push(
                <option key={bank.Id} value={bank.Id}>{bank.BankName}</option>
            )
        }
        return bankInfos;
    }
    renderProvinces(){
        let ret = [];
        for (var i = 0; i < provinces.length; i++) {
            var p = provinces[i];
            ret.push(
                <option key={i} value={p.name}>{p.name}</option>
            );
        }
        return ret;
    }
    // 切换省份
    onProvinceChanged(e:any) {
        this.setState({
            selProvince:provinces[e.target.selectedIndex],
            OpeningPro:provinces[e.target.selectedIndex].name,//开户省
            Opening:provinces[e.target.selectedIndex].cities[0].name,//默认第一个开户市
        })
    }
    renderCities(){
        let ret = [];
        for (var i = 0; i < this.state.selProvince.cities.length; i++) {
            var c = this.state.selProvince.cities[i];
            ret.push(
                <option key={i} value={c.name}>{c.name}</option>
            );

        }
        return ret;
    }
    // Input修改状态
    handleChange(val:string,event:any){
        this.setState({
            [val]:event.target.value
        })
    }
    componentDidMount(){
        new window.actions.ApiBankAccountsAction().fly(); 
    }
    reload(){
        new window.actions.ApiBankAccountsAction().fly(); // 获取会员绑定的银行卡
        new window.actions.ApiPlayerInfoAction().fly();// 刷新个人信息 
    }
    handleSubmit(){
        if(this.state.clickFlag)return;
        this.setState({
            clickFlag:true
        })
        let that = this;
        // 如果没有真实姓名
        if(!this.props.user.realName){
            let trueName = this.state.accountName; // 用户输入的账户名
            if(!trueName){
                Modal.error({
                    title:"错误提示",
                    content:"为确保正常提款,请认真填写您的真实姓名",
                    okText: "确定",
                })
                this.setState({
                    clickFlag:false
                })
                return;
            }
            if(!isChinese(trueName)){
                Modal.error({
                    title:"错误提示",
                    content:"请输入中文的真实姓名",
                    okText: "确定",
                })
                this.setState({
                    clickFlag:false
                })
                return
            }
            // 修改用户真实姓名
            new window.actions.ApiUpdateInfoAction({TrueName:trueName}).fly((resp:any)=>{
                this.setState({
                    clickFlag:false
                })
                if(resp.StatusCode === 0){
                    new window.actions.ApiPlayerInfoAction().fly()
                    // 修改完信息后再绑定银行卡
                    new window.actions.ApiBindCardAction(
                    {
                        BankId:this.state.userBank,
                        Province:this.state.OpeningPro,
                        City:this.state.Opening,
                        BranchName:this.state.branchName, // 支行
                        AccountNo:this.state.bankNum, // 银行卡号
                        AccountName:trueName
                    }
                    ).fly( (resp:any)=>{
                        if (resp.StatusCode === 0) {
                            that.reload();
                            this.props.history.replace("/myCenter/withdraw")
                        }else{
                            Modal.error({
                                title:"错误提示",
                                content:resp.Message,
                                okText: "确定",
                            })
                        }
                    });
                }else{
                    Modal.error({
                        title:"错误提示",
                        content:resp.Message,
                        okText: "确定",
                    })
                }
            })
        }else{
            let obj = {
                BankId:this.state.userBank,
                Province:this.state.OpeningPro,
                City:this.state.Opening,
                BranchName:this.state.branchName, // 支行
                AccountNo:this.state.bankNum, // 银行卡号
                AccountName:this.state.accountName,
                WithdrawalPwd:!this.props.user.HasWithdrawalPassword?this.state.WithdrawalPwd:"" // 如果用户首次设置取款密码
            }
            new window.actions.ApiBindCardAction(obj).fly((resp:any)=>{
                this.setState({
                    clickFlag:false,
                    banding_bank:false
                })
                if (resp.StatusCode === 0) {
                    that.reload();
                    that.setState({
                        WithdrawalPwd:"0000",
                        bankNum:"",
                        accountName:that.props.user.realName?that.props.user.realName:"",
                        branchName:""
                    })
                }else{
                    Modal.error({
                        title:"错误提示",
                        content:resp.Message,
                        okText: "确定",
                    })
                }
            });
        }
    }
    renderAccounts(){
        let ret:JSX.Element[] = [];
        this.props.user.bankAccounts.map((item:any,i:number)=>{     
            return ret.push(
                <div className='card' key={i}>
                    <p className='BankTitle'>
                        <span>{item.Bank.BankName}</span>
                        {i===0&& <span>默认</span>}
                    </p>
                    <p className='BankNum'>
                    <span>{AsteriskProcessing(item.AccountNo,'bank')}</span>
                    </p>
                </div>
            )
        })
        return ret
    }

    render() {
        const bankAccounts = this.props.user.bankAccounts || []; // 银行卡
        if(this.state.banding_bank){
            return(
                <div className='binding'>
                    <h2>银行卡管理</h2>
                    <p className="bankNoc">初始提款密码默认为登录密码或0000，为了保障资金安全，建议您立即去个人资料/修改密码页面重新修改。</p>
                    <div className='labelBox'>
                        <label>选择银行：</label>
                        <div className='doing'>
                            <select onChange = {this.handleChange.bind(this,"userBank")} defaultValue={this.props.bankInfos[0].Id}>
                                {this.renderBankInfos()}
                            </select>
                        </div>
                    </div>
                    <div className='labelBox'>
                        <label>开户省：</label>
                        <div className='doing'>
                            <select onChange={this.onProvinceChanged.bind(this)}>
                                {this.renderProvinces()}
                            </select> 
                        </div>
                    </div>
                    <div className='labelBox'>
                        <label>开户市：</label>
                        <div className='doing'>
                            <select onChange = {this.handleChange.bind(this,"Opening")}>
                                {this.renderCities()}
                            </select>                            
                        </div>
                    </div>
                    <div className='labelBox'>
                        <label>开户支行：</label>
                        <div className='doing'>
                            <input type="text" placeholder='输入开户行名称' 
                            value={this.state.branchName} onChange = {this.handleChange.bind(this,"branchName")}/>
                        </div>
                    </div>
                    <div className='labelBox'>
                        <label>账户名称：</label>
                        <div className='doing'>
                            {
                                this.props.user.realName?
                                <input type="text" defaultValue={this.props.user.realName} readOnly/> :
                                <input type="text" 
                                    value={this.state.accountName}
                                    onChange = {this.handleChange.bind(this,"accountName")} 
                                    placeholder="对应您的真实姓名"/>
                            }
                        </div>
                    </div>
                    {
                        !this.props.user.HasWithdrawalPassword &&
                        <div className="labelBox">
                            <label>取款密码: </label>
                            <div className='doingWith'>
                                <PassWord
                                defaultVal = {[0,0,0,0]}
                                getVal={(val:string)=>{
                                    this.setState({
                                        WithdrawalPwd:val
                                    });
                                }}/>                                
                            </div>
                        </div>
                    }   
                    <div className='labelBox'>
                        <label>银行卡号：</label>
                        <div className='doing'>
                            <input type="tel" placeholder="请输入银行卡号" 
                            value={this.state.bankNum} onChange = {this.handleChange.bind(this,"bankNum")} 
                            maxLength={19} minLength={16}/>
                        </div>
                    </div>
                    <div>
                        <button className='Preservation' onClick={this.handleSubmit.bind(this)}>完成</button>
                    </div>
                </div>
            )
        }
        return (
            <div className="Bank">
                <h2>银行卡管理</h2>
                {
                    bankAccounts.length>0?
                    <div className='banks clearfix'>
                        <p className='bindtobank'>需要绑定新的银行卡，请点击<a onClick={this.bindingBanks.bind(this)}>绑定银行卡</a></p>
                        {this.renderAccounts()}
                    </div>:
                    <div className='bansWrap'>
                        <div className='imgs'></div>
                        <p className='bindtobank'>阁下还未<a onClick={this.bindingBanks.bind(this)}>绑定银行卡</a></p>
                    </div>
                }
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user,
    bankInfos:state.bankInfos,
});

export default withRouter(connect(mapStateToProps)(Bank));
