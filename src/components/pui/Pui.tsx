import React from "react";
import "./Pui.scss";
import BaseClass from "@/baseClass";

class FastTimeSelect extends BaseClass {
  constructor(props: any) {
    super(props, [], true);
  }
  public state = {
    timeZoneIndex:this.props.timeZone,
  }
  static getDerivedStateFromProps(props:any, state:any) {
    if(props.timeZone.length !== state.timeZoneIndex.length) {
        return {
          timeZoneIndex:props.timeZone,
        }
      }
      return null;
    }
  timeZoneChange(val:any){
      this.setState({
          timeZoneIndex:val,
      });
      this.props.getVal(val);
  }
  render(){
    return (
        <div className='timeZone'></div>
    )
  }
}

// 下拉支付密码
interface State{
  option:any
}
interface Pro{
  [key:string]:any
}
class PassWord extends React.Component<Pro> {  
  public state:State = {
    option:[]
  }
  constructor (props:any){
      super(props);
      this.state = {
          option:props.defaultVal
      };
  }
  changeVal = (i:number,event:any)=>{
      let option =  this.state.option;
      option[i] = event.target.value;
      this.setState({
          option
      });
      this.props.getVal(this.state.option.join(''));
  }
  render(){
      let select = [];
      for(let k = 0;k < this.state.option.length;k++){
          let option = [];
          for(let i = 0;i < 10;i++){
              option.push(
                  <option key={`o${i}`}>{i}</option>
              )        
          }
          select.push(
              <select key={`s${k}`} onChange={this.changeVal.bind(this,k)} value={this.state.option[k]} className='PayPassWord'>
                  {option}
              </select>
          ) 
      }
      return <div className="Pui-PassWord">    
          {select}
      </div>
  }
}
class CopyButton extends React.Component<Pro> {  

  // 复制当前文本
  copyCode(CopyElement:string){
    let dom:any = document.getElementById(CopyElement);
    dom.select();
    dom.setSelectionRange(0, dom.value.length)
    document.execCommand("Copy");
  }
  render(){
      return(
          <button className='PuiCopy' onClick={this.copyCode.bind(this,this.props.copyEle)}>复制</button>
      )
  }
}
export {
  FastTimeSelect,
  PassWord,
  CopyButton
};
