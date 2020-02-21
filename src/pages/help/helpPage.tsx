import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import { Menu, Icon } from 'antd';
import BaseClass from '@/baseClass';
import { in_array} from "tollPlugin/commonFun";
import "./helpPage.scss";
const { SubMenu } = Menu;

interface MenuObj {
    [key: string]: {
        title: string,
        key: string,
        keyName: string
        listData: any[]
        icon: string
    }
}
interface State {
    menuObj: MenuObj,
    activeId: string,
    contentId: string,
    haveList: any[],
}

class helpPage extends BaseClass {
    constructor(props: any) {
        super(props, [])       
    }

    public state: State = {
        menuObj: this.props.helpMenu,
        activeId: this.props.match.params.menu || "help",
        contentId: "item0",
        haveList: [],
    }
    componentDidMount() {
        if (!this.state.menuObj.help) {//如果没有帮助中心导航就获取
            new window.actions.ApiGetMenuAction("helpMenu").fly((res: any) => {
                if (res.StatusCode === 0) {
                    setTimeout(() => {
                        this.getMenuData(this.state.activeId);
                    }, 10);
                }
            });
        } else {
            this.getMenuData(this.state.activeId);
        }
    }

    static getDerivedStateFromProps(props: any, state: State) {
        if (props.helpMenu.help && !state.menuObj.help) {
            return {
                menuObj: props.helpMenu
            }
        }
        return null;
    }

    getMenuData(prar: string) {
        if (in_array(prar, this.state.haveList)) {//如果已经获取过该子菜单就不重复获取了
            return false
        }
        new window.actions.ApiNoticeAction(prar).fly((res: any) => {
            if (res.StatusCode === 0) {
                let newMenuObj = this.state.menuObj;//将各自主菜单下子菜单放进对象数组
                newMenuObj[this.state.activeId].listData = res.NewsInfo;
                if (this.props.match.params.secMenu) {
                    let par = this.props.match.params.secMenu;
                    this.props.match.params.secMenu = null;
                    for (let index = 0; index < res.NewsInfo.length; index++) {
                        const data = res.NewsInfo[index];
                        if (data.Key === par) {
                            this.setState({
                                contentId: `item${index}`,
                                menuObj: newMenuObj,
                                haveList: [...this.state.haveList, prar]
                            })
                            return;
                        }
                    }
                }
                this.setState({
                    menuObj: newMenuObj,
                    haveList: [...this.state.haveList, prar]
                })
            }
        }, "helpPage")
        return true;
    }

    render() {
        return (
            <div className="helpPage">
                <div className="listBox">
                    {this.runList()}
                    {this.runContent()}
                </div>
            </div>
        );
    }

    runList() {
        let obj = this.state.menuObj;
        let menuList = [];
        let index = -1;
        for (let key in obj) {
            let list = [];
            for (let i = 0; i < obj[key].listData.length; i++) {
                const data = obj[key].listData[i];
                index = index + 1;
                list.push(<Menu.Item key={`item${index}`}>{data.Title}</Menu.Item>);
            }
            menuList.push(
                <SubMenu
                    key={key}
                    title={
                        <span>
                            <Icon type={obj[key].icon} style={{ fontSize: "17px" }} />
                            <span>{obj[key].title}</span>
                        </span>
                    }
                >
                    {
                        list
                    }
                </SubMenu>
            )
        }
        return (
            <Menu
                onClick={this.handleClick}
                onOpenChange={this.menuChange}
                style={{ width: 256 }}
                defaultSelectedKeys={[this.state.contentId]}
                selectedKeys={[this.state.contentId]}
                defaultOpenKeys={[this.state.activeId]}
                mode="inline"
                multiple={false}
            >
                {menuList}
            </Menu>
        )
    }

    runContent() {
        let obj = this.state.menuObj;
        let index = -1;
        let rightDomList: any = [];
        for (let key in obj) {
            let rightDom = [];
            for (let i = 0; i < obj[key].listData.length; i++) {
                const data = obj[key].listData[i];
                index = index + 1;
                rightDom.push(
                    <div className="rightContent"
                        data-fuck={`item${index}`}
                        dangerouslySetInnerHTML={{ __html: data.Content }}
                        style={{ "display": this.state.contentId === `item${index}` ? "block" : "none" }}
                        key={`cont${index}`}
                    >
                    </div>
                )
            }
            rightDomList.push(rightDom)

        }
        return rightDomList

    }


    handleClick = (e: any) => {
        this.setState({
            contentId: e.key
        })
    };

    menuChange = (menuList: any) => {
        this.setState({
            activeId: menuList[menuList.length - 1]
        })
        menuList.map((item: any) => {
            return this.getMenuData(item)
        })
    };
}


const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user,
    remoteSysConfs: state.remoteSysConfs,
    helpMenu: state.menus.helpMenu
});

export default withRouter(connect(mapStateToProps)(helpPage));
