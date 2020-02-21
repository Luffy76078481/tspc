import * as React from "react";
//控制不必要的diff算法
interface Store {
  /**
   * Returns the value of a base expression taken to a specified power.
   * @param store The base value of the expression.
   * @param y The exponent value of the expression.
   */
  store?: any;
  history?: object | any;
  wapAdsList?: object[] | any;
  notices?: Object[] | any;
  wapHomeGames?: Object[] | any;
  favoritesIds?: number[] | any;
  favoriteGames?: Object | any;
  recentlyGames?: Object | any;
  user?: Object | any;
  popWindow?: Object | any;
  [key: string]: any; // Add index signature
}



export default class BaseClass extends React.Component<Store> {
  public detectingParameter: string[] = []
  public state: Store = {}
  public TS: Store = {}
  constructor(props: any, public test: string[] = [], checkAuth: boolean = false) {
    super(props);
    // if (checkAuth && !window.actions.Authority(true)) {//需要进行路由拦截
    //   this.props.history.push("/Home/Login")
    // }
    this.detectingParameter = test;//接受需要判断是否更新的参数，用来和reducer的值进行比较，如果没有变化则不进行更新
  }
  shouldComponentUpdate<pro>(nextProps: any, nextState: any) {
    let test = this.detectingParameter;
    if (test.length > 0) {//首先是需要进行更新算法
      for (let i = 0; i < test.length; i++) {//迭代参数进行值的浅比较，如果后期有需要可以进行更复杂的对比
        if (!!!this.TS[test[i]]) {//首次渲染缓存当前状态，下一次做更新比较
          this.TS = nextProps
          return true
        }

        // 如果判断的是对象则进行深比较
        if (isObject(nextProps[test[i]])) {
          if (!equalsObj(nextProps[test[i]], this.TS[test[i]])) {
            return true
          }
        } else if ((nextProps[test[i]].length !== this.TS[test[i]].length)) {//N次渲染，浅层比较是否有改变
          this.TS = nextProps//如果改变了就再次暂存改变后的状态为之后的比较
          return true
        }
      }
      //当props没有改变时，对state对象进行深比较
      return !equalsObj(this.state, nextState);

    } else {//不需要更新算法其实就不应该继承这个类
      return true;
    }
  }

}

/**对象的深比较
 * 判断此对象是否是Object类型
 * @param {Object} obj  
 */
function isObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};
/**
* 判断此类型是否是Array类型
* @param {Array} arr 
*/
function isArray(arr: any) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};
/**
*  深度比较两个对象是否相同
* @param {Object} oldData 
* @param {Object} newData 
*/
export function equalsObj(oldData: any, newData: any) {
  //       类型为基本类型时,如果相同,则返回true
  if (oldData === newData) return true;
  if (isObject(oldData) && isObject(newData) && Object.keys(oldData).length === Object.keys(newData).length) {
    //      类型为对象并且元素个数相同

    //      遍历所有对象中所有属性,判断元素是否相同
    for (const key in oldData) {
      if (oldData.hasOwnProperty(key)) {
        if (!equalsObj(oldData[key], newData[key]))
          //      对象中具有不相同属性 返回false
          return false;
      }
    }
  } else if (isArray(oldData) && isArray(oldData) && oldData.length === newData.length) {
    //      类型为数组并且数组长度相同

    for (let i = 0, length = oldData.length; i < length; i++) {
      if (!equalsObj(oldData[i], newData[i]))
        //      如果数组元素中具有不相同元素,返回false
        return false;
    }
  } else {
    //      其它类型,均返回false
    return false;
  }

  //      走到这里,说明数组或者对象中所有元素都相同,返回true
  return true;
};


