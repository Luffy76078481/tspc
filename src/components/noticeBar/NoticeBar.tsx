import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import BaseClass from "@/baseClass";
import { Modal } from 'antd';
import "./NoticeBar.scss";
interface State {
  notices: []
}
class NoticeBar extends BaseClass {
  public state = {
    notices: [] as any
  }
  render() {
    // 走马灯数据
    let marqueeCotent = () => {
      let marqueeCotent = "";
      if (this.state.notices.length > 0) {
        for (let i = 0; i < this.state.notices.length; i++) {
          marqueeCotent += this.state.notices[i].Content.replace(/(&nbsp;|&ldquo;|&rdquo|;|\s){1}|<[^>]+>/g, "") + "  ";
        }
      }
      return marqueeCotent
    }
    let animaTime = this.state.notices.length > 0 ? (marqueeCotent().length * 2) / 10 : 60;

    return (
      <div className="NoticeBar" onClick={this.goPla.bind(this)}>
        <div id="wrapper" className="wrapper">
          <img src={require("./images/img.png")} alt="" />
          <div className="inner">
            <p className="txt" style={{ animation: 'marquee ' + animaTime + 's linear infinite' }} >
              {marqueeCotent()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  goPla() {
    if (this.props.user.Token) {
      this.props.history.push('/myCenter/news')
    } else {
      Modal.confirm({
        title: '是否登录',
        content: '请先登录账号,才能了解更多',
        okText: "登录",
        onOk() {
          window.routerHistory.push("/Login")
        },
        cancelText: "取消",
      });
    }
  }

  static getDerivedStateFromProps(props: any, state: State) {
    if (props.notices.length !== state.notices.length
    ) {
      return {
        notices: props.notices,
      }
    }
    return null;
  }

}

const mapStateToProps = (state: any, ownProps: any) => ({
  notices: state.notices,
  user: state.user,
});

export default withRouter(
  connect(
    mapStateToProps,
    {}
  )(NoticeBar)
);
