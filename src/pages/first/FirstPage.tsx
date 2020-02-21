import React from "react";
import { connect } from "react-redux";
import { withRouter, Route, Redirect, Switch } from 'react-router-dom';
import LoadComponentAsync from "@/LoadComponentAsync"
import Suspension from "components/suspension/suspension"
import LC from "@/LC";
import "./FirstPage.scss";

interface RouterProps {
  history: any
}
type State = {
  lock:boolean
}
class FirstPage extends React.Component<RouterProps> {
  public state:State;
  constructor(props: any) {
    super(props)
    this.state={
      lock:false
    }
  }
  ToTheOriginal(){
    if(this.state.lock)return
    let that = this;
    this.setState({
      lock:true
    })
    setTimeout(() => {
      let dom = document.getElementById("content") as HTMLElement;
      let timer = setInterval(function () {
        var scrollTop = dom.scrollTop;
        var ispeed = Math.floor(-scrollTop / 4);
        if (scrollTop === 0) {
          clearInterval(timer);
          that.setState({
            lock:false
          })
        }
        dom.scrollTop = scrollTop + ispeed;
      },30)
    });
  }
  render() {
    return (
      <div className="FirstPage" >
        <LC comKey="NavBar" />
        <Suspension toTop={this.ToTheOriginal.bind(this)}/>
        <div className="content" id="content">
          <Switch>
            <Route path="/Home" render={() => <LoadComponentAsync key="HomePage" componentPath="HomePage" />} />
            <Route path="/sport" render={() => <LoadComponentAsync key="SportPage" componentPath="SportPage" />} />
            <Route path="/casino" render={() => <LoadComponentAsync key="CasinoPage" componentPath="CasinoPage" />} />
            <Route path="/games" render={() => <LoadComponentAsync key="GamesPage" componentPath="GamesPage" />} />
            <Route path="/bingo" render={() => <LoadComponentAsync key="BingoPage" componentPath="BingoPage" />} />
            <Route path="/streetMachine" render={() => <LoadComponentAsync key="StreetMachinePage" componentPath="StreetMachinePage" />} />
            <Route path="/eSport" render={() => <LoadComponentAsync key="ESportPage" componentPath="ESportPage" />} />
            <Route path="/fish" render={() => <LoadComponentAsync key="FishPage" componentPath="FishPage" />} />
            <Route path="/JointVentureScheme" render={() => <LoadComponentAsync key="JointVenture" componentPath="JointVenture" />} />
            <Route path="/promotions" render={() => <LoadComponentAsync key="PromotionsPage" componentPath="PromotionsPage" />} />
            <Route path="/myCenter" authCheck={this.props.history} render={() => <LoadComponentAsync key="myCenter" componentPath="myCenter" />} />
            <Route path="/help/:menu/:secMenu" authCheck={this.props.history} render={() => <LoadComponentAsync key="help" componentPath="help" />} />
            <Redirect from="*" to="/Home" />
          </Switch>
          <LC comKey="FootBar" />
        </div>
      </div>
    );
  }

}


const mapStateToProps = (state: any, ownProps: any) => ({
  testAction: state.testAction
});

export default withRouter(connect(mapStateToProps)(FirstPage));
