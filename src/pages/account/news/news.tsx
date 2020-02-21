import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import { Collapse  } from 'antd';
import { getNowDate } from "tollPlugin/commonFun";
import Pagination from "components/pagination/Pagination";
import "./news.scss"

type State  = {
    tabActive:string
}

class News extends BaseClass {
    public state:State = {
        tabActive:"通知"
    }
    constructor(props: any) {
        super(props, [])
    }
    changeTab(val:string){
        this.setState({
            tabActive:val
        })
    }
    componentDidMount(){
        this.toPage()
        new window.actions.ApiNoticeAction().fly()
        new window.actions.ApiReadAllSiteMsgAction().fly(()=>{
            new window.actions.ApiSitemsgUnreadCountAction().fly()
        })
    }
    // API
    toPage(pageNo = 0,NeedAlert:boolean=false) {  
        new window.actions.ApiQueryHistoryAction(
            {
                FromDateTime:getNowDate(-30),
                ToDateTime:getNowDate(0),
                PageIndex:pageNo,
                TimeZone:8
            },
            "站内信",
            NeedAlert
        ).fly();
    }
    renderRecords(){
        let ret:JSX.Element[] = [];
        const Panel = Collapse.Panel;
        let RecordsRows:any[] = [];
        if(this.state.tabActive==="通知"){
            RecordsRows = this.props.records.rows;
        }else if(this.state.tabActive==="公告"){
            RecordsRows = this.props.notices;
        }
        for (let i = 0; i < RecordsRows.length; i++) {
            var msg = RecordsRows[i];
            ret.push(
                <Panel header={msg.Title} key={i+1}>
                    <div dangerouslySetInnerHTML={{__html:msg.Message?msg.Message:msg.Content}}></div>
                    <p >{msg.SendTime?msg.SendTime.replace('T',' '):msg.CreateTime.replace('T',' ')}</p>
                </Panel>
            );
        }    
        return(
            <div className='msgs'>
                <Collapse accordion={true} defaultActiveKey={[1]}>
                    {ret}
                </Collapse>                   
            </div>      
        )
    }
    PagingCallback(val:number){
        this.toPage(val)
    }
    render() {
        let total = this.state.tabActive==="通知"?this.props.records.total:0;
        return (
            <div className="news">
                <h2>消息中心</h2>
                <div className='tab'>
                    <div className='box'>
                        <a className={this.state.tabActive==="通知"?"active":""} 
                        onClick={this.changeTab.bind(this,'通知')}>通知
                        {/* <span>4</span> */}
                        </a>
                        <a className={this.state.tabActive==="公告"?"active":""}  
                        onClick={this.changeTab.bind(this,'公告')}>公告</a>
                    </div>
                </div>
                <div className='tabeldiv'>              
                    {this.renderRecords()}              
                </div>
                <Pagination
                    portion={10}
                    callBackFunc={this.PagingCallback.bind(this)}
                    Count={total}>
                ></Pagination>     
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    records:state.records.myMsgsRecords,
    notices:state.notices
});

export default withRouter(connect(mapStateToProps)(News));
