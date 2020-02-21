import React from "react";
import { connect } from "react-redux";
import { withRouter, NavLink, Route, Redirect, Switch,Link } from 'react-router-dom';
import LoadComponentAsync from "@/LoadComponentAsync"
import {checkIndex} from "tollPlugin/commonFun";
import "./myCenter.scss"
import { Icon,message } from 'antd';

interface Store {
    [key:string]:any;
}
type RouteType = {
    path:string,
    name:string
}
type Routes = RouteType[]
type Safe = {
    className:string,
    key:string,
    verfyPhone?:string,
    verfyEmail?:string,
    realName?:string,
    bankAccounts?:any[],
    notice?:string,
    service?:string,
    path?:any
}
type Platforms = {
    Balance?:number,
    ID:string,
    Enabled:boolean
}

class MyCenter extends React.Component<Store> {
    public routes:Routes = [
        {path:"deposit",name:"存款",},
        {path:"withdraw",name:"取款",},
        {path:"transfer",name:"转账",},
        {path:"transaction",name:"交易记录",},
        {path:"betting",name:"投注记录",},
        {path:"bank",name:"银行",},
        {path:"userInfo",name:"个人资料",},
        {path:"promote",name:"推广链接",},
        {path:"news",name:"消息中心",},
        {path:"Feedback",name:"意见反馈",},
    ]
    public state= {
        allMoneyState:false,// 点击一键转出时是否显示Loading
        safeItem:"",// 提示语
        transferAllOutState:true,//防止一键转出按钮连续点击
        platArr:[],// 平台ID
    }
    constructor(props: any) {
        super(props,[])
    }
    // 绑定信息
    safetyLevel(){
        let safety:Safe[] = [
            {
                className:this.props.user.verfyPhone?"has tel":"tel",
                key:"tel",
                notice:"提示：为了享受更便捷的手机app服务，请先",
                service:"手机",
                path:"/myCenter/userInfo/phonePwd"
            },
            {
                className:this.props.user.verfyEmail?"has email":"email",
                key:"email",
                notice:"提示：为了享受更便捷的找回密码服务，请先",
                service:"邮箱",
                path:"/myCenter/userInfo/emailPwd"
            },
            {
                className:this.props.user.realName?"has info":"info",
                key:"info",
                notice:"提示：为了享受更便捷的提款服务，请先",
                service:"真实姓名" ,
                path:"/myCenter/userInfo/personal"             
            },
            {
                className:this.props.user.bankAccounts.length>0?"has banks":"banks",
                key:"banks",
                notice:"提示：为了享受更便捷的提款服务，请先",
                service:"银行卡",
                path:"/myCenter/bank"
            }
        ]
        let ret:Array<JSX.Element> = [];
        for(let i=0;i<safety.length;i++){
            let item:Safe = safety[i];
            ret.push(
                <li key={item.key} onMouseOver={()=>{this.setState({safeItem:item.key})}} onMouseOut={()=>{this.setState({safeItem:""})}}>
                    <a><i className={item.className}></i></a>
                    {
                        item.className.includes('has')?null:
                        <span style={{display:this.state.safeItem===item.key?"block":"none"}}>
                            {item.notice}
                            <Link to={item.path}>绑定{item.service}</Link>
                        </span>                        
                    }
                </li>
            )
        }
        return ret
    }
    // 平台等级，以下骚操作，请勿模仿。
    safeLevel(){
        let lv = 0;
        if(this.props.user.verfyPhone){
            lv+=1;
        }
        if(this.props.user.verfyEmail){
            lv+=1;
        }
        if(this.props.user.realName){
            lv+=1;
        }
        if(this.props.user.bankAccounts.length>0){
            lv+=1;
        }
        if(lv===4){
            return "安全"
        }else if(lv===3){
            return "高"
        }else if(lv===2){
            return "中"
        }else{
            return "低"
        }
    }
    // 清除loading
    clearLoadingIDs(id:string){
        // 为了异步刷新转账页，这里我们需要先通过数组中的值找到对应下标
        let platindex = checkIndex<string>(this.state.platArr,id);
        let loadingIdsArr = this.state.platArr;
        loadingIdsArr.splice(platindex,1)
        this.setState({
            platArr:loadingIdsArr
        },()=>{
            // 取消该平台的loading
            window.actions.OneClickRefresh(this.state.platArr);
            if(this.state.platArr.length<1){
                new window.actions.ApiPlayerInfoAction().fly();
                this.setState({ // 打开一键刷新开关
                    transferAllOutState:true,
                    allMoneyState:false
                })
            }           
        })
    }
    transferAllOut(platforms:Platforms[]) {
        let transferArr:Platforms[] = platforms; 
        // 如果游戏总财富余额不大于1，则不转出。
        if(transferArr.length === 0) {
            let obj:any = {};
            obj.type="message";
            obj.msgType = "error";
            obj.title = "错误";
            obj.message = "当前没有可转出的余额";
            var d:any = new Date();
            obj.created = d.format("yyyy/MM/dd hh:mm:ss");
            obj.startTime = d.getTime();
            window.actions._dispatch(obj)
            this.setState({
                transferAllOutState:true,
                allMoneyState:false
            })
            message.error('当前没有余额大于1的平台', 1);
            return
        }
        // 新写法
        let obj:{
            [key:string]:number
        } = {};// 转出平台-参数
        let arrIds:any[] = []; // 筛选转出的平台ID
        for(let b = 0;b<transferArr.length;b++){
            let Balance = transferArr[b].Balance as number;
            obj[transferArr[b].ID] = Balance;
            arrIds.push(transferArr[b].ID)
        }
        this.setState({         // 改变状态，重新渲染
            platArr:arrIds
        },()=>{
            new window.actions.ApiTransferOutAction(obj).fly((resp:{StatusCode:number,Success:boolean,Message:string})=>{ // 一键转出API
                if (resp.StatusCode === 0 || resp.Success === true) {
                    window.actions.OneClickRefresh(this.state.platArr) // 用于转账页的异步LOADING，把需要刷新的平台放入状态。
                    for(let i=0; i<transferArr.length;i++){
                        let platform:Platforms = transferArr[i];
                        // 每个平台依次查询余额。
                        new window.actions.ApiGamePlatformBalanceAction(platform.ID).fly(()=>{ // 依次查询余额
                            this.clearLoadingIDs(platform.ID)
                        },platform.ID)     
                    }
                }else{
                    message.error(resp.Message);
                    this.setState({ // 打开一键刷新开关
                        transferAllOutState:true,
                        allMoneyState:false
                    })
                }
            })
        })


        // 以下是曾经的写法
        /*
        // 把ID筛选出来
        let arrIds:any[] = []
        for(let b = 0;b<transferArr.length;b++){
            arrIds.push(transferArr[b].ID)
        }
        this.setState({
            platArr:arrIds
        },()=>{
            window.actions.OneClickRefresh(this.state.platArr) // 用于转账页的异步LOADING，把需要刷新的平台放入状态。
            // 我们依次对需要余额大于1的平台进行转出操作。
            for(let i=0; i<transferArr.length;i++){
                let platform:any = transferArr[i];
                let index = i+1;
                // 转出API
                new window.actions.ApiTransferAction (platform.ID,"out",parseInt(platform.Balance),false).fly((resp:any)=>{
                    if (resp.StatusCode === 0) {
                        // 每次转出一个平台，刷新该平台余额。
                        new window.actions.ApiGamePlatformBalanceAction(platform.ID).fly(()=>{
                            this.clearLoadingIDs(platform.ID)
                        },platform.ID)
                    }else{
                        this.clearLoadingIDs(platform.ID)
                    }
                    if( index === transferArr.length){             
                        // 打开一键刷新开关
                        this.setState({
                            transferAllOutState:true,
                            allMoneyState:false
                        })
                    }
                }, "transfer_" + platform.ID);
            }            
        })
        */
    }
    // 一键转出
    allTrans(){
        if(!this.state.transferAllOutState)return;
        if(this.props.platforms.length<1){
            message.error('平台余额获取中，稍后尝试',5)
            return
        }
        this.setState({
            transferAllOutState:false,
            allMoneyState:true
        })
        // 筛选平台
        let platforms:Platforms[] = [];
        for(let i=0;i<this.props.platforms.length;i++){ // 我们依次对需要余额大于1的平台进行转出操作。
            let platformData:Platforms = this.props.platforms[i];
            if(platformData.Enabled && (platformData.Balance && +platformData.Balance>=1)){
                platforms.push(platformData)
            }         
        }
        this.transferAllOut(platforms)
    }
    render() {
        let safeLv = this.safeLevel();
        return (
            <div className="MyCenter clearfix">
                <div className='wrap'>
                    <div className='accountNav'>
                        <div className='head'>
                            <div className='portrait'>
                                <i></i>
                            </div> 
                            <div className='user'>
                                <span>{this.props.user.UserName}</span>
                                <p>{this.props.user.userLevelName}</p>
                            </div>
                        </div>
                        <title className='title'>财务中心</title>
                        <ul>
                            {
                                this.routes.slice(0,6).map((item:RouteType)=>{
                                    return(
                                        <li key={item.name}>
                                            <NavLink activeClassName='active' to={`/myCenter/${item.path}`}>
                                                <i className={item.path}></i>
                                                <span>{item.name}</span>       
                                            </NavLink>                                            
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <title className='title'>个人中心</title>
                        <ul>
                            {
                                this.routes.slice(6,10).map((item:RouteType)=>{
                                    return(
                                        <li key={item.name}>
                                            <NavLink activeClassName='active'to={`/myCenter/${item.path}`}>
                                                <i className={item.path}></i>
                                                <span>{item.name}</span>       
                                            </NavLink>                                            
                                        </li>
                                    )
                                })                                
                            }
                            <li>
                                <Link to="/help/help/help">
                                    <i className="bangzhu"></i>
                                    <span>帮助中心</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className='centerDetail'>
                        <section className='userBasic'>
                            <div className='lb'>
                                <div className='infos'>
                                    <span className='mm'>
                                        <span>账户余额 : </span>
                                        <strong>{this.props.user.amount}</strong>
                                    </span>
                                    <i>
                                        {
                                            this.state.allMoneyState?
                                            <Icon type="loading" theme="outlined" style={{color:"#00aeff"}}/>:
                                            <i className='loading' onClick={this.allTrans.bind(this)}></i>
                                        }
                                       
                                    </i>
                                    <a onClick={this.allTrans.bind(this)}>一键回收</a>
                                    <span className='mNotice'>(游戏前，请将余额转到相应场馆)</span>
                                </div>
                            </div>
                            <div className='rb'>
                                <div className='userSafe'>
                                    <div className='lv'>
                                        账户安全等级：
                                        <span>{safeLv}</span>
                                    </div>
                                    <div className='how'>
                                        <ul>
                                            {this.safetyLevel()}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <div className='accountRight'>
                            <Switch>
                                {
                                    this.routes.map((item:RouteType,i:number)=>{
                                        if(i===0){
                                            return(
                                                <Route exact key={`route+${item.path}`} path={`/*/${item.path}`} render={()=><LoadComponentAsync key={item.path} componentPath={item.path} />}/>                    
                                            )
                                        }
                                        return(                                     
                                            <Route key={`route+${item.path}`} path={`/*/${item.path}`} render={()=><LoadComponentAsync key={item.path} componentPath={item.path} />}/>
                                        )
                                    })
                                }
                                <Redirect from="/*" to="/*/userInfo/personal" />
                            </Switch>                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


const mapStateToProps = (state: any, ownProps: any) => ({
    user:state.user,
    platforms:state.game.platforms
});

export default withRouter(connect(mapStateToProps)(MyCenter));
