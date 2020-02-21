import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import BaseClass from "@/baseClass";
import { Modal,Button} from 'antd';
import "./PopWindow.scss";

class PopWindow extends BaseClass{
  cancel(){
    window.actions.popWindowAction({type:""})
  }
  render() {
    const {type,title,content,okText,cancelText,closeFc,okFc,cancelFc} = this.props.popWindow;
    if(!type){
      return(
        <div className='HEELO WORLD'></div>
      )
    }
    return(
    <div className='modalAntd'>
        <Modal
        title={title?title:"温馨提示"}
        visible={true}               
        onCancel={closeFc?closeFc.bind(this):this.cancel.bind(this)}
        footer = {
          cancelText && cancelFc?
          [
            <Button key="ok" type="primary" onClick={okFc.bind(this)}>{okText}</Button>,
            <Button key="cancel" type="danger" onClick={cancelFc.bind(this)}>{cancelText}</Button>          
          ]:
          [
            <Button key="ok" type="primary" onClick={okFc.bind(this)}>{okText}</Button>,
          ]
        }
        >
        <p>{content?content:"无内容"}</p>
        </Modal>
    </div>
    )
  }
}



const mapStateToProps = (state: any, ownProps: any) => ({
  popWindow: state.popWindow,
});

export default withRouter(connect(mapStateToProps)(PopWindow));
