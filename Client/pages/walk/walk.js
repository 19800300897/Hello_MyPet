const app = getApp()
const db = wx.cloud.database()
var util = require('../../utils/util.js')
Page({
  data: {
    walk: 100,
    calory:0,
    pname:'',
    letter1:false,
    letter2:false,
    letter3:false,
    letter4:false,
    tips:false,
    isactive: true,
    disabled: false,
    todaywalk:"与宠物遛弯打卡",
    rank:0,
  },
  onLoad:function(options){
    db.collection('pet').where({
      _openid:wx.getStorageSync('openid')
      }).get({
      success:res=>{   
          var dktime = res.data[0].dktime
          var rank = wx.getStorageSync('rank')
   console.log("rank:"+rank)
   if(options.s == undefined) {
    this.setData({
      calory:0,
      pname:wx.getStorageSync('pname'),
      rank:rank,
    })
   }
   else{
   var calory = 65 * (options.s * 0.5 * 0.001) * 1.036;
   this.setData({
     walk:options.s,
     calory:calory.toFixed(2),
     pname:wx.getStorageSync('pname'),
   })
  }
  this.xianshi(dktime)
      }
      })
  },
  xianshi:function(dktime){
    var walk = this.data.walk
    console.log("步数："+walk)
     //是否显示“打卡”
    var xiangcha = wx.getStorageSync('walkxiangcha')
       if(walk<100){
      this.setData({
        disabled:true,
        todaywalk:"步数太少无法打卡"
      })
    }
     else if(xiangcha==0){
       this.setData({
         disabled:true,
         todaywalk:"已经打卡"
       })
     }//还在同一天呢

   if(walk==0){
    this.setData({
      letter1:true
    })
   }
   if(walk>0&&walk<=1000){
    this.setData({
      letter2:true
    })
   }
   if(walk>1000&&walk<=5000){
    this.setData({
      letter3:true
    })
   }
   if(walk>5000){
    this.setData({
      letter4:true
    })
   }
  },
  onTips:function(){
    var tip = this.data.tips
    this.setData({
      tips:!tip
    })
  },
  signIn() {
    var nowdate = new Date()
     console.log("打卡时间:"+util.formatTime(new Date()))
        wx.setStorageSync('dktime', new Date())
        this.setData({
          disabled:true,
          todaywalk:"已经打卡"
        })
         //用户积分+5逻辑
        var rank = wx.getStorageSync('rank')+5
        console.log("现在的rank is:"+rank)
        db.collection('pet').where({
          _openid:wx.getStorageSync('openid')
        }).update({
          data: {
            rank:rank,
            dktime:nowdate
          }
        }).then(res=>{
          console.log(res)
        })
       },
       onTap:function(){
         wx.navigateTo({
           url: '../test1/openid',
         })
       }
})