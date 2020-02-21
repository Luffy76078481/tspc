import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import "./JointVenture.scss";
type State = {
  BottomCotents:string[],
  middleContents:MiddleCot[],
  agent_qq:string,
  online_service_email:string,
  suggestion:string
}
type MiddleCot = {
  title:string,
  English:string,
  url:string
}
class JointVenture extends BaseClass {
  public state:State = {
    agent_qq:"",
    online_service_email:"",
    suggestion:"",
    BottomCotents:[],
    middleContents:[
      {title:"超高返佣比",English:"Maximum Commission",url:"./images/icon_chaogao.png"},
      {title:"最优质的产品",English:"High quality products",url:"./images/icon_zuiyou.png"},
      {title:"最精确的数据",English:"Accurate statistics",url:"./images/icon_zuijing.png"},
    ]    
  }
  static getDerivedStateFromProps(props: any, state:State){
    if(state.BottomCotents[0]!==props.remoteSysConfs.agent_qq){
      let agent_qq:string = props.remoteSysConfs.agent_qq
      let online_service_email:string = props.remoteSysConfs.online_service_email
      let suggestion:string = props.remoteSysConfs.suggestion
      let arr:string[] = [];
      arr.push(agent_qq,online_service_email,suggestion);
      return({
        BottomCotents:arr
      })
    }
    return null
  } 
  middleContent(){
    return this.state.middleContents.map((item:MiddleCot,i:number)=>{
      return(
        <div className='middleCot' key={i}>
          <img src={require(`${item.url}`)} alt="Noticepic" />
          <div className="textIntro">
            <p>{item.title}</p>
            <p>{item.English}</p>
          </div>
        </div>
      )
    })
  }
  bottomContent(){
    return this.state.BottomCotents.map((item:string,i:number)=>{
      return(
        <li key={i}>
          <div className={"contactIcon contactIcon"+(i+1)}></div>
          <p className='contactText1'>{i===0?"合营部QQ":i===1?"合营部Skype":"投诉和建议"}</p>
          <p className='contactText2'>{item}</p>
          <a className='contactButton'>立即咨询</a>
        </li>
      )
    })
  }
  render() {
    return (
      <div className='JointVenture'>
        <div className='page1_left'>
          <div className="y_a_m_f"></div>
          <div className="ju_txt">是成为传奇? 还是成为传奇的歌颂者?</div>
          <div className="ju_txt2">
            {this.middleContent()}
          </div>
          <div className='contactBox'>
            <ul>
              {this.bottomContent()}
            </ul>
          </div>
          <div className="join_us">
            <button className="join_btn join_btn1" id="open_win" onClick={this.goAgent.bind(this)}>加入我们</button>
          </div>
        </div>
        <div className="page1_right">
          <img src={require('./images/Cl.png')} alt="MESSI" />
        </div>
      </div>
    )
  }

  goAgent() {
    window.open(this.props.remoteSysConfs.agent_regist_link);
  }
}

const mapStateToProps = (state: any, ownProps: any) => ({
  remoteSysConfs: state.remoteSysConfs,
});

export default withRouter(connect(mapStateToProps)(JointVenture));