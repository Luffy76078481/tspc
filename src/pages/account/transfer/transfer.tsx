import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Modal,Icon} from 'antd';
import BaseClass from '@/baseClass';
import "./transfer.scss";

/*
    最强生物-凯多。
    最强人类白胡子！
    转账页面-业务逻辑麻烦度：★★★★
*/

type Res = {
    StatusCode:number
}
class Transfer extends BaseClass {
    constructor(props: any) {
        super(props, [])
        this.state={
            autoTransfer: this.props.user.AutoTransfer, // 是否开启自动转账模式。
            from:"main", // 转出Select选框值
            to:"main", // 转入Select选框值
            amount:"0", // 转账Input框输入金额
            reqLock:false, // 转出转入按键-锁
            allLoading:true, // 所有平台余额刷新时Loading
        }
    }
    componentDidMount(){
        if(this.props.platforms[0].Balance!==undefined){
            this.setState({
                allLoading:false
            })
        }
        // 请求API。
        new window.actions.ApiGamePlatformAllBalanceAction().fly(()=>{
            this.setState({
                allLoading:false,// loading解除
            })
        }); //所有平台余额           

    }
    //切换自动转账状态
    switchAutotransfer = ()=> { 
        new window.actions.ApiUpdateTransferSettingAction(this.state.autoTransfer === 0?1:0).fly((res:Res)=>{
            if(res.StatusCode === 0){
                this.setState({
                    autoTransfer: !this.state.autoTransfer,// 切换状态
                })
                new window.actions.ApiPlayerInfoAction().fly();
            }
        });
    }
    //拿到每个相应平台的余额或主账户余额
    getBalance(id:any) {
        var ret = 0;
        if (id === "main") {       
            ret = this.props.user.amount || 0;
        } else {
            for (var i = 0; i < this.props.game.platforms.length; i++) {
                var p = this.props.game.platforms[i];
                if (p.ID === id) {
                    ret = p.Balance || 0;
                    break;
                }
            }
        }
        return Math.floor(ret);
    }
    // 转出或转入提交
    onSubmit(e:any){
        e.preventDefault();
        let from = this.state.from;// 转出
        let to = this.state.to; // 转入
        if(this.props.refreshLoading.length>0){
            Modal.error({
                title:"错误提示",
                content:"待上笔转账完成后再进行操作",
                okText: "确定",
            })
            return;          
        }
        if (!from || !to) { // 判空-如果无转出转入的平台
            Modal.error({
                title:"错误提示",
                content:"转入转出项必须填写",
                okText: "确定",
            })
            return;
        }
        //判重
        if (from === to) { // 判重-同平台不能转入
            Modal.error({
                title:"错误提示",
                content:"转入转出项不能相同",
                okText: "确定",
            })
            return;
        }
        let fromBalance = this.getBalance(this.state.from);// 主账户余额，或游戏余额
        //判小
        if (fromBalance <1) {
            Modal.error({
                title:"错误提示",
                content:"转出项可用金额必须大于1",
                okText: "确定",
            })
            return;
        }
        //判大
        if (!this.state.amount || Number(this.state.amount)<1 || this.state.amount > fromBalance) {
            Modal.error({
                title:"错误提示",
                content:"输入金额必须大于0并且小于转出可用金额",
                okText: "确定",
            })
            return;
        }
        if(this.state.reqLock)return; // 锁
        this.setState({
            reqLock:true,// 关锁
        })
        var next = (platformsId:any) => {
            if (this.state.to !== "main") {
                new window.actions.ApiTransferAction (this.state.to, "in", this.state.amount).fly((resp:any)=>{
                    if (resp.StatusCode === 0) {
                        this.getGameBalance(platformsId,true);            
                    }
                    this.setState({
                        reqLock:false         
                    })
                });
            }else{
                this.getGameBalance(platformsId,true);
                this.setState({
                    reqLock:false         
                })  
            }
        }
        // 从平台转出到主账户
        if (this.state.from !== "main") {
            new window.actions.ApiTransferAction (this.state.from, "out", this.state.amount).fly((resp:any)=>{
                this.setState({
                    reqLock:false         
                })
                if (resp.StatusCode === 0) {
                    next(from);
                }
            });
        } 
        // 从主账户转入到游戏平台
        else {
            next(to);   
        }
    }
    // 转入或转出切换
    onChangeFromOrTo(type:string,e:any) {   
        if(type==='from'){
            this.setState({
                to:"main",
                [type]:e.target.value
            })
        }else if(type==='to'){
            this.setState({
                from:"main",
                [type]:e.target.value
            })          
        }else{
            this.setState({
                [type]:e.target.value
            })              
        }
    }
    // 平台转账选择
    renderPlatformSelect() {
        var ret = [];
        ret.push(<option key="main" value="main">主帐户</option>);
        let platforms = this.props.platforms.filter((item:any)=>{
            if(item.Enabled)return item
            else return null
        })
        for (var i = 0; i < platforms.length; i++) {
            var platform = platforms[i];
            if(platform.Name === 'YOPLAY'){ continue }
            ret.push(
                <option disabled={platform.Maintain} 
                key={i} value={platform.ID} style={platform.Maintain?{"color":"#ccc"}:{}}>{platform.Name}</option>
            )
        }
        return ret;
    }
    // 获取单个平台余额，转账后刷新
    getGameBalance(BalanceId:any,getUserAmount:boolean=false){
        window.actions.OneClickRefresh([BalanceId])
        new window.actions.ApiGamePlatformBalanceAction(BalanceId).fly(()=>{
            window.actions.OneClickRefresh([])
            if(getUserAmount){
                new window.actions.ApiPlayerInfoAction().fly(); // 会员信息API
            }
        },BalanceId)
    }
    // 一键转入
    transIntoGame(val:any){
        if(this.props.user.amount<1){
            Modal.error({
                title:"错误提示",
                content:"当前余额不足1元，无法转入！",
                okText: "确定",
            }) 
            return
        }
        if(this.props.refreshLoading.length>0){
            Modal.error({
                title:"错误提示",
                content:"待上笔转账完成后再进行操作",
                okText: "确定",
            })
            return;
        }
        // 插入需要刷新Loading的平台
        window.actions.OneClickRefresh([val.ID])
        setTimeout(()=>{
            new window.actions.ApiTransferAction(val.ID,"in",parseInt(this.props.user.amount)).fly(()=>{   // ('转账完成')            
                new window.actions.ApiPlayerInfoAction().fly(()=>window.actions.OneClickRefresh([]));
                new window.actions.ApiGamePlatformBalanceAction(val.ID).fly()//  ('获取用户余额')
            },10)
        })   
    }
    // 交换转出-转入
    changeFromAndTo(){
        let toVal = this.state.to;
        let fromVal = this.state.from;
        this.setState({
            to:fromVal,
            from:toVal
        })
    }
    // 渲染游戏平台
    platformsBalance(){
        let ret = [];
        // 过滤过掉的平台
        let platforms = this.props.platforms.filter((item:any)=>{
            if(item.Enabled)return item;// 各个平台
            else return null
        })
        // 渲染
        for (var i = 0; i < platforms.length; i++) {
            var platform = platforms[i];
            if( platform.Name === 'YOPLAY' ){ 
                continue 
            }
            let noteDOM;
            if(platform.Maintain){
                noteDOM=(<i style={{'color':"#ff0000","fontSize":"16px"}}>平台维护中...</i>)
            }else{
                if(this.state.allLoading){
                    noteDOM=(<Icon type="loading" spin />)
                }else if(this.props.refreshLoading.indexOf(platform.ID)!==-1){     
                    noteDOM=(<Icon type="loading" spin />)
                }else{        
                    noteDOM=(<i>￥{platform.Balance.toFixed(2) || 0}</i>)
                }    
            }
            ret.push(
                <li key={i}>
                    <div className='gt'>
                        <div>{platform.Name}</div>
                        <div onClick={this.transIntoGame.bind(this,platform)}>
                            {platform.Maintain?null:<button>一键转入</button>}
                        </div>
                    </div>
                    <div className='gb'>
                        {noteDOM}
                    </div>
                </li>
            )
        }             
        return ret
    }
    render() {
        return (
            <div className="Transfer">
                <div className='transT clearfix'>
                    <div className='transTL'>
                        <b>转账</b>
                        <span>场馆钱包和场馆钱包之间不可以互转</span>
                    </div>
                    <div className='transRL'>
                        <div className='modelBG'>
                            <a 
                            className={`${!this.state.autoTransfer?"active":""}`} 
                            onClick={this.state.autoTransfer?this.switchAutotransfer:()=>{return}}>普通模式</a>
                            <a 
                            className={`${this.state.autoTransfer?"active":""}`} 
                            onClick={!this.state.autoTransfer?this.switchAutotransfer:()=>{return}}>免转模式</a>
                        </div>
                    </div>
                </div>
                <div className='transM clearfix'>
                    <div className='allM'>
                        <span>总财富：</span>
                        <b>{this.props.user.userBalance?this.props.user.userBalance:<Icon type="loading" spin />}</b>
                    </div>
                    <div className='gameM'>
                        <span>游戏余额：</span>
                        <b>{this.props.game.gameMoney?this.props.game.gameMoney:<Icon type="loading" spin />}</b>
                    </div>
                </div>
                {
                    !this.state.autoTransfer?
                    <div className='transB clearfix'>
                        <form onSubmit={this.onSubmit.bind(this)}>
                            <div>
                                <label>转出：</label>  
                                <div className='flBox'>
                                    <select onChange={this.onChangeFromOrTo.bind(this,'from')} value={this.state.from}>                  
                                        {this.renderPlatformSelect()}                                            
                                    </select>   
                                </div>           
                            </div>    
                            <i className='icontrans' onClick={this.changeFromAndTo.bind(this)}></i>    
                            <div>
                                <label>转入：</label>       
                                <div className='flBox'>
                                    <select onChange={this.onChangeFromOrTo.bind(this,'to')} value={this.state.to}>
                                        {this.renderPlatformSelect()}
                                    </select>  
                                </div>       
                            </div>           
                            <div className='mbox'>
                                <label>金额：</label>
                                <input onChange={this.onChangeFromOrTo.bind(this,'amount')} type="number" placeholder="请输入转账金额"/>
                                <button className='SubBut'>确认并提交</button>  
                            </div>                     
                        </form>
                    </div>   :null                
                }

                <div className='platformsContents'>
                    <ul>
                        {this.platformsBalance()}
                    </ul>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user,
    game: state.game,
    platforms: state.game.platforms,
    refreshLoading:state.refreshLoading
});

export default withRouter(connect(mapStateToProps)(Transfer));
