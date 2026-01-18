import React from 'react';
import ReactDOM from 'react-dom';
import './CSS/index.css';
import App from './App';
import {Globalstate}  from './state/provider';
import reducer, { initialstate } from './state/reducer';

ReactDOM.render(
  <Globalstate initialstate={initialstate} reducer={reducer}>
    <App />
  </Globalstate>,
  document.getElementById('root')
);
