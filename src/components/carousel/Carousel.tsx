import Swiper from "swiper"; // 滑动插件
import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import baseClass from "@/baseClass";
import "swiper/dist/css/swiper.min.css";
import "./Carousel.scss";

interface State {
  pcAdsList: []
}
class Carousel extends baseClass {
  public state: State = {
    pcAdsList: []
  }
  constructor(props: any) {
    super(props, ["pcAdsList"]);
  }

  componentDidMount() {
    this.init();
  }
  componentDidUpdate(): void {
    this.init();
  }

  init() {
    // new Swiper("#homeSwiper", {
    //   loop: true,
    //   slidesPerView: "auto",
    //   autoplay: {
    //     delay: 3000,
    //     stopOnLastSlide: false,
    //     disableOnInteraction: true,
    //   },
    //   pagination: {
    //     el: ".swiper-pagination",
    //     // clickable: true,
    //     // dynamicBullets: true
    //   }
    // });
    // var _this = this;
    new Swiper('#homeSwiper', {
      loop: true,
      slidesPerView: "auto",
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: true,
      },
      navigation: {
        nextEl: '.swiper-button-next-carousel',
        prevEl: '.swiper-button-prev-carousel',
      },
      pagination: {
        el: '#smswo',
        clickable: true,
        type:'bullets',
        // renderBullet: function (index, className) {
        //   return `
        //     <div class="carThumBox ${className}">
        //       <img
        //         src=${window.config.devImgUrl + _this.props.pcAdsList[index].ImgUrl}
        //         alt="1"
        //       />
        //     </div>
        //   `;
        // },
      },
    });
  }


  static getDerivedStateFromProps(props: any, state: State) {
    if (props.pcAdsList.length !== state.pcAdsList.length) {
      return {
        pcAdsList: props.pcAdsList
      }
    }
    return null;
  }

  render() {
    return (
      <div className="Carousel">
        <div className="swiper-container" id={"homeSwiper"}>
          <div className="swiper-wrapper">
            {this.renderBanner()}
          </div>
          <div className="swiper-button-next swiper-button-next-carousel swiper-button-white"></div>
          <div className="swiper-button-prev swiper-button-prev-carousel swiper-button-white"></div>
        </div>
        <div className="swiper-pagination" id="smswo"></div>
      </div>
    );
  }

  openBanner(link: string) {
    if (!link) return;
    window.open(link, "_blank");

  }

  //Banner渲染
  renderBanner() {
    let banner: any[] = [];
    this.props.pcAdsList.forEach((img: any, index: number) =>
      banner.push(
        <div key={img.Id} className={"swiper-slide"}>
          <a
            onClick={this.openBanner.bind(this, img.Link)}
            style={{
              display: "inline-block",
              width: "100%"
            }}
          >
            <img
              key={index}
              src={window.config.devImgUrl + img.ImgUrl}
              alt=""
              style={{ width: "100%", verticalAlign: "top" }}
            />
          </a>
        </div>
      )
    );
    return banner;
  }
}

const mapStateToProps = (state: any, ownProps: any) => ({
  pcAdsList: state.pcAdsList
});

export default withRouter(connect(mapStateToProps)(Carousel));
