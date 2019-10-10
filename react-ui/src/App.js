import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import HomePage from './HomePage';
import FactsPage from './FactsPage';
import OpenGatePage from './OpenGatePage';

function App() {
  return (<Router>
    <Route exact path="/" component={HomePage} />
    <Route exact path="/home" component={HomePage} />
    <Route exact path="/facts" component={FactsPage} />
    <Route exact path="/gate" component={OpenGatePage} />
  </Router>);
}

export default App;