import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import Record from "./record"

class Betting extends Record{
  renderPlatforms() {
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
  renderHeader(){
    return <tr>
        <th>单号</th>
        <th>游戏类别</th>
        <th>投注额</th>
        <th>有效投注</th>
        <th>派彩</th>
        <th>时间</th>
    </tr>;
  }
  componentDidMount() {
    this.setState({
      type:"投注",
      timeZone:-4
    },()=>{
      this.toPage();
    })
  }
  renderRecords(){
    var ret = [];
    for (var i = 0; i < this.props.records.betRecords.rows.length; i++) {
        var log = this.props.records.betRecords.rows[i];
        ret.push(<tr key={i}>
                <td >{log.OrderNumber}</td>
                <td >{log.GamePlatform}</td>
                <td >{log.Bet}</td>
                <td >{log.RealBet}</td>
                <td >{log.PayOut}</td>
                {log.CreateTimeDateText === "0001-01-01"?<td></td>:<td >{log.CreateTimeDateText +" "+ log.CreateTimeTimeText}</td>}
            </tr>
        );
    }
    if (ret.length === 0) {
        ret.push(
            <tr key="no_msg">
                <td colSpan={6}>很抱歉，没有您查找的记录.</td>
            </tr>
        );
    }
    return ret;
  }
  changePlatform(e:any){
    this.setState({
      GamePlatform:e.target.value
    })
  }
  render() {
    return (
      <div className="records">
        <div className='recordTlt'>
          <h3>投注记录</h3>
          <span>每个产品的数据将有一定时间的延迟，仅供参考使用</span>
        </div>     
        <div className='recordsWrap'>
          <div className='recordType'>
            <div className='labels'>选择平台：</div>
            <select className='recordSelect' onChange={this.changePlatform.bind(this)}>
              <option value="">全平台</option>
              {
                  this.renderPlatforms()
              }
            </select>              
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
  records : state.records
});

export default withRouter(connect(mapStateToProps)(Betting));
