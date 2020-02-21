import React from "react";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import BaseClass from '@/baseClass';
import {Empty} from "antd"
import Swiper from 'swiper'
import Pagination from "components/pagination/Pagination";
import "./PromotionsPage.scss";

type Promo = {
    TypeName: string,
    Id:string|number,
    className?:string,
    FontIcon?:string,
    FontIconImg?:string
}
type Cot = {
    Id:string|number|undefined,
    Img:string,
    Content:string,
    Title:string,
    Description:string,
    PromoTypeName:string|undefined
}
type Rows = Cot[]
interface State{
    activeClassName:number,
    showDetail:boolean,
    detail:{
        Content:string,
        Title:string
    },
    // promotionTypes?:Promo[],
    pageNo?:number,
    promoID:string
}
let swiper:any;

class PromotionsPage extends BaseClass {
    public state:State = {
        activeClassName:0, // 导航下标
        showDetail:false,// 显示优惠详情
        detail:{Content:"",Title:""},// 优惠详情内容
        //pageNo:1,//当前页（分页）
        promoID:"",// 优惠导航对应的ID，主要为了切换分页使用
    }
    constructor(props: any) {
        super(props, [])
    }
    // 导航
    tabRender(){
        let list:Array<JSX.Element> = [];
        let promotionTypes:Promo[] = this.props.promotionTypes;
        for(let i=0;i<promotionTypes.length;i++){
            let className:string = this.state.activeClassName===i?"active tabs swiper-slide":"tabs swiper-slide";
            let item:Promo = promotionTypes[i];
            list.push(
                <div key={i} className={className} onClick={this.tabChange.bind(this,i,item)}>
                    <i className={`icon iconfont ${i===0?"iconquanbu":item.FontIcon}`}></i>
                    <span>{item.TypeName.replace("优惠","")}优惠</span>
                </div>
            )            
        }
        return list;
    }
    // 点击优惠导航
    tabChange(index:number,val:Promo){
        if(index===this.state.activeClassName)return
        this.setState({
            activeClassName:index,// 下标变化
            //pageNo:1,// 分页到第一页，初始化
            promoID:index===0?"":val.Id
        },()=>{
            window.actions.showLoading(true); 
            new window.actions.ApiQueryPromotionsAction(0,12,val.Id).fly(()=>{
                window.actions.showLoading(false); 
            });            
        })
    }
    componentDidMount(){
        new window.actions.ApiQueryPromotionTypesAction().fly();
        new window.actions.ApiQueryPromotionsAction(0,12).fly();
    }
    componentDidUpdate(props:any,state:State){
        if(!swiper && props.promotionTypes.length>0){
            swiper = new Swiper('.promoTypeSwiper', {
                slidesPerView:"auto",//显示个数
                //freeMode:true,//开启自由滑动
                slideToClickedSlide: true,//可点击
                spaceBetween: 0,
            });              
        }
    }
    static getDerivedStateFromProps(props:any,state:State) {
        return null;
    }
    componentWillUnmount(){
        if(swiper)swiper.destroy()
    }
    // 优惠内容
    promoRender(){
        let rows:Rows = this.state.activeClassName===0?this.props.promoData:this.props.promotions.rows;//全部还是单独的优惠
        if(rows.length<1){
            return(
                <div className='empty'>
                    <Empty description="阁下不好意思，暂无数据..."/>
                </div>
            )
        }
        return rows.map((item:Cot,index:number)=>{
            return(
                <div key={index} onClick={this.showPromoDetail.bind(this,item)} className='promoBox'>
                    <div className='bgDiv'>
                        <img src = {window.config.devImgUrl + item.Img} alt={item.PromoTypeName}/>
                    </div>
                    <div className='P'>
                        <p>{item.Title}</p>
                        <p>{item.Description}</p>
                    </div>
                </div>
            )
        })
    }
    // 点击优惠，显示优惠内容
    showPromoDetail(cot:Cot){
        this.setState({
            detail:{
                Content:cot.Content,
                Title:cot.Title,
            },
            showDetail:true
        })
    }
    callBackFunc(pageNo:number){
        new window.actions.ApiQueryPromotionsAction(pageNo,12,this.state.promoID).fly();
    }
    render() {
        return (
            <div className="PromotionsPage">
                <div className='img1'><img src={require("./images/bg1.png")} alt="BalloonBG"></img></div>
                {/* <div className='img2'><img src={require("./images/img_pink2.png")} alt="BalloonBG"></img></div> */}
                <div className='promoCotent'>
                    <a className='img3'><img src={require("./images/img_discount.png")} alt="PercentageBG"></img></a>
                    <a className='img4' style={{left:window.config.spec.includes('usd')?'-178px':'-78px'}}><img src={require("./images/cl.png")} alt="FooterPlayerBG"></img></a>
                    <a className='img5'><img src={require("./images/img_hongli.png")} alt="FontBG"></img></a>
                    <div className='img6'><img src={require("./images/img_pink3.png")} alt="BalloonBG"></img></div>
                    <div className='img7'><img src={require("./images/img_pink4.png")} alt="BalloonBG"></img></div>
                    <div className='wrap'>
                        <div className='promoTab'>
                            <div className="swiper-container promoTypeSwiper">
                                <div className="swiper-wrapper">
                                    {this.tabRender()}
                                </div>
                                <div className="swiper-pagination" style={{display:"none"}}></div>
                            </div>  
                        </div>    
                        <div className='promoContents clearfix'>
                            {this.promoRender()}
                        </div>           
                        {
                            <Pagination 
                                portion={12}//一页显示多少个
                                callBackFunc={this.callBackFunc.bind(this)}//回调
                                // 总数
                                Count={this.props.Count}>
                                                      
                            </Pagination>
                        }
                    </div>
                </div>
                {
                    this.state.showDetail?
                    <div className='promoDetail'>
                        <div className='window fadeInDown animated'>
                            <h3>{this.state.detail.Title}</h3>
                            <i className="icon iconfont icon-iconclose" onClick={()=>{this.setState({showDetail:false})}}></i>
                            <div className='detailCotents'  dangerouslySetInnerHTML={{ __html: this.state.detail.Content }}></div>
                        </div>
                    </div>:null           
                }
            </div>
        );
    }
}


const mapStateToProps = (state: any, ownProps: any) => ({
    promotionTypes: state.promotions.promoTypes,//优惠导航
    promotions: state.promotions.promotions,//其他优惠
    promoData:state.promotions.promoData,//首屏
    Count:state.promotions.Count,//优惠总数
});

export default withRouter(connect(mapStateToProps)(PromotionsPage));
