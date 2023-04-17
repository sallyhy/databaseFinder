import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');
// Date.prototype.locale = moment.locale


ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
