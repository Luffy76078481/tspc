
import React from "react";
import { connect } from "react-redux";
import BaseClass from "@/baseClass";
import { withRouter } from "react-router-dom";
import { serversOpen } from "tollPlugin/commonFun";
import "./suspension.scss";

class Suspension extends BaseClass {
  render(){
    return(
      <div className='suspension'>
        <div className="_1lCooMLc" onClick={()=> serversOpen(this.props.remoteSysConfs.online_service_link)}>        
          <img className="_1n-95yw2" src={require('./images/icon_service_blue.png')} alt="icon"/>
          <span>在线客服</span>
        </div>
        <div className='back_top' onClick={()=>this.props.toTop()}>
          <img src={require('./images/icon_up_blue.png')} alt="icon"/>
          <span>回到顶部</span> 
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state: any, ownProps: any) => ({
  remoteSysConfs: state.remoteSysConfs,
  user: state.user,
});

export default withRouter(connect(mapStateToProps)(Suspension));