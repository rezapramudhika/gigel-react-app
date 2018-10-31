import React, { Component } from 'react';
// import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Index from './components/confirm-payment';
import ConfirmPayment from './components/confirm-payment/confirmPayment';
import NoMatchPage from './components/confirm-payment/noMatchPage';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
            <Switch>
              {/* <Route path='/confirm' component={ConfirmPayment}/>
              <Route path='/page/404' component={NoMatchPage} />
              <Route exact path='/:auth' component={Index} /> */}
              <Route path='/user/confirm-payment/v2/confirm' component={ConfirmPayment}/>
              <Route path='/user/confirm-payment/v2/page/404' component={NoMatchPage} />
              <Route exact path='/user/confirm-payment/v2/:auth' component={Index} />
              {/* <Redirect from='*' to='/page/404' /> */}
            </Switch>
        </BrowserRouter>
    );
  }
}

export default App;
