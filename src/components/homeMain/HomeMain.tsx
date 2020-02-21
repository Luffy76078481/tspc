import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import BaseClass from "@/baseClass";
import "swiper/dist/css/swiper.min.css";
import "./HomeMain.scss";

class HomeMain extends BaseClass {
  constructor(props: any) {
    super(props, [])
  }

  render() {
    return (
      <div className="HomeMain">
        asd
      </div>
    );
  }


}



const mapStateToProps = (state: any, ownProps: any) => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps)(HomeMain));
