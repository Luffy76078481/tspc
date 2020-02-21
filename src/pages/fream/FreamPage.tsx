import React from "react";
import FirstPage from "../first/FirstPage";
import { Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import Loading from "components/loading/loading"
import NoticeWindow from "components/noticeWindow/NoticeWindow"
import PopWindow from "components/popWindow/PopWindow"
import "./prestrain.scss"
import LoadComponentAsync from "@/LoadComponentAsync"



interface Store {
  /**
   * Returns the value of a base expression taken to a specified power.
   * @param store The base value of the expression.
   * @param y The exponent value of the expression.
   */
  store: any;
}

export default class FreamPage extends React.Component<Store> {

  render() {
    return (
      <Provider store={this.props.store}> 
          <Router history={window.routerHistory}>
            <Switch>
              <Route path="/Login" render={() => <LoadComponentAsync key="LoginPage" componentPath="LoginPage" />} />
              <Route path="/Home/LoginRegist/reg" render={() => <LoadComponentAsync key="/Home/LoginRegist/reg" componentPath="LoginPage" />} />
              <FirstPage store={this.props.store} />
            </Switch>
            <Loading />
            <NoticeWindow store={this.props.store} />
            <PopWindow store={this.props.store} />
          </Router>           
      </Provider>
    );
  }
}
