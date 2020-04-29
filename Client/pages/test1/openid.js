// pages/openid/openid.js
const app = getApp()
const db = wx.cloud.database()
const context = wx.createCanvasContext('mycanvas');
Page({
  data: {
    openid: '',
    hasLogin:'',
    queryPath:'',
    pname:'',
    gender:'',
    age:'',
    maskHidden: false,
   // name: "",
   // userImg:"",
   // userHead:"",
  },
  //getopenid
getOpenid(callback){
  let that = this;
  wx.cloud.callFunction({
    name:'getOpenid',
    complete:res=>{
      console.log('云函数获取到的openid:',res.result.openid)
      var openid = res.result.openid;
      db.collection('pet').where({
        _openid:openid
        }).get({
        success:res=> {
          var pid = res.data[0].pid
          var age = this.getAge(res.data[0].age)
          console.log(age)
          this.queryPath(pid)
          this.setData({
            pname:res.data[0].name,
            age:age,
            gender:res.data[0].gender
          })
        }
        })
      that.setData({
        openid:openid,
      })
    }
  })
  },
 onLoad: function (options) {
  this.getOpenid();
  },
  queryPath(pid){
    //查pet的path
    console.log(pid)
    db.collection('pet_id').where({
      _id:pid.toString()
      }).get({
      success:res=>{
        console.log(res.data)
        console.log(res.data[0].pet_path)     
        this.setData({
          queryPath:res.data[0].pet_path
        }) 
      }
      })//
  },
  // 根据出生日期计算年龄周岁
getAge:function(strBirthday) {
  var returnAge = '';
  var mouthAge = '';
  var strBirthdayArr = strBirthday.split("-");
  var birthYear = strBirthdayArr[0];
  var birthMonth = strBirthdayArr[1];
  var birthDay = strBirthdayArr[2];
  var d = new Date();
  var nowYear = d.getFullYear();
  var nowMonth = d.getMonth() + 1;
  var nowDay = d.getDate();
  if (nowYear == birthYear) {
    // returnAge = 0; //同年 则为0岁
    var monthDiff = nowMonth - birthMonth; //月之差 
    if (monthDiff < 0) {
    } else {
      mouthAge = monthDiff + '个月';
    }
  } else {
    var ageDiff = nowYear - birthYear; //年之差
    if (ageDiff > 0) {
      if (nowMonth == birthMonth) {
        var dayDiff = nowDay - birthDay; //日之差 
        if (dayDiff < 0) {
          returnAge = ageDiff - 1 + '岁';
        } else {
          returnAge = ageDiff + '岁';
        }
      } else {
        var monthDiff = nowMonth - birthMonth; //月之差 
        if (monthDiff < 0) {
          returnAge = ageDiff - 1 + '岁';
        } else {
          mouthAge = monthDiff + '个月';
          returnAge = ageDiff + '岁';
        }
      }
    } else {
      returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
    }
  }
  return returnAge + mouthAge; //返回周岁年龄+月份
},
//以下是生成海报的逻辑
//将canvas转换为图片保存到本地，然后将图片路径传给image图片的src
createNewImg: function () {
  var that = this;
  context.setFillStyle("#fff")
  context.fillRect(0, 0, 375, 667)
  var path = "image/poster.jpg";
  context.drawImage(path, 56, 56, 262, 450);
  var path5 = "image/code.jpg";
  //文字
  context.setFontSize(14);
  context.setFillStyle('#333');
  context.setTextAlign('left');
  context.fillText("长按识别【萌宠创造营】", 70, 560);
  context.fillText(wx.getStorageSync('userNickname')+" 邀您一起", 70, 580);
  context.fillText("AR养萌宠啦~~", 70, 600);
  context.stroke();
  //绘制右下角小程序二维码
  context.drawImage(path5, 230, 530,80,80);
  context.draw();
  context.restore();
  context.save();

  //将生成好的图片保存到本地
  setTimeout(function () {
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        that.setData({
          imagePath: tempFilePath,
          canvasHidden: true
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  }, 200);
},

//点击生成
formSubmit: function () {
//放到GotUserInfo里了。因为要让它执行完获取信息再去画画，否则网络原因很有可能会获取不到信息
},
darwAvatarArc: function(context, src, x, y, w, h){
  /*
    context: 画布对象
    src: 头像缓存路径
    x: 头像起始位置 横坐标
    y: 头像起始位置 纵坐标
    w: 头像宽度
    h: 头像高度，不传为w
  */
  // 保存绘图上下文。
 // console.log("画头像");
  context.save();
  // 开始创建一个路径。需要调用 fill 或者 stroke 才会使用路径进行填充或描边
  context.beginPath()
  // 设创建一个圆可以指定 起始弧度为 0，终止弧度为 2 * Math.PI。
  // 用 stroke 或者 fill 方法来在 canvas 中画弧线。
  context.arc(x+w/2, y+h/2, w/2, 0, Math.PI * 2, false);
  /* 从原始画布中剪切任意形状和尺寸。
  一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内（
  不能访问画布上的其他区域）。可以在使用 clip 方法前通过使用 save 方法对当前画布区域进行保存，并在以后的任意时间通过restore方法对其进行恢复。
  */
  context.clip()
  // 画头像
  context.drawImage(src, x, y, w, h);
  // 恢复之前保存的绘图上下文。
  context.restore()
  // 将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中。
  context.draw(true)
},
//取消
closePos:function(){
  console.log("取消")
  this.setData({
    maskHidden:false
  })
},
onGotUserInfo:function(e){
  var that = this;
  this.setData({
    maskHidden: false
  });
  wx.showToast({
    title: '海报生成中...',
    icon: 'loading',
    duration: 1000
  });
//以上是formit的前半部分
  if(e.detail.userInfo){
    console.log("我这次点了确定的")
    if(!wx.getStorageSync('userNickname')&&!wx.getStorageSync('userImg')){//如果一开始用户就是拒绝的，那还要想法子再获取的
      wx.setStorageSync('userNickname',e.detail.userInfo.nickName)
      this.downuserHead(e.detail.userInfo.avatarUrl)     
    }    
   /* this.setData({
      name: e.detail.userInfo.nickName,
      userImg:e.detail.userInfo.avatarUrl,
    }) 不走setdata了，直接存储获取更快*/    
    else{//如果我前面已经授权了,直接画吧！！
      setTimeout(function () {
        wx.hideToast()
        console.log("有获取到头像吗？"+wx.getStorageSync('userImg'))
        that.createNewImg();
        that.darwAvatarArc(context, wx.getStorageSync('userImg'), 50, 50, 60, 60);//不用userhead的地址去画了
        that.setData({
          maskHidden: true
        });
      }, 1000)
    }     
  }
  else{
    console.log("用户又拒绝授权");
    wx.navigateTo({
      url: '../test1/openid',
    })
  }
},
downuserHead:function(userImg){
  var that = this;
  wx.downloadFile({
    url: userImg, 
    success: function(res) {
      if (res.statusCode === 200) {
        wx.setStorageSync('userImg', res.tempFilePath)
        console.log("一开始我是拒绝的，不过现在我的头像地址="+wx.getStorageSync('userImg'));
    }        
    },
  })
  //执行完再画（formit的后半部分）
  setTimeout(function () {
    wx.hideToast()
    console.log("有获取到头像吗？"+wx.getStorageSync('userImg'))
    that.createNewImg();
    that.darwAvatarArc(context, wx.getStorageSync('userImg'), 50, 50, 60, 60);//不用userhead的地址去画了
    that.setData({
      maskHidden: true
    });
  }, 1000)
},
onShareAppMessage: function (res) {
  return {
    title: "来'萌宠创造营'一起玩耍吧(*╹▽╹*)~",
    success: function (res) {
      console.log(res, "转发成功")
    },
    fail: function (res) {
      console.log(res, "转发失败")
    }
  }
},
  //点击保存到相册
  baocun: function () {
    var that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imagePath,
      success(res) {
        wx.showModal({
          content: '海报已保存到相册',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#333',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              that.setData({
                maskHidden: false
              })
            }
          }, fail: function (res) {
            console.log(11111)
          }
        })
      }
    })
  },
})