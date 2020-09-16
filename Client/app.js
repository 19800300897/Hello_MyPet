//app.js
var jsonList = require('data/json.js'); 
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.cloud.init({
      env:'test-855um',
      traceUser:true
    })
  },
  globalData: {
    userInfo: null,
    questionList: jsonList.questionList  // 拿到答题数据
  }
})