import React from "react";
import "./record.scss"
import { DatePicker } from 'antd';
import moment from 'moment'; 
import Pagination from "components/pagination/Pagination";
const { RangePicker } = DatePicker; // Antd日历选择框其中一种

type Props = {
    [key:string]:any,
}
type Time = {
    date:string,
    key:number
}
interface RecordState{
    timeActive:Time, 
    type:string,
    calendarTime:any[],
    GamePlatform:string,
    timeZone:number
}

export default class Record extends React.Component<Props> {
    public state:RecordState;
    public timeZones = [{time:'美东时间',Id:-4},{time:'北京时间',Id:8}];  
    public tiems:Time[]  = [{date:"今日",key:0},{date:"昨日",key:1},{date:"近7日",key:2},{date:"近30日",key:3}];  
    constructor(props:any) {
        super(props)
        this.state={
            timeActive:{date:"近7日",key:2}, // 快捷时间
            type:"", // 记录类型
            // antd 日历插件值
            calendarTime:[
                moment().subtract(7,'day').hours(0).minutes(0).seconds(0),
                moment().subtract(0,'day').hours(23).minutes(59).seconds(59)
            ],
            GamePlatform:"",//平台
            timeZone:8
        }
    }
    // 平台
    renderPlatforms(){
        var ret = [];  
        for (var i = 0; i < this.props.game.platforms.length; i++) {
            var platform = this.props.game.platforms[i];
            if(platform.Name === "YOPLAY")
            continue;
            ret.push(
                <option key={i} value={platform.Id}>{platform.Name}</option>
            );
        }
        return ret;
    }
    // 改变时间
    changeTime(val:Time){
        this.setState({
            timeActive:val
        })
        if(val.key===0){
            this.setState({
                calendarTime:[
                    moment().startOf('day'),
                    moment().endOf('day')
                ]            
            })
        }else if(val.key===1){
            this.setState({
                calendarTime:[
                    moment().subtract(1,'day').hours(0).minutes(0).seconds(0),
                    moment().subtract(1,'day').hours(23).minutes(59).seconds(59)
                ]            
            })
        }else if(val.key===2){
            this.setState({
                calendarTime:[
                    moment().subtract(6,'day').hours(0).minutes(0).seconds(0),
                    moment().subtract(0,'day').hours(23).minutes(59).seconds(59)
                ]            
            })
        }else if(val.key===3){
            this.setState({
                calendarTime:[
                    moment().subtract(29,'day').hours(0).minutes(0).seconds(0),
                    moment().subtract(0,'day').hours(23).minutes(59).seconds(59)
                ]            
            })
        }
    }
    // 时间
    renderTime(){
        return this.tiems.map((item:Time,i:number)=>{
            return (
            <li key={i} className={this.state.timeActive.key===item.key?"active":""} 
            onClick={this.changeTime.bind(this,item)}>{item.date}</li>
            )
        })
    }
    // 改变日历
    onChange(dates:any, dateStrings:string[]) {
        this.setState({
            calendarTime:[
                moment(dates[0].format('YYYY-MM-DD HH:mm:ss')),
                moment(dates[1].format('YYYY-MM-DD HH:mm:ss')),
            ],
            stringTime:[
                dateStrings[0],
                dateStrings[1]
            ]
        }) 
    }
    // 日历
    renderCalendar(){
        return(
            <div className='Calendar'>
                <RangePicker
                    ranges={{
                        '近24小时': [moment(), moment()],
                        '本月': [moment().startOf('month'), moment().endOf('month')],
                    }} // 你会发现日历上有个快捷按钮，今天和本月
                    showTime // 展示可以选择时间-精确到秒
                    format="YYYY/MM/DD HH:mm:ss" 
                    onChange={this.onChange.bind(this)} // 选择日期时
                    value={this.state.calendarTime} // 值
                />    
                <button className='SubBut' onClick={this.toPage.bind(this,0,false)}>查询</button>                     
            </div>       
        )
    }
    // API
    toPage(pageNo = 0,NeedAlert:boolean=false) {  
        new window.actions.ApiQueryHistoryAction(
            {
                FromDateTime:this.state.calendarTime[0].format('YYYY-MM-DD HH:mm:ss'),
                ToDateTime:this.state.calendarTime[1].format('YYYY-MM-DD HH:mm:ss'),
                GamePlatform:this.state.GamePlatform,
                PageIndex:pageNo,
                TimeZone:this.state.timeZone,
            },
            this.state.type+"记录",
            NeedAlert
        ).fly();
    }
    PagingCallback(pageNo:number){
        this.toPage(pageNo)
    }
    timeZoneChange(e:any){
        this.setState({
            timeZone:e.target.value
        })
    }
    renderTimeZone(){
        let ret:JSX.Element[] = [];
        this.timeZones.map((item:any,i:number)=>{
            return ret.push(
            <option key={item.Id} value={item.Id}>{item.time}</option>
            )
        })
        return(
            <select onChange={this.timeZoneChange.bind(this)} value={this.state.timeZone}>
                {ret}
            </select>
        )
    }
    renderPaging(){
        let total:number = 0;
        if(this.state.type==='存款'){
            total = this.props.records.depositRecords.total;
        }else if(this.state.type==='取款'){
            total = this.props.records.withdrawRecords.total;
        }else if(this.state.type==='优惠'){
            total = this.props.records.myPromoRecords.total;
        }else if(this.state.type==='转账'){
            total = this.props.records.transferRecords.total;
        }else if(this.state.type==='投注'){
            total = this.props.records.betRecords.total;
        }
        return(
            <Pagination
                portion={10}
                callBackFunc={this.PagingCallback.bind(this)}
                Count={total}>
            ></Pagination>                  
        )
    }
}

