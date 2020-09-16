// pages/results/results.js
var app = getApp();
const db = wx.cloud.database()
Page({
  data: {
    totalScore:80, // 分数
    wrongList: [], // 错误的题数-乱序
    wrongListSort: [],  // 错误的题数-正序
    chooseValue: [], // 选择的答案
    remark: ["天啦噜，你太优秀了吧！(๑•̀ㅂ•́)و✧","不错哦(*^▽^*)（来自管理局小职员的肯定）","没事的，再来一次嘛！come on!"], // 评语
    modalShow: false,
    greencard:false,
  },
  onLoad: function (options) {
    console.log(options);
    wx.setNavigationBarTitle({ title: "萌创考试成绩单" }) // 动态设置导航条标题
    
    let wrongList = JSON.parse(options.wrongList);
    let wrongListSort = JSON.parse(options.wrongListSort);
    let chooseValue = JSON.parse(options.chooseValue);
    this.setData({
      totalScore: options.totalScore != ""?options.totalScore:"无",
      wrongList: wrongList,
      wrongListSort: wrongListSort,
      chooseValue: chooseValue,
      questionList: app.globalData.questionList[options.testId],  // 拿到答题数据
      testId: options.testId  // 课程ID
    })
    console.log(this.data.chooseValue);
  },
  // 查看错题
  toView: function(){
    console.log("点击再来一次")
    // 显示弹窗
   wx.navigateTo({
     url: '../final/final',
   })
  },
  // 返回首页
  toIndex: function(){
    console.log("点击领取绿卡")
    this.setData({
      greencard:true
    })
    //修改数据库逻辑:greencard=true,openid页面不再提示考试，右面显示一个图标表示已经获得绿卡了。
    


  },
  saveImage: function () {
    let that=this
    wx.getSetting({
      success(res) {
        //未授权 先授权 然后保存
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(re) {
              that.saveToBlum();
            }
          })
        }else{
         //已授 直接调用保存到相册方法
          that.saveToBlum();
        }
      }
    })  
  },
  saveToBlum:function(){
    let imgUrl = '../../images/greencard.jpg';
    wx.getImageInfo({
      src: imgUrl,
      success: function (ret) {
        var path = ret.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(result) {
            var greencard = 1
            db.collection('pet').where({
              _openid:wx.getStorageSync('openid')
            }).update({
              data: {
                greencard:greencard
              }
            }).then(res=>{
              console.log("修改greencard"+res)
            })
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
            wx.navigateTo({
              url: '../openid',
            })
          },
        })
      }
    })
  },
})