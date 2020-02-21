import React from "react";
import BaseClass from '@/baseClass';
import "./jackMoney.scss";

interface State {
    moneyPo: any[],
}
class jackMoney extends BaseClass {
    public Interval: any
    public jackMoney: string = sessionStorage.getItem("jackMoney") || (20000000 + Math.random() * 10000000).toFixed(2)
    public state: State = {
        moneyPo: []
    }
    constructor(props: any) {
        super(props, []);
        this.state = {
            moneyPo: this.mathPosition(this.jackMoney)
        }
    }

    componentDidMount() {
        this.Interval = setInterval(() => {//随机奖池
            let mathAd = parseFloat(Math.random().toFixed(2));
            let addMoney = (parseFloat(this.jackMoney) + mathAd).toFixed(2);
            this.jackMoney = parseFloat(addMoney) + "";
            this.setState({
                moneyPo: this.mathPosition(this.jackMoney)
            })
        }, 2500)
    }

    mathPosition(num: any): any[] {
        let positionList = [];//将每一位数字的图片位置存起
        //54为基准0,   108px = 1
        let indexPos = 54;
        let mp = 0;//每一个奖池数字坐标下标
        for (let i = 0; i < 11; i++) {
            if (i === 8) continue;//跳过小数点
            if (this.state.moneyPo.length === 0) {//第一次存入奖池金额
                if (num[i]) {
                    positionList.push(num[i] * indexPos + indexPos);
                } else {//尾数补0
                    positionList.push(indexPos);
                }
            } else {
                if (num[i] && this.state.moneyPo[mp]) {
                    positionList.push(num[i] * indexPos + indexPos);
                } else {//尾数补0
                    positionList.push(this.state.moneyPo[mp]);
                }
            }
            mp++;
        }
        return positionList;

    }

    componentWillUnmount() {
        clearInterval(this.Interval);
        sessionStorage.setItem("jackMoney", this.jackMoney);
    }

    render() {
        return (
            <div className="jackMoney">
                <div className="numBox">
                    {
                        this.state.moneyPo.map((data: string, index: number) => {
                            return <div className="num" key={index} style={{ "backgroundPositionY": data + "px" }}></div>
                        })
                    }
                </div>
            </div>
        );
    }



}


export default jackMoney;
