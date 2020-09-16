//index.js
//获取应用实例
const db = wx.cloud.database()
const app = getApp()
Page({
  data: {
    array: ['点击这里选择年龄ฅฅ','0个月', '1个月', '3个月','6个月','一岁','两岁','三岁','四岁','五岁','六岁'],
    banner:['cloud://test-855um.7465-test-855um-1301750668/cat1.png',
          'cloud://test-855um.7465-test-855um-1301750668/cat2.png',
          'cloud://test-855um.7465-test-855um-1301750668/cat3.png',
          'cloud://test-855um.7465-test-855um-1301750668/cat4.png',
          'cloud://test-855um.7465-test-855um-1301750668/cat5.png',
          'cloud://test-855um.7465-test-855um-1301750668/dog1.png',
           'cloud://test-855um.7465-test-855um-1301750668/dog2.png',
           'cloud://test-855um.7465-test-855um-1301750668/dog3.png',
           'cloud://test-855um.7465-test-855um-1301750668/dog4.png',
           'cloud://test-855um.7465-test-855um-1301750668/dog5.png',
  ],
    showOneButtonDialog: false,
    oneButton: [{text: '确定'}],
    index: 0,
    dates: '2016-11-08',
    xindex:0,
    openid:'',
    type:false,
    list:[],//表单里的数据
    buttons: [
      {
          type: 'default',
          className: '',
          text: '确认更换',
          value: 0
      },
      {
          type: 'primary',
          className: '',
          text: '进入小窝',
          value: 1
      }
  ]
  },
  onLoad: function (options) {
  //出生日期那一块显示日期
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年份  
    var Y =date.getFullYear();
    //获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); 
    console.log(Y + '-'  + M+ '-' + D );
    this.setData({
      dates:Y + '-'  + M+ '-' + D
    })
    this.getOpenid();
      },

      //轮播图转换
  onChange: function (e) {
    this.setData({
      xindex: e.detail.current
    });
    console.log(e.detail.current); //current下标
  },
  
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      dates: e.detail.value
    })
  },
//提交表单
  formSubmit(e) {
    var pname = e.detail.value.pname
    var gender = e.detail.value.gender
    if (pname == '') {
      wx.showToast({
        title: '宠物名字不能为空',
        icon: "none"
      })
      return;
    }
    else if (gender == '') {
      wx.showToast({
        title: '宠物性别不能为空',
        icon: "none"
      })
      return;
    }
    var age = this.data.dates

    var pid = this.data.xindex
    var openid = this.data.openid
    var data = [pname,age,gender,pid,openid]
    this.setData({
      list:data
    })
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    db.collection('pet').where({
      _openid:openid
      }).get({
      success:res=> {
        var count = res.data.length
        this.verifyCount(count,pname,age,gender,pid,openid)
      }
      })
  },
  //获取用户唯一标识
  getOpenid(){
    let that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        console.log('云函数获取到的openid:',res.result.openid)
        var openid = res.result.openid;
        that.setData({
          openid:openid
        })
      }
    })
    },
    //判断有几个宠物
    verifyCount(count,pname,age,gender,pid,openid){
        console.log("count:",count)
        if(count>=1){//多了的话就弹出弹窗
            this.setData({
              type:true
            })
        }else{ //以前没有添加过宠物，就添加上呗
          const petcollection = db.collection("pet")
          petcollection.add({
            data:{
              pname:pname,
              age:age,
              gender:gender,
              pid:pid,
              openid:openid,
              rank:0,
              greencard:0,
              dktime:"Mon May 11 2020 15:50:29 GMT+0800 (中国标准时间)",
              food:0,
              fdtime:"Mon May 11 2020 15:50:29 GMT+0800 (中国标准时间)",
            }
          })
          wx.navigateTo({
            url: '../test1/openid',
          })
        }
    },
    //弹窗按钮dialog的事件触发
    buttontap(e) {
      this.setData({
        type:true
      })
      //先把表单数据拿过来
      var data = this.data.list
      console.log("表单数据：",data)//验证有没有拿到数据
      if(e.detail.index==0){
        console.log("确认更换")
        var pname = data[0]
        var age = data[1]
        var gender = data[2]
        var pid = data[3]
        var openid = data[4]
        //云函数更新数据库
          db.collection('pet').where({
            _openid:openid
          }).update({
            data: {
              pname:pname,
              age:age,
              gender:gender,
              pid:pid,
              openid,openid,
              rank:0,
              greencard:0,
              dktime:JSON.stringify("Mon May 11 2020 15:50:29 GMT+0800 (中国标准时间)"),
              food:0,
              fdtime:JSON.stringify("Mon May 11 2020 15:50:29 GMT+0800 (中国标准时间)"),
            }
          }).then(res=>{
            console.log('云函数执行修改方法成功')      
            wx.navigateTo({
              url:'../test1/openid'
            })          
          })
        }
      else{
        console.log("进入小窝")
        wx.navigateTo({
          url:'../test1/openid'
        })
      }
  },
  //以下是按确定后 获取用户信息
  GotUserInfo: function (info) {
    var that = this
    if(info.detail.userInfo){
        console.log("用户同意了获取用户信息！")
        this.downuserHead(info.detail.userInfo.avatarUrl) 
        wx.setStorageSync('userNickname', info.detail.userInfo.nickName)       
    }    
  },
  downuserHead:function(userImg){
    wx.downloadFile({
      url: userImg, 
      success: function(res) {
        if (res.statusCode === 200) {
          wx.setStorageSync('userImg',res.tempFilePath)
      } 
        console.log("临时地址"+res.tempFilePath)    
      },
    })
    
  },
  onTap:function(){
    var openid = this.data.openid
    db.collection('pet').where({
      _openid:openid
      }).get({
      success:res=> {
        var count = res.data.length
        if(count>0){
          wx.navigateTo({
            url: '../test1/openid',
          })
        }
        else{//没有宠物
          console.log("没有宠物")
          this.setData({
            showOneButtonDialog:true
          })
        }
      }
      })

   },
   tapDialogButton(e) {
    this.setData({
        showOneButtonDialog: false
    })
},
})