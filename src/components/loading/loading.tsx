import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="loadBox" id="loadBox" style={{display:"none"}}>
      <div className="loader"></div>
    </div>
  );
};


export default Loading;
