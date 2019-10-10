import React, { Component } from "react";
import { API_URL } from "./config";
import "./App.css";
import "./facts.css";

export default class OpenGatePage extends Component {
  state = {
  };

  render() {
    return (
      <div className="content">    
        <a href="tel:0549143938">Open the gate!</a>    
      </div>
    );
  }
}
