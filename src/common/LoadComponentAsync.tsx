import React from "react";
//按需加载，主要用于路由的，其他地方如果组建较大也可以使用/
//__start import componentsState from "../componentsState/#{spec}"
import componentsState from "../componentsState/usd"
//__end
interface Store {
  /**
   * @param componentPath 组件的地址，相对于pges
   */
  componentPath?: any;
  animateType?: string;
  authCheck?:any
}
export default class LoadComponentAsync extends React.Component<Store> {
  public state = {
    Component: null,
  };
  componentDidMount() {
    if(this.props.authCheck && !window.actions.Authority(true)) {//需要进行路由拦截
      this.props.authCheck.push("/Home/Login")
      return null
    }
    let path = componentsState[this.props.componentPath];
    import(`../pages/${path}`)
      .then(Component => {
        this.setState({
          Component: Component.default,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    let Component: any = this.state.Component;
    return Component ?
      <Component/>:
      <div>
        <div className="loadBox">
          <div className="loader"></div>
        </div>
        <div className="skeleton">
          <div className="skeTop"></div>
          <div className="skeCent"></div>
          <div className="skeCont"></div>
        </div>
      </div>;
  }
}
