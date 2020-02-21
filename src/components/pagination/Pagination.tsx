import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import "./Pagination.scss"

interface prop{
  Count:number,
  portion:number,
  callBackFunc:(val:number)=>void
}
class Pagination extends React.Component<prop> {
  public state={
    pageNo:1,
  }
  constructor(props:any){
    super(props,[])
  }
  pagingRender(){
    let ret = [];
    let invalidTag = false;// 省略号判断
    let len = Math.ceil(this.props.Count/this.props.portion) || 1;//分页最大数
    for(let i=1;i<len+1;i++){
        if(i!==1 && i!==len && Math.abs(this.state.pageNo - i) >= 3){
            invalidTag = true;
            continue;
        }
        if (invalidTag) {
            ret.push(
                <li key={"pageing" + i} className='ellipsis'>
                    <a>...</a>
                </li>
            )
            invalidTag = false;
        }
        ret.push(
            <li onClick={this.changePage.bind(this,i)} key={i} className={i === this.state.pageNo ? "active pages":"pages"}>
                <a>{i}</a>
            </li>
        )
    }
    return ret
  }
  // 切换分页
  changePage(val:number){
    this.setState({
        pageNo:val,//当前分页的页数
    })
    this.props.callBackFunc&&this.props.callBackFunc(val-1);// 切换分页时执行的回调方法
  }
  prevPage(){
    if(this.state.pageNo===1)return //
    let pageNo = this.state.pageNo-1; // 当前分页
    this.setState({
        pageNo:pageNo,//改变当前分页的页数
    })
    this.props.callBackFunc&&this.props.callBackFunc(pageNo-1)//点击上一页执行的回调方法
  }
  nextPage(){
    let max = Math.ceil(this.props.Count/this.props.portion) || 1;//分页最大数
    if(this.state.pageNo>=max)return
    let pageNo = this.state.pageNo+1;// 当前分页
    this.setState({
        pageNo:pageNo,//改变当前分页的页数
    })
    this.props.callBackFunc&&this.props.callBackFunc(pageNo-1)//点击下一页执行的回调方法
  }
  render(){
    if(Math.ceil(this.props.Count/this.props.portion)<2){
      return <div style={{display:"none"}}>当分页小于1页时，隐藏！</div>
    }
    return(
      <div className='paging'>
        <ul>
            <li onClick={this.prevPage.bind(this)} className={this.state.pageNo===1?"disabled prev":"prev"}><a><i>
                <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
                    <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
                </svg>                                            
            </i></a></li>
            {this.pagingRender()}
            <li onClick={this.nextPage.bind(this)} className={this.state.pageNo>=Math.ceil(this.props.Count/this.props.portion)?"disabled next":"next"}><a><i>
                <svg viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
                    <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z"></path>
                </svg> 
            </i></a></li>
        </ul>
      </div>
    )
  }  
}
const mapStateToProps = (state: any, ownProps: any) => ({});
export default withRouter(connect(mapStateToProps)(Pagination));
