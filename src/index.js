import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GlobalStyles } from 'twin.macro';
import { Provider } from 'jotai';

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyles />
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
