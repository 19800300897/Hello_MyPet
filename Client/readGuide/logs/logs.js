const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    datalist:[],
    num:""
  },
  //事件处理函数
  bindViewTap: function() {
   
  },
    //跳转到详情
  toDetail: function(e){
    console.log(e)
    var detailid = e.currentTarget.dataset.detailid
    //给多项view动态改变样式
    //加积分
      var rank = Number(wx.getStorageSync('rank')) + 5//积分加5
      wx.setStorageSync('rank', rank)
      console.log("现在的rank is:"+rank)
    db.collection('pet').where({
      _openid:wx.getStorageSync('openid')
    }).update({
    data: {
    rank:rank,
    _readed: _.addToSet(detailid)
  }
    }).then(res=>{
  console.log(res)
    })
//加积分结束
   let num = e.currentTarget.dataset.num
    if (this.data.datalist[num].state == 0) {
       this.data.datalist[num].state = 1;
           } 
       this.setData({
        datalist: this.data.datalist,
           })   
   

      wx.navigateTo({
        url: '../xiangqing/content?id='+detailid,
      })
    } ,
  getDataList(){
    wx.showLoading({
      title: '玩命加载中',
    })
      let len=this.data.datalist.length
      wx.cloud.database().collection("zixun_list").skip(len).limit(10).get().then(res => {
        console.log("云函数获取数据成功",res)
        this.setData({
          datalist:this.data.datalist.concat(res.data)
        })
        wx.hideLoading()
      })
      .catch(res=>{
        console.log("云函数获取数据失败",res)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
        })
      })
  },
  onLoad: function () {
    var openid = wx.getStorageSync('openid')
    console.log(openid)
    //查询数据库的代码：
      db.collection('pet').where({
      _openid:openid
      }).get({
      success:res=>{   
       console.log("我看了那些条新闻",res.data[0]._readed)//把查询到的用户的信息取出来了，比如res.data[0].name是宠物姓名
      }
      })
    this.getDataList()
    let lens=this.data.datalist.length
  },
  onReachBottom: function () {
    this.getDataList()
 },
})

