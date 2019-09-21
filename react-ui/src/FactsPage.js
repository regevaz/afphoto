import React, { Component } from "react";
import { API_URL } from "./config";
import "./App.css";
import "./facts.css";

export default class FactsPage extends Component {
  state = {
  };

  getTodayFact = () => {
    fetch(`${API_URL}/today`)
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(todayFact => {
        console.log(todayFact);
        this.setState({ todayFact: `${todayFact.year}: ${todayFact.text}` });
      });
  };

  getMonrningQuote = () => {
    fetch(`${API_URL}/general`, {
      headers: {
        'X-RapidAPI-Proxy-Secret': 'f23bdaa0-cf46-11e9-958b-abae05127859'
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(morningQuote => {
        console.log(morningQuote);
        this.setState({ morningQuote: morningQuote.quote });
      });
  };

  render() {
    const {
      todayFact,
      morningQuote
    } = this.state;

    return (
      <div className="content">
        <div onClick={this.getTodayFact}>today fact</div>
        {todayFact}
        <div onClick={this.getMonrningQuote}>morning quote</div>
        {morningQuote}
      </div>
    );
  }
}
