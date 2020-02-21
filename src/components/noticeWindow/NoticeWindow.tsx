import React from "react";
import { connect } from "react-redux";
import BaseClass from "@/baseClass";
import { getSession, setSession } from "tollPlugin/commonFun";
import Swiper from 'swiper'
import "swiper/dist/css/swiper.min.css";
import "./NoticeWindow.scss";



class NoticeWindow extends BaseClass {
  public mySwiper: any
  swiper: any
  constructor(props: any) {
    super(props, ["homePromotion"]);
    this.state = {
      showNotice: !getSession("showNotice"),
      homePromotion:[]
    }
  }

  componentDidMount() {
    if (this.props.homePromotion.length > 0) {
      this.init()
    }
  }

  componentDidUpdate(prevProps:any, prevState:any){
    if(prevState.homePromotion.length!==this.state.homePromotion.length){
      this.init();
    }

  }

  static getDerivedStateFromProps(props: any, state: any) {
    if (props.homePromotion.length !== state.homePromotion.length) {
      return {
        homePromotion: props.homePromotion,
      }
    }
    return null;
  }

  init() {
    if (this.swiper) {
      this.swiper.slideTo(0, 0)
      this.swiper.destroy()
      this.swiper = null;
    }
    // 一张不自动轮播
    if (this.props.homePromotion.length !== 1) {
      this.swiper = new Swiper(this.mySwiper, {
        autoplay: { delay: 4000, stopOnLastSlide: false, disableOnInteraction: true },
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        }
      });
    }
  }

  render() {
    return (
      <div className="NoticeWindow" style={{ "display": this.state.showNotice && this.props.homePromotion.length>0 ? "block" : "none" }} >
        <div className="swiper-container noticeBox" ref={mySwiper => { this.mySwiper = mySwiper }}>
          <div className="swiper-wrapper">
            {
              this.props.homePromotion.map((item: any, index: number) => (
                <div key={index} className="swiper-slide">
                  <a href={item.externalLink} target="blank" className="mainBody">
                    <div className="popBox_body" style={!item.Content.includes('<img') ? { 'padding': "10px" } : { "padding": 0 }} dangerouslySetInnerHTML={{ __html: item.Content }}></div>
                    <div className="icon iconfont iconiconclose popBox_close" aria-hidden="true" onClick={this.closeNotice.bind(this)}></div>
                  </a>
                </div>
              ))
            }
          </div>
          <div className="swiper-pagination"></div>
        </div>
      </div>
    );
  }

  closeNotice() {
    setSession("showNotice", "true");
    this.setState({
      showNotice: false
    })
  }


}



const mapStateToProps = (state: any, ownProps: any) => ({
  homePromotion: state.homePromotion
});

export default connect(mapStateToProps)(NoticeWindow);
