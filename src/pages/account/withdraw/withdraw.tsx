import React from "react";
import { connect } from "react-redux";
import { withRouter, Link } from 'react-router-dom';
import { Modal } from 'antd';
import { PassWord } from "components/pui/Pui";
import BaseClass from '@/baseClass';
import "./withdraw.scss"

class Withdraw extends BaseClass {
    public state = {
        money: "",
        WithdrawalPwd: "0000",
        PayType: this.props.user.bankAccounts.length > 0 ? this.props.user.bankAccounts[0].PayType : "",
        accountValue: this.props.user.bankAccounts.length > 0 ? this.props.user.bankAccounts[0].Id : "",
        reqLock: false,
        Audit: "",// 稽核
    }
    constructor(props: any) {
        super(props, [])
    }
    componentDidMount() {
        new window.actions.ApiBankAccountsAction().fly();//银行
        new window.actions.ApiGetAuditAction().fly((resp: any) => {
            this.setState({
                Audit: resp.TotalFee > 1 ? resp.TotalFee : 0
            })
        });
    }
    // Input修改状态
    handleChange(val: string, event: any) {
        this.setState({
            [val]: event.target.value
        })
    }
    AllMoney(){
        this.setState({
            money:parseInt(this.props.user.amount),
        })
    }
    handleSubmit() {
        if (this.state.reqLock) return;
        this.setState({
            reqLock: true
        })
        if (!this.state.money) {
            Modal.error({
                title: "错误提示",
                content: "未输出提款金额",
                okText: "确定",
            })
            this.setState({
                reqLock: false
            })
            return;
        }
        if (parseInt(this.state.money) < 100) {
            Modal.error({
                title: "错误提示",
                content: "最小的金额不得小于100",
                okText: "确定",
            })
            this.setState({
                reqLock: false
            })
            return;
        }
        if (this.props.user.amount < this.state.money) {
            Modal.error({
                title: "错误提示",
                content: "提款金额大于账户余额",
                okText: "确定",
            })
            this.setState({
                reqLock: false
            })
            return;
        }
        if (!this.props.user.verfyPhone && this.props.backConfigs.IsBindingPhone) {
            Modal.error({
                title: "错误提示",
                content: "没有验证手机号码，需验证手机号码即可执行取款操作",
                okText: "确定",
            })
            this.setState({
                reqLock: false
            })
            return;
        }
        let filter = {
            BankAccountId: this.state.accountValue,
            Amount: this.state.money,
            WithdrawalPwd: this.state.WithdrawalPwd,
            CodeType: this.state.PayType,
            UserAuditConfirm: false,
        };
        new window.actions.ApiWithdrawAction(filter).fly((resp: any) => {
            // 首先判断成功，如果成功，直接不做以下处理
            if (resp.Success) {
                Modal.confirm({
                    title: "温馨提示",
                    content: "您的提款成功",
                    okText: "确定",
                    cancelText: "取消",
                    onOk: () => {
                        // this.props.history.push("/Home")
                    },
                    onCancel: () => { }
                })
                this.setState({
                    reqLock: false
                })
                return;
            }
            // 没有成功 ，需要完成稽核
            if (resp.NeedToAudit && resp.TotalFee > 0 && resp.StatusCode === 0) {
                if (parseInt(this.state.money) - resp.TotalFee < 100) {
                    Modal.confirm({
                        title: "错误提示",
                        content: "提款金额不足。 您的稽核未完成，提款需核减稽核金额¥" + resp.TotalFee,
                        okText: "确定",
                        cancelText: "取消",
                    })
                    this.setState({
                        reqLock: false
                    })
                } else if (resp.AllowWithdrawals) {
                    Modal.confirm({
                        title: "提款稽核确认",
                        content: "提款需核减金额¥ " + resp.TotalFee + "实际提款金额¥" + (+this.state.money - resp.TotalFee),
                        okText: "确定",
                        cancelText: "取消",
                        onOk: () => {
                            let filtertwo = {
                                BankAccountId: this.state.accountValue,
                                Amount: this.state.money,
                                WithdrawalPwd: this.state.WithdrawalPwd,
                                CodeType: this.state.PayType,
                                UserAuditConfirm: true
                            };
                            new window.actions.ApiWithdrawAction(filtertwo).fly((resp: any) => {
                                if (resp.StatusCode === 0) {
                                    Modal.confirm({
                                        title: "温馨提示",
                                        content: "提款成功",
                                        okText: "确定",
                                        cancelText: "取消",
                                        onOk: () => {
                                            // this.props.history.push("/Home")
                                        }
                                    })
                                } else {
                                    Modal.error({
                                        title: "错误提示",
                                        content: resp.Message,
                                        okText: "确定",
                                    })
                                }
                            });
                        },
                    })
                    this.setState({
                        reqLock: false
                    })

                } else {
                    Modal.error({
                        title: "错误提示",
                        content: "您的稽核未完成，提款需核减稽核金额¥" + resp.TotalFee,
                        okText: "确定",
                    })
                    this.setState({
                        reqLock: false
                    })
                }
            } else {
                Modal.error({
                    title: "错误提示",
                    content: resp.Message + (resp.StatusCode) || "提款申请失败" + (resp.StatusCode),
                    okText: "确定",
                })
            }
            this.setState({
                reqLock: false
            })
        });
    }
    // 选择银行
    changeAccountValue(PayType: any, e: any) {
        let accountValue = e.currentTarget.id;
        this.setState({
            accountValue: accountValue,
            PayType
        })
    }
    renderAccounts() {
        let ret = [];
        if (this.props.user.bankAccounts.length > 0) {
            for (var i = 0; i < this.props.user.bankAccounts.length; i++) {
                var account = this.props.user.bankAccounts[i];
                ret.push(
                    <div key={i} className={+this.state.accountValue === account.Id ? "bankOptions isSel" : "bankOptions"}
                        id={account.Id} onClick={this.changeAccountValue.bind(this, account.PayType)}>
                        {account.Bank.BankName + " [************" + account.AccountNo.substr(-4) + "]"}
                        <div className="selCard"></div>
                    </div>
                );
            }
        }
        return ret;
    }
    render() {
        const bankAccounts = this.props.user.bankAccounts || []; // 银行卡
        if (bankAccounts.length < 1) {
            return (
                <div className='withdraw'>
                    <div className='imgs'></div>
                    <p className='bindtobank'>
                        阁下还未绑定银行卡，请点击<a onClick={this.props.history.push('/myCenter/bank')}>绑定银行卡</a>
                    </p>
                </div>
            )
        }
        return (
            <div className="withdraw">
                <h2>
                    取款
                    <span>（通常您的提款只需3 - 15 分钟即可到账, 若超过30分钟仍未到账，请联系在线客服核查。）</span>
                    <Link className="depositAd" to="/help/help/withdeaw">点击查看取款教程</Link>
                </h2>
                <div className='wbox'>
                    <div className='labelBox'>
                        <label>提款金额：</label>
                        <div className='doing'>
                            <input type="number" onChange={this.handleChange.bind(this, "money")}  value={this.state.money}/>
                            <span className='AllMoney' onClick={this.AllMoney.bind(this)}>全部</span>
                        </div>
                        <span className='noticeSpan'>* 单笔最低提款100元{parseInt(this.state.Audit) > 0 ? `，您的稽核金额为：${this.state.Audit}` : ""}</span>
                    </div>
                    <div className='labelBox'>
                        <label>提款密码：</label>
                        <div className='doing'>
                            <PassWord
                                defaultVal={[0, 0, 0, 0]}
                                getVal={(val: string) => {
                                    this.setState({
                                        WithdrawalPwd: val
                                    });
                                }} />
                        </div>
                        <span className='noticeSpan'>* 初始提款密码默认为登录密码或者0000</span>
                    </div>
                    <div className='labelBox'>
                        <label>提款账号：</label>
                        <div className='doing'>
                            {this.renderAccounts()}
                        </div>
                    </div>
                    <div>
                        <button className='Preservation' onClick={this.handleSubmit.bind(this)}>完成</button>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state: any, ownProps: any) => ({
    user: state.user
});

export default withRouter(connect(mapStateToProps)(Withdraw));
