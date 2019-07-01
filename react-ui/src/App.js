import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import HomePage from './HomePage';

function App() {
  return (<Router>
    <Route exact path="/" component={HomePage} />
    <Route exact path="/home" component={HomePage} />
  </Router>);
}

export default App;