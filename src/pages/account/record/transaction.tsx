import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import Record from "./record"

class Transaction extends Record {
  // 改变交易类型
  changeType(val:string){
    this.setState({
      type:val
    },()=>{
      this.toPage()
    })
  }
  componentDidMount() {
 
     
    this.setState({
      type:"存款",
      timeZone:8
    },()=>{
      this.toPage();
    })
  }
  // 交易类型
  renderType(){
    return ['存款','取款','优惠','转账'].map((item:string,i:number)=>{
      return(
      <li key={i} className={this.state.type===item?"active":""} onClick={this.changeType.bind(this,item)}>{item}</li>
      )
    })
  }
  // 表单头部
  renderHeader(){
    if(this.state.type==="存款"){
      return(
        <tr>
          <th>存款单号</th>
          <th>存款方式</th>
          <th>存款金额</th>
          <th>存款状态</th>
          <th>时间</th>
        </tr>  
      )
    }else if(this.state.type==="取款"){
      return(
        <tr>
          <th>取款单号</th>
          <th>取款金额</th>
          <th>取款状态</th>
          <th>时间</th>
      </tr>
      )
    }else if(this.state.type==="优惠"){
      return(
        <tr>
          <th>优惠内容</th>
          <th>优惠金额</th>
          <th>时间</th>
      </tr>         
      )
    }else if(this.state.type==="转账"){
      return(
        <tr>
          <th>游戏类别</th>
          <th>操作方式</th>
          <th>操作金额</th>
          <th>状态</th>
          <th>时间</th>
        </tr>           
      )
    }
    return <tr></tr>
  }
  // 表单内容
  renderRecords(){
    let ret:JSX.Element[] = [];
    if(this.state.type==="存款"){
      for (let i= 0; i< this.props.records.depositRecords.rows.length;i++){
        let log = this.props.records.depositRecords.rows[i];
        ret.push(<tr key={i}>
                <td >{log.OrderNo}</td>
                <td >{log.TypeText}</td>
                <td >{log.Amount}</td>
                <td >{log.StatusText}</td>
                <td >{log.CreateTime.replace("T"," ")}</td>
            </tr>
        );
    }
    if (ret.length === 0) {
        ret.push(
            <tr key="no_msg">
                <td colSpan={5}>很抱歉，没有您查找的记录.</td>
            </tr>
        );
    }
    }else if(this.state.type==="取款"){
      for (let i= 0; i< this.props.records.withdrawRecords.rows.length ; i++){
          let log = this.props.records.withdrawRecords.rows[i];
          ret.push(<tr key={i}>
                  <td >{log.OrderNo}</td>
                  <td >{log.Amount}</td>
                  <td >{log.StatusText}</td>
                  <td >{log.CreateTime.replace("T"," ")}</td>
              </tr>
          );
      }
      if (ret.length === 0) {
          ret.push(
              <tr key="no_msg">
                  <td colSpan={4}>很抱歉，没有您查找的记录.</td>
              </tr>
          );
      }
    }else if(this.state.type==="优惠"){
      for (let i= 0; i< this.props.records.myPromoRecords.rows.length ; i++){
        let log = this.props.records.myPromoRecords.rows[i];
          ret.push(
              <tr key={i}>
                  <td >{log.BonusName}</td>
                  <td >{log.Amount}¥</td>
                  <td >{(log.OperatTime.replace('T',' '))}</td>
              </tr>
          );
      }
      if (ret.length === 0) {
          ret.push(
              <tr key="no_msg">
                  <td colSpan={3}>很抱歉，没有您查找的记录.</td>
              </tr>
          );
      }
    }else if(this.state.type==="转账"){   
      for (var i= 0; i< this.props.records.transferRecords.rows.length ; i++){
        var log = this.props.records.transferRecords.rows[i];
        ret.push(
          <tr key={i}>
            <td>{log.GameType}</td>
            <td>{log.TypeText}</td>
            <td>{log.Amount}</td>
            <td>{log.StatusText}</td>
            <td>{log.CreateTime.replace("T"," ")}</td>
          </tr>
        );
      }
      if (ret.length === 0) {
          ret.push(
            <tr key="no_msg">
              <td colSpan={5}>很抱歉，没有您查找的记录.</td>
            </tr>
          );
      }
    }
    return ret
  }
  render() {
    return (
      <div className="records">
          <div className='recordTlt'>
            <h3>交易记录</h3>
            <span>只显示近一个月的交易记录，如需更多信息请联系客服查询</span>
          </div>     
          <div className='recordsWrap'>
            <div className='recordType'>
              <div className='labels'>交易类型：</div>
              <ul className='typeUl'>
                {this.renderType()}
              </ul>
            </div>
            <div className='recordTime'>
              <div className='labels'>交易时间：</div>
              <ul className='timeUl'>
                {this.renderTime()}
              </ul>
            </div>
            <div className='timeZone'>
              <div className='labels'>时区选择：</div>    
              {this.renderTimeZone()}
            </div>
            <div className='cal'>
              <div className='labels'>时间筛选：</div>     
              {this.renderCalendar()}       
            </div>
          </div>
          <table>
            <thead>
              {this.renderHeader()}
            </thead> 
            <tbody>
              {this.renderRecords()}
            </tbody>
          </table>
          <div>
            {this.renderPaging()}
          </div>
      </div>
    );
  }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    game: state.game,
    records:state.records
});

export default withRouter(connect(mapStateToProps)(Transaction));
