import React, { CSSProperties } from "react";
import { connect } from "react-redux";
import { withRouter,Link } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { Modal,Spin} from 'antd';
import { serversOpen,copyCode} from "tollPlugin/commonFun";
import "./deposit.scss"
const QRCode = require('qrcode.react');

type PayMentBank = {
    Bank:{
        BankCode:string,
        BankName:string
    },
    AccountNo:string,
    Id:string,
    OpeningBank:string,
    AccountName:string,
    MinAmount:number,
    MaxAmount:number,
    BankName:string,
    BankNo:string,
    ThirdPayId:number,
    ImageUrl:string,
    IsJumpScanCode:number,
    FixedAmount:string,
    ThirdPayTypeId?:number,
    Reminder?:string
}
type State = {
    Transferor:string,          
    depositMoney:string,      
    isCanNavSwitch:CSSProperties,   
    reqLock:boolean,          
    PaymentCode:string,        
    hint:string,               
    payBanks:PayMentBank[],            
    PayMentBank:PayMentBank,         
    payType:number,              
    isPayLink:number,         
    isOenpLink:boolean,     
    isLoading:boolean,  
    showBankForm:boolean,
    payTips:string,         
    thirdPayImg:string,        
    thirdPayRecordId:string,     
}
type depositType = {
    PayBanks:{
        AdminBanks:any[],
        ThirdPayBanks:any[]
    },
    PayTypeCode?:string,
    Remark?:string,
    AccountName?:string,
    AccountNo:string,
    OpeningBank:string,
    Status:boolean,
    Type:number,
    MinAmount:number,
    MaxAmount:number,
    ImageUrl:string,
    Reminder:string,
    ThirdPayTypeId:number,
    PayType:number
}
class Deposit extends BaseClass {
    public state:State = {
        Transferor:"",          // 银行转账中点击下一步后的输入框，（转账人,转出人）
        depositMoney:"0",        // 存款金额
        isCanNavSwitch:{"pointerEvents":"all"},   // 一级导航，控制样式 pointer-events，避免发送API回调未返回时切换其他支付方式。
        reqLock:false,          // 存款锁，防止用户连续点击
        PaymentCode:"",         // 当前支付类型对应的支付代码,例：Wechat,JDpay,alipay，用于一级导航ActiveClassname。
        hint:"",                // 每一种支付类型附带提示语（一级导航对应的提示备注语）
        payBanks:[],            // 支付银行与第三方支付银行的合并集（Select下拉银行选项）
        PayMentBank:{
            Bank:{
                BankCode:"",
                BankName:""
            },
            AccountNo:"",
            Id:"",
            OpeningBank:"",
            AccountName:"",
            MinAmount:0,
            MaxAmount:0,
            BankName:"",
            BankNo:"",
            ThirdPayId:0,
            ImageUrl:"",
            IsJumpScanCode:0,
            FixedAmount:""
        },         // 当前选择的银行。
        payType:0,              // 用于区别银行转账(AdminBanks)和第三方支付(ThirdPayBanks)
        isPayLink:0,            // 用于区别银行转账中(AdminBanks)是否是二维扫码或者银行卡转账（直接发送请求）。
        isOenpLink:true,        // 用于区别第三方支付（ThirdPayBanks）是否是打开链接还是扫描二维码。    
        isLoading:false,        // 用于控制是否是第三方返回二维码    
        showBankForm:false,     // 控制银行转账表单显示隐藏（点击下一步）
        payTips:"" ,            // 每一个支付银行携带的提示语
        thirdPayImg:"",         // 第三方支付返回的二维码链接
        thirdPayRecordId:"",    // 第三方支付二维码返回的单号       
    }
    constructor(props:any) { 
        super(props,[]);
    }
    componentDidMount(){
        // 开局默认第一个为当前支付类型。
        if(this.props.getAllPay.length===0){
            // 获取支付类型，将获取的支付类型组，进行数据初步处理。
            new window.actions.ApiGetAllPayAction().fly((resp:any)=>{
                if(resp.PayList.length>0){
                    let payList = resp.PayList;
                    this.SelectPayment(payList[0])                    
                }
            })
        }else{
            this.SelectPayment(this.props.getAllPay[0])        
        }
    }
    // 以下方法对返回的支付数据进行初步处理（切换到存款页面componentDidMount时，选择支付类型（1级导航）时触发以下函数）
    // 欲知以下变量为何物，请到constructor state查看。
    SelectPayment(data:depositType){
        if(data===undefined){
            alert('配置错误')
            return
        }
        let allBanks:depositType[] = [];
        let AdminBanks = data.PayBanks.AdminBanks.length>0?data.PayBanks.AdminBanks:[];   // 银行转账银行
        let ThirdPayBanks = data.PayBanks.ThirdPayBanks.length>0?data.PayBanks.ThirdPayBanks:[]// 第三方支付银行
        allBanks = allBanks.concat(AdminBanks,ThirdPayBanks);
        this.setState({                   
            PaymentCode:data.PayTypeCode,       
            hint:data.Remark?data.Remark:"",      
            payBanks:allBanks,                  
            PayMentBank:allBanks[0],            
            payType:allBanks[0].PayType,      
            isPayLink:allBanks[0].Type?allBanks[0].Type:0,  
            showBankForm:false, 
            payTips:allBanks[0].Reminder?allBanks[0].Reminder:"",
            isOenpLink:true,
            depositMoney:""
        })
    }
    // 支付类型渲染（一级导航），注：微信，支付宝，京东，银行卡，苏宁等
    renderPaymentMethod(){
        let ret:JSX.Element[]=[];
        for(let i=0;i<this.props.getAllPay.length;i++){
            let payDom = this.props.getAllPay[i];
            let whichIcon = payDom.Discounted?"hasDiscounted":(payDom.Recommend?"hasRecommend":"")
            ret.push(
                <li 
                    key={i} 
                    style={this.state.isCanNavSwitch} 
                    className={this.state.PaymentCode===payDom.PayTypeCode?"active "+whichIcon:whichIcon} 
                    onClick={this.SelectPayment.bind(this,payDom)}>
                    {
                        payDom.PayTypeCode!=='Other'?
                        <div className='kuang'>
                            <span className='payicon' style={{backgroundImage:`url(${window.config.devImgUrl+payDom.ImageUrl})`}}></span>
                            <i className='activeGou'></i>
                        </div>
                        :
                        <div className='kuang'>
                            <span className='payicon otherpay'></span>
                            <i className='activeGou'></i>
                        </div>
                    }
                    <span>{payDom.PayTypeName}</span>
                </li>
            )                           
        }
        return ret;
    }
    // 下拉Select选择银行
    SelectPayBank=(event:any)=>{
        this.setState({
            PayMentBank:JSON.parse(event.target.value),
            payType:JSON.parse(event.target.value).PayType,
            isPayLink:JSON.parse(event.target.value).Type?JSON.parse(event.target.value).Type:0,
            payTips:JSON.parse(event.target.value).Reminder?JSON.parse(event.target.value).Reminder:"",
            showBankForm:false,
        })
    }
    // 当前支付类型（1级导航）对应的银行，（第三方或客户收款银行）
    renderPayBank(){
        let Options = this.state.payBanks.map(
            (payBank:any) => <option key={payBank.Id} value={JSON.stringify(payBank)}>
            { 
                (payBank.Bank?payBank.Bank.BankName:payBank.BankName)+(payBank.AliasName?" "+payBank.AliasName:"") 
            }
            </option>
        )
        // 如果银行只有一个，只显示存款余额
        if(this.state.payBanks.length===1 || this.state.payBanks.length<1){
            return null
        }
        return(
            <select onChange={(e)=>this.SelectPayBank(e)} className="normalInput">
                {Options}
            </select>
        )
    }
    // 点击下一步或存款，如何存款
    howToPay(){
        if( Number(this.state.payType)===2 ){
            this.BankTransfer() //银行转账
        }else{
            this.ThirdPayment() //第三方支付
        }
    }
    //银行转账支付
    BankTransfer(){
        var depositmoney = this.state.depositMoney;
        if(this.state.reqLock)
        return;
        this.state.reqLock=true;
        var self = this;
        // 传入支付类型
        let TransType = 1;       
        if(this.state.PayMentBank.Bank.BankCode.indexOf('ALIPAY')!==-1)TransType = 6;
        else if(this.state.PayMentBank.Bank.BankCode.indexOf('WECHAT')!==-1)TransType = 7;
        else TransType = 1;
        // 参数
        let filter = {
            BankId:this.state.PayMentBank.Id,
            TransType:TransType,
            Amount:depositmoney,
            AccountName:this.state.Transferor || this.props.user.realName || "",// 转账人姓名
        };
        new window.actions.ApiOfflineDepositAction(filter).fly(
            (resp:any)=>{
                if(resp.StatusCode===0){
                    // 非二维码
                    if(this.state.isPayLink){
                        Modal.info({
                            title: '线下支付申请成功',
                            content: "支付单号: " + 
                            resp.OrderNo + "\n\n账户名: " + 
                            self.state.Transferor + "\n\n银行卡号: " + 
                            self.state.PayMentBank.AccountNo + "\n\n银行: " + 
                            self.state.PayMentBank.Bank.BankName + "\n\n支行: " + 
                            self.state.PayMentBank.OpeningBank,
                            okText: "确定",
                            onOk:()=>{
                                //this.props.history.push("/records_deposit") // 待解决
                            }
                        });    
                    }else{ // 二维码
                        Modal.info({
                            title: self.state.PayMentBank.AccountName+"支付申请成功",
                            content:"支付单号: " + resp.OrderNo + "\n\n账户名: " + 
                                self.state.PayMentBank.AccountName + "\n\n银行卡号: " + 
                                self.state.PayMentBank.AccountNo + "\n\n银行: " + 
                                self.state.PayMentBank.Bank.BankName,
                            okText: "确定",
                            onOk:()=>{
                                //this.props.history.push("/records_deposit") // 待解决
                            }
                        })
                    }
                    this.setState({
                        showBankForm:false,
                    });
                }else{
                    if(resp.Message){
                        Modal.error({
                            title:"错误提示",
                            content:resp.Message,
                            okText: "确定",
                        })
                    }else{
                        Modal.error({
                            title:"错误提示",
                            content:"支付链接，请稍后再试或联系客服",
                            okText: "确定",
                        })
                    }
                }
                self.state.reqLock = false;
            }
        )
    }
    //第三方支付API
    ThirdPayment(){
        var self = this;
        var depositmoney = this.state.depositMoney; // 输入的存款金额
        var Thirdpay =  this.state.PayMentBank;     // 当前选择的银行
        if(!depositmoney||depositmoney===null){
            Modal.error({
                title:"存款金额错误",
                content:"未输入存款金额",
                okText: "确定",
            })
            return;
        }
        if(+depositmoney===0||+depositmoney < Thirdpay.MinAmount || +depositmoney > Thirdpay.MaxAmount){
            Modal.error({
                title:"存款金额错误",
                content:Thirdpay.BankName+
                "允许存款金额范围："+
                Thirdpay.MinAmount+"～"+Thirdpay.MaxAmount,
                okText: "确定",
            })
            return;
        }
        if(this.state.reqLock)
        return;
        this.setState({
            reqLock:true,// 防止用户多次点击存款
            isCanNavSwitch:{"pointerEvents":"none"} // 1级导航无法点击
        })
        // 筛选在线支付或者在线网银
        const fifter = ['WECHAT','ALIPAY','QQPAY','JDPAY','WECHAT_WAP','ALIPAY_WAP','QQPAY_WAP','JDPAY_WAP','YLPAY','BAIDUPAY','ETH','BTC']
        let isOnline=0;
        fifter.map(
            item=>Thirdpay.BankNo.indexOf(item)>-1?isOnline++:isOnline+0
        )      
        let param ={
            Amount:depositmoney,
            Id:Thirdpay.Id,
            thirdPayId:Thirdpay.ThirdPayId,
            ReturnType:isOnline>0?(Thirdpay.IsJumpScanCode === 1?"QRLink":"QRCode"):"online",// 傻X参数,在线网银online,在线支付二维码或跳转
            Tag:window.config.webSiteTag,
            BankNo:Thirdpay.BankNo
        }
        if(Thirdpay.IsJumpScanCode){
            new window.actions.ApiSubmitOnlinePayAction(param).fly((resp:any)=>{
                if(resp.StatusCode ===0) {
                    Modal.confirm({
                        title:"温馨提示",
                        content:"获取支付成功，前往支付?",
                        okText: "前往",
                        cancelText:"取消",
                        onCancel() {},
                        onOk:()=>{
                            window.open(resp.Content,'_blank');
                            setTimeout(() => {
                                Modal.confirm({
                                    title: '支付反馈',
                                    okText: "支付完成",
                                    cancelText:"支付失败",
                                    onOk:()=>{
                                        //this.props.history.push("/records_deposit");// 待解决
                                    },
                                    onCancel:()=>{
                                        window.open(self.props.remoteSysConfs.online_service_link,'servers');
                                    }
                                })              
                            }, 1000);
                        }
                    })
                }else{
                    if(resp.Message){
                        Modal.error({
                            title: '错误提示',
                            content:resp.Message
                        })
                    }else{
                        Modal.error({
                            title: '错误提示',
                            content:"支付链接，请稍后再试或联系客服"
                        })
                    }
                }
                self.setState({
                    reqLock:false,
                    isCanNavSwitch:{"pointerEvents":"all"}
                })
            })
        }else{
            this.setState({
                isLoading:true
            },()=>{
                new window.actions.ApiSubmitOnlinePayAction(param).fly((resp:any)=>{
                    if(resp.StatusCode ===0) {
                        self.setState({
                            isLoading:false,
                            isOenpLink:false,
                            thirdPayImg:resp.Content,
                            thirdPayRecordId:resp.OrderNo
                        })
                    }else{
                        self.setState({
                            isLoading:false
                        },()=>{
                            if(resp.Message){
                                Modal.error({
                                    title: '错误提示',
                                    content:resp.Message
                                })
                            }else{
                                Modal.error({
                                    title: '错误提示',
                                    content:"二维码生成失败，请稍后再试或联系客服"
                                })
                            }
                        })
                    }
                    self.setState({
                        reqLock:false,
                        isCanNavSwitch:{"pointerEvents":"all"}
                    })
                })
            })
        }
    }
    // 返回的二维码如果是图片则用图片，否则用QRCODE（返回的链接用QRCODE插件）
    PictureType(){
        let ret;
        let reg = /\.(gif|jpg|png)\??.*$/;
        reg.test(this.state.PayMentBank.ImageUrl)?
        ret = <img alt="QRCODE" src={window.config.devImgUrl + this.state.PayMentBank.ImageUrl} width='200' style={{marginTop:'1.5rem'}}/>:
        ret = <QRCode includeMargin={false} size={160} value={window.config.devImgUrl + this.state.PayMentBank.ImageUrl || ""}/> 
        return ret; 
    }
    // 转账人，转出账户名，输入金额等input框 Onchange事件改变值
    handleChangeInputVal=(event:any,val:any)=>{
        this.setState({
            [val]:event.target.value
        })
    }
    // 支付信息表单
    renderDepositForm(){
        let DepositForm;
        if(Number(this.state.isPayLink)===3&&Number(this.state.payType)===2){ // 银行转账，二维扫码
            DepositForm = (
                <div className='pr'>
                    <p className='flexWrap'>
                        <label>收款银行：</label>
                        <input value={this.state.PayMentBank.Bank.BankName} id='BankName' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('BankName')}>复制</button>
                    </p>   
                    <p className='flexWrap'>
                        <label>收款姓名：</label>
                        <input value={this.state.PayMentBank.AccountName} id='AccountName' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('AccountName')}>复制</button>
                    </p>     
                    <p className='flexWrap'>
                        <label>收款账号：</label>
                        <input value={this.state.PayMentBank.AccountNo} id='AccountNo' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('AccountNo')}>复制</button>
                    </p>   
                    <p className='flexWrap'>
                        <label>转账姓名：</label>
                        <input placeholder="请输入转账人姓名" value={this.state.Transferor} onChange={e=>this.handleChangeInputVal(e,'Transferor')}/>
                    </p>  
                    <div className="qrcodePay">         
                        {this.PictureType()}      
                    </div>
                </div>
            )
        }else if(Number(this.state.isPayLink)===1&&Number(this.state.payType)===2){ // 银行转账，卡号转账
            DepositForm = (
                <div>
                    <p className='flexWrap'>
                        <label>账户名：</label>
                        <input value={this.state.PayMentBank.AccountName} id='AccountName' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('AccountName')}>复制</button>
                    </p>                  
                    <p className='flexWrap'>
                        <label>银行卡号：</label>
                        <input value={this.state.PayMentBank.AccountNo} id='AccountNo' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('AccountNo')}>复制</button>
                    </p>       
                    <p className='flexWrap'>
                        <label>银行：</label>
                        <input value={this.state.PayMentBank.Bank.BankName} id='BankName' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('BankName')}>复制</button>
                    </p>
                    <p className='flexWrap'>
                        <label>支行：</label>
                        <input value={this.state.PayMentBank.OpeningBank} id='OpeningBank' readOnly/>
                        <button className='Preservation' onClick={()=>copyCode('OpeningBank')}>复制</button>
                    </p>  
                    <p className='flexWrap'>
                        <label>账户名：</label>
                        <span>
                            <input type="text" value={this.state.Transferor} onChange={e=>this.handleChangeInputVal(e,'Transferor')} placeholder="(如果非本人卡，请填写)" />
                        </span>
                    </p>
                </div>
            )
        }else{
            DepositForm = (
                <div></div>
            )
        }
        return(
            <div className='depositForm'>
                {DepositForm}
            </div>
        )
    }
    // 点击下一步，只有银行转账，payType==2的时候出现。
    NextStep(){
        var depositmoney = this.state.depositMoney;
        if(!this.state.PayMentBank){
            Modal.warning({
                title: '温馨提示',
                content:"请选择您的银行",
                okText:"确定"
            })
            return;
        }
        if(!depositmoney||+depositmoney===0||+depositmoney < this.state.PayMentBank.MinAmount || +depositmoney > this.state.PayMentBank.MaxAmount){
            Modal.warning({
                title: '存款金额错误',
                content:this.state.PayMentBank.Bank.BankName+
                "允许存款金额范围："+
                this.state.PayMentBank.MinAmount+"～"+this.state.PayMentBank.MaxAmount,
                okText:"确定"
            })
            return;
        }
        this.setState({
            showBankForm:true
        })
    }
    // 第三方支付二维码DOM渲染
    renderThirdDom(){
        let self = this;
        let recordId =self.state.thirdPayRecordId;
        let imgCode = self.state.thirdPayImg;
        let money = this.state.depositMoney;
        return(
            <div className="thirdFrom">
                <QRCode 
                    style={{"float":"right"}}
                    includeMargin={false} //内部是否有margin
                    size={180}  //图片大小
                    value={imgCode || ""} //地址
                />
                <p>
                    您的单号为:<strong>{recordId}</strong>
                    存款账户随时变更，请勿保存当前二维码。<br/>
                    请您用软件扫描二维码进行支付，即可实时到帐！<br/>
                    您需要支付的金额为：<strong style={{color:'#f00'}}>{money}</strong>元
                </p>
                <div>
                    <button onClick={()=>{this.props.history.push("/records_deposit")}}>支付完成</button>
                    <button onClick={()=>{serversOpen(this.props.remoteSysConfs.online_service_link)}}>支付失败</button>
                </div>
            </div>
        )
    }
    // 快捷金额DOM
    renderQuickPay(){
        let arr = [];
        if(this.state.PayMentBank.FixedAmount){
            arr = this.state.PayMentBank.FixedAmount.split(',');// 固定金额
        }else{
            // 如果没有固定金额，则为快捷金额
            arr = this.props.QuickPrice?this.props.QuickPrice.split(','):[5,100,200,500,1000,2000,5000,10000];            
        }
        const that = this;
        function changeDepositMoney(val:string){
            let addMoney:string = "";
            if(that.state.payType===2 && that.props.backConfigs.isDecimal==="1"){ // 银行转账的情况下，快捷金额或者固定金额后，添加一个2位小数。
                addMoney = (JSON.parse(val)-0+Math.random()+0.01).toFixed(2); // 快进金额后随机添加一个小数
            }else{
                addMoney = JSON.parse(val)
            }
            that.setState({
                depositMoney:addMoney
            })
        }
        let QuickDom = arr.map(
            (item:any)=>{
                return(
                    <span 
                        key={item}               
                        className={
                            // 如果快捷金额超过支付方最大金额或小于支付方最小金额，成灰色显示，并无法点击。
                            Number(this.state.PayMentBank.MaxAmount)<Number(item)||
                            Number(this.state.PayMentBank.MinAmount)>Number(item)?"invalid":
                            (parseInt(this.state.depositMoney)===Number(item)?"active":"")
                        } 
                        onClick={()=>changeDepositMoney(JSON.stringify(item))}>{item}元
                    </span>
                )
            }
        )
        return(
            <div className='qucikPay flexWrap'>
                {/* <label>{this.state.PayMentBank.FixedAmount?"固定":"快捷"}金额：</label> */}
                <label></label>
                <div className='quickBox'>
                    {QuickDom}
                </div>
            </div>
        )
    }
    render(){
        if(this.props.getAllPay.length<1){
            return(
                <div className='DDD'>
                    <div className='imgs'></div>
                    <p className='bindtobank'>尚未支付方式</p>
                </div>  
            )
        }
        return(
            <div className='depositNew'>
                <ul className='payMents clearfix'>
                    {this.renderPaymentMethod()}
                </ul>
                {
                    /*
                        三种支付方式，银行转账，在线支付，在线网银。
                        在线支付，在线网银两种支付情况：
                        1、返回二维码，并显示于网页中。
                        2、返回链接，跳转第三方网站。
                        isOenpLink：当前支付方式为第三方链接，
                    */ 
                    this.state.isOenpLink?
                    (
                        this.state.isLoading?
                        <div className="loading-container" style={{"textAlign":"center","color":"black"}}>
                            <Spin wrapperClassName="loadText" tip="拼命加载二维码中..."/>
                        </div>
                        :
                        <div>
                            {/* 支付类型提示语 */}
                            {this.state.hint && <p className='hint'>{this.state.hint}</p>}
                            {
                                // 如果当前支付银行数小于2，固隐藏。
                                this.state.payBanks.length===1 || this.state.payBanks.length<1?
                                null:
                                <p className='flexWrap'>      
                                    <label>支付方式：</label>           
                                    {this.renderPayBank()}
                                </p>                            
                            }                  
                            {
                                // 如果不存在固定金额，可以输入存款金额
                                !this.state.PayMentBank.FixedAmount?
                                <p className='flexWrap'>                 
                                    <label>存款金额：</label>
                                    <input value={this.state.depositMoney} 
                                    onChange={e=>this.handleChangeInputVal(e,'depositMoney')} 
                                    placeholder="请输入存款金额" type="number" id='addMoneys'/>
                                    {
                                        this.state.payType===2&&<button className='Preservation' onClick={()=>copyCode('addMoneys')}>复制</button>
                                    }
                                    {
                                        this.state.PayMentBank.MinAmount &&
                                        <span className="FontColor">*单笔转账限额 
                                        {this.state.PayMentBank.MinAmount}.00~{this.state.PayMentBank.MaxAmount}.00元</span>
                                    }
                                    <Link className="depositAd" to="/help/help/cunkuan"> 点击查看存款教程</Link>
                                </p> 
                                :null                                      
                            }     
                            {/* 银行转账支付信息表单 */}
                            {this.state.showBankForm && this.renderDepositForm()}
                            {
                                this.state.payType===2&&this.props.backConfigs.isDecimal&&
                                <p className='kjnotice'>温馨提示：为了方便您能快速存款，（快捷/固定）金额选取的金额数会随机加入两位小数。</p>
                            }
                            {/* 快捷金额或固定金额 */}
                            {this.renderQuickPay()}
                            {/* 提示语 */}
                            {this.state.payTips && <ins className="remindTexts FontColor">{this.state.payTips}</ins>}        
                            {
                                // payType2为银行转账，1为第三方支付，只有银行转账有下一步，固用state.showBankForm控制显示隐藏。
                                Number(this.state.payType)===2&&!this.state.showBankForm?
                                <button className='SubBut' onClick={this.NextStep.bind(this)} disabled={this.state.payBanks.length<1}>下一步</button>:
                                <button className='SubBut' onClick={this.howToPay.bind(this)} disabled={this.state.payBanks.length<1}>存款</button>
                            }                                                                      
                        </div>                
                    ):
                    //渲染在线支付，在线网银发送API后返回的二维码图。
                    this.renderThirdDom()
                }                        
            </div>
        )
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    getAllPay:state.getAllPay.PayList,
    QuickPrice:state.getAllPay.QuickPrice,
    user: state.user,
    remoteSysConfs:state.remoteSysConfs,
    backConfigs:state.backConfigs
});

export default withRouter(connect(mapStateToProps)(Deposit));
