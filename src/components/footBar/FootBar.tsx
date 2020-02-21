import React from "react";
import { connect } from "react-redux";
import BaseClass from "@/baseClass";
import { withRouter, Link } from "react-router-dom";
import "./FootBar.scss"


class FootBar extends BaseClass {
    render() {
        const agentLoginUrl = window.config.agentLoginUrl;
        return (
          <div className="FootBar">
            <div className="footImg"></div>
            <p>
              {window.config.appName}
              拥有欧洲马耳他博彩管理局（MGA）、英国GC监督委员会（Gambling
              Commission）和菲律宾政府博彩委员会（PAGCOR）颁发的合法执照。
              <br />
              注册于英属维尔京群岛，是受国际博彩协会认可的合法博彩公司。进行注册并娱乐前，请确保您年满18周岁！
            </p>
            <div className="footIcon">
              <div className="procedureGroup">
                <div className="procedureItem term1">
                  <div className="procedureIcon1"></div>
                  <div className="title title1">英国CG监督委员会</div>
                </div>
                <div className="procedureItem term2">
                  <div className="procedureIcon2"></div>
                  <div className="title title2">马耳他博彩牌照（MGA）认证</div>
                </div>
                <div className="procedureItem term3">
                  <div className="procedureIcon3"></div>
                  <div className="title title3">英属维尔京群岛（BVI）认证</div>
                </div>
                <div className="procedureItem term4">
                  <div className="procedureIcon4"></div>
                  <div className="title title4">
                    菲律宾（PAGCOR）监督博彩牌照
                  </div>
                </div>
              </div>
            </div>
            <div className="FooterLinks">
              <Link to="/help/help/help">新手帮助</Link>
              <Link to="/help/game/game">游戏问题</Link>
              <Link to="/help/callme/callme">联系我们</Link>
              <Link to="/help/company/company">企业事务</Link>
              <a onClick={this.serversOpen.bind(this)}>在线客服</a>
              <a href="/agent.html?tab=Registered" target="_blank?">
                代理注册
              </a>
              <a href={agentLoginUrl} target="_blank" rel="noopener noreferrer">
                代理登入
              </a>
            </div>
            <div className="copyright">
              版权所有 ©2018-2019{window.config.appName} 保留所有权
            </div>
          </div>
        );
    }

    // 在线客服
    serversOpen(e: any) {
        e.preventDefault();
        window.open(this.props.remoteSysConfs.online_service_link, 'servers', 'width=700,height=600,directories=no,location=no,menubar=no,scrollbars=no,status=no,toolbar=no,resizable=no,left=5,top=50,screenX=550,screenY=250');
        return false;
    }
}

const mapStateToProps = (state: any, ownProps: any) => ({
    remoteSysConfs: state.remoteSysConfs,
    user: state.user,
});

export default withRouter(connect(mapStateToProps)(FootBar));
