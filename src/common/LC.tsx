import React from "react";
//按需加载，用于可能需要替换的小组件
//__start import componentsState from "../componentsState/#{spec}"
import componentsState from "../componentsState/usd"
//__end
interface Store {
  /**
   * @param comKey 组件的地址，相对于pges
   */
  comKey: string
}
export default class LoadComponentAsync extends React.Component<Store> {
  public state = {
    Component: null,
  };
  componentDidMount() {
    var path = componentsState[this.props.comKey];
    import(`../components/${path}`)
      .then(Component => {
        this.setState({
          Component: Component.default,
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
  render() {
    let Component: any = this.state.Component;
    return Component ?
      <Component/>:
      <div>
      </div>;
  }
}
