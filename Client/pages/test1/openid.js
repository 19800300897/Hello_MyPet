// pages/openid/openid.js
const app = getApp()
const db = wx.cloud.database()
const context = wx.createCanvasContext('mycanvas');
const innerAudioContext = wx.createInnerAudioContext()
Page({
  data: {
    openid: '',
    hasLogin:'',
    queryPath:'',
    pname:'',
    gender:'',
    age:'',
    maskHidden: false,
    walk:0,
    rank:0,//铲屎官等级
    dialogShow: false,//考试题型窗口
    buttons: [{text: '稍后再说'}, {text: '参加'},{text: '永不提醒'}],
    greencard:0,
    showOneButtonDialog: false,
    oneButton: [{text: '确定'}],
    food:5,
    count:0,//语音提醒else里面的次数
    showFile:false,
    whatpet:'',
  },
  //getopenid
getOpenid(callback){
  let that = this;
  wx.cloud.callFunction({
    name:'getOpenid',
    complete:res=>{
      console.log('云函数获取到的openid:',res.result.openid)
      var openid = res.result.openid;
      wx.setStorageSync('openid', openid)//openid存到本地里去了
      db.collection('pet').where({
        _openid:openid
        }).get({
        success:res=> {
          console.log("数据库里的等级："+res.data[0].rank+"~~~数据库里获得绿卡了吗？"+res.data[0].greencard)
          var pid = res.data[0].pid
          var age = this.getAge(res.data[0].age)
          var fdtime = res.data[0].fdtime
          wx.setStorageSync('pname', res.data[0].pname)//为了后面显示昵称用的
          wx.setStorageSync('rank', res.data[0].rank) //后面加等级要用的
          wx.setStorageSync('greencard',  res.data[0].greencard)//如果获得绿卡/永不提醒了就要显示，并且不再提醒用户要考试      
          wx.setStorageSync('pid', pid)
          this.walktip(res.data[0].dktime)
          if(this.foodtip(fdtime)>=1){//第二天来打卡,不用担心耗内存，一天就这一次执行
            wx.setStorageSync('food', 0)//清零了
            db.collection('pet').where({
              _openid:wx.getStorageSync('openid')
            }).update({
              data: {
                food:0
              }
            }).then(res=>{
              console.log("投喂的次数清零："+res.errMsg)
            })
          }
          else  wx.setStorageSync('food', res.data[0].food)//当日投喂次数
          wx.setStorageSync('dktime', res.data[0].dktime)//当日投喂次数
          this.queryPath(pid)
          this.setData({
            pname:res.data[0].pname,
            age:age,
            gender:res.data[0].gender,
            rank: res.data[0].rank,
            greencard:res.data[0].greencard,
            food:res.data[0].food,
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
  if(wx.getStorageSync('rank')>=100&&wx.getStorageSync('greencard')==0){
    console.log("考试考试！")
    //毕业逻辑：答题和发放萌创绿卡
    this.setData({
      dialogShow:true
    })
  }
  
  },
  foodtip:function(fdtime){
    //记录投喂时间，明天就清零
    console.log("上次投喂的时间："+fdtime)
    var nowdate = new Date()
    console.log("现在的时间："+nowdate)
    var xiangcha = parseInt((nowdate-fdtime)/(1000 * 60 * 60 * 24))
    if(xiangcha==0&&(nowdate.getDate()!=fdtime.getDate())){//过了12点，但没有过24个小时,也算相差一天
         xiangcha = 1
    }
    console.log("投喂相差天数："+xiangcha)
    return xiangcha
    //投喂逻辑结束
  },
  walktip:function(dktime){
        //提醒遛狗逻辑开始
        dktime = new Date(dktime)
        console.log("上次遛狗的时间"+dktime)
        var nowdate = new Date()
        var xiangcha = parseInt((nowdate-dktime)/(1000 * 60 * 60 * 24))
        if(xiangcha==0&&(nowdate.getDate()!=dktime.getDate())){//过了12点，但没有过24个小时,也算相差一天
             xiangcha = 1
        }
        console.log("遛狗相差："+xiangcha)
        wx.setStorageSync('walkxiangcha',xiangcha)
        //提醒遛狗逻辑结束
  },
  queryPath(pid){
    //查pet的path
    console.log(pid)
    db.collection('pet_id').where({
      _id:pid.toString()
      }).get({
      success:res=>{   
        this.setData({
          queryPath:res.data[0].pet_path
        }) 
      }
      })//
  },
  // 根据出生日期计算年龄周岁
getAge:function(strBirthday) {//实时增长的年龄
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
  var path = "../images/poster.jpg";
  context.drawImage(path, 56, 56, 262, 450);
  var path5 = "../images/code.jpg";
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
//放到GotUserInfo里了。因为要让它执行完获取信息再去画画，否则网 络原因很有可能会获取不到信息
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
onGotWalk:function(){
  var that = this
  console.log("遛狗去")
  wx.getWeRunData({
    success:res=> {
      console.log("cloudID？"+res.cloudID)     
      wx.cloud.callFunction({
        name: 'weRun',
        data: {
          weRunData: wx.cloud.CloudID(res.cloudID), // 这个 CloudID 值到云函数端会被替换
        },
      }).then(resData=>{     
        console.log(resData.result.event.weRunData.data.stepInfoList[30].step)
        wx.setStorageSync('walk', resData.result.event.weRunData.data.stepInfoList[30].step)
        that.setData({
         walk:resData.result.event.weRunData.data.stepInfoList[30]
          })
          this.tiaozhuan(resData.result.event.weRunData.data.stepInfoList[30].step)
         })
     },
})
},
tiaozhuan:function(wewalk){
  wx.navigateTo({
    url: '../walk/walk?s='+wewalk,
  })
},
onCamera:function(){
console.log("合照")
//用户积分+5逻辑
var rank = Number(wx.getStorageSync('rank'))+5
wx.setStorageSync('rank', rank)
console.log("现在的rank is:"+rank)
db.collection('pet').where({
  _openid:wx.getStorageSync('openid')
}).update({
  data: {
    rank:rank
  }
}).then(res=>{
  console.log(res)
})
wx.navigateTo({
  url: '../../package_3d_viewer/pages/camera/camera?pid='+wx.getStorageSync('pid'),
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
  //加10个积分的逻辑
  var rank = Number(wx.getStorageSync('rank'))+10
  wx.setStorageSync('rank', rank)
console.log("现在的rank is:"+rank)
db.collection('pet').where({
  _openid:wx.getStorageSync('openid')
}).update({
  data: {
    rank:rank
  }
}).then(res=>{
  console.log(res)
})
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
  tapDialogButtonfinal:function(e){//参加萌创考试嘛？
    console.log(e.detail.index) //0是取消，1是确定，2是永不提醒
    if(e.detail.index==1){
      wx.navigateTo({
        url: '../test1/final/final',
      })
    }
    else if(e.detail.index==2) {
      console.log("永不提醒")
      db.collection('pet').where({
        _openid:wx.getStorageSync('openid')
      }).update({
        data: {
          greencard:-1
        }
      }).then(res=>{
        console.log(res)
      })
    }
    this.setData({
      dialogShow:false,
    })
  },
  gotoFinal:function(){
    wx.navigateTo({
      url: 'final/final',
    })
  },
  refresh:function(){
    wx.navigateTo({
      url: 'openid',
    })
  },
  toEat:function(){
    this.setData({
      showOneButtonDialog: true,
    })
    console.log("投喂")
    var nowdate = new Date()
    wx.setStorageSync('fdtime', nowdate)//现在的时间就是更新的投喂时间
    console.log( wx.getStorageSync('fdtime'))
//用户积分+2逻辑
var food = Number(wx.getStorageSync('food'))+1
this.setData({//超过4次就会弹窗提醒了
  food:food
})
wx.setStorageSync('food', food)//更新本地food数据
if(this.data.food>4){//可以投喂，只是不涨积分了
  console.log("现在的投喂次数 is:"+food)
db.collection('pet').where({
  _openid:wx.getStorageSync('openid')
}).update({
  data: {
    food:food,
    fdtime:nowdate
  }
}).then(res=>{
  console.log(res)
})
}
else{//小于4次的话加入涨积分逻辑
var rank = Number(wx.getStorageSync('rank'))+2
wx.setStorageSync('rank', rank)
console.log("现在的rank is:"+rank)
console.log("现在的投喂次数 is:"+food)
db.collection('pet').where({
  _openid:wx.getStorageSync('openid')
}).update({
  data: {
    food:food,
    rank:rank,
    fdtime:nowdate
  }
}).then(res=>{
  console.log(res)
})
}
  },
  tapDialogButton(e) {//提示投喂成功
    this.setData({
        showOneButtonDialog: false
    })
},
toSpeak:function(){
  console.log("说话")
  if(wx.getStorageSync('food')<1){//提醒要投喂
    console.log("饿了呀")
    innerAudioContext.src = "cloud://test-855um.7465-test-855um-1301750668/hungry.wav"
    if(innerAudioContext.src == "cloud://test-855um.7465-test-855um-1301750668/hungry.wav")
    innerAudioContext.play();   
    else
    innerAudioContext.onCanplay(() => {
      innerAudioContext.play();     
      })
    innerAudioContext.onStop((res) => {
      console.log('音乐停止')
      })
      innerAudioContext.onPause((res) => {
        console.log('音乐暂停')
        })
  }
  else if(wx.getStorageSync('walkxiangcha')>=1){//提醒要遛狗
    console.log("好无聊，要出去玩")
    innerAudioContext.src = "cloud://test-855um.7465-test-855um-1301750668/gotoplay.wav"
    if(innerAudioContext.src == "cloud://test-855um.7465-test-855um-1301750668/gotoplay.wav")
    innerAudioContext.play();   
    else
    innerAudioContext.onCanplay(() => {
      innerAudioContext.play();     
      })
    innerAudioContext.onStop((res) => {
      console.log('音乐停止')
      })
      innerAudioContext.onPause((res) => {
        console.log('音乐暂停')
        })
  }
  else{//没有什么提醒  
      var count = this.data.count
    if(count == 0){
      console.log("养宠饲养指南")
    innerAudioContext.src = "cloud://test-855um.7465-test-855um-1301750668/饲养指南2.wav"
    innerAudioContext.onCanplay(() => {
      innerAudioContext.play();     
      })
    innerAudioContext.onStop((res) => {
      console.log('音乐停止')
      })
      innerAudioContext.onPause((res) => {
        console.log('音乐暂停')
        })
    count = count + 1
    }
    else if(count == 1){
      console.log("想见你")
      innerAudioContext.src = "cloud://test-855um.7465-test-855um-1301750668/想见你.wav"
      innerAudioContext.onCanplay(() => {
        innerAudioContext.play();     
        })
      innerAudioContext.onStop((res) => {
        console.log('音乐停止')
        })
      count = count + 1
    }
    else if(count == 2){
      console.log("秘密呀")
      innerAudioContext.src = "cloud://test-855um.7465-test-855um-1301750668/秘密.wav"
      innerAudioContext.onCanplay(() => {
        innerAudioContext.play();     
        })
      innerAudioContext.onStop((res) => {
        console.log('音乐停止')
        })
      count = count + 1
    }
    else {
      console.log("只有你")
      innerAudioContext.src = "cloud://test-855um.7465-test-855um-1301750668/只有你.wav"
      innerAudioContext.onCanplay(() => {
        innerAudioContext.play();     
        }) 
      innerAudioContext.onStop((res) => {
        console.log('音乐停止')
        })
      count = 0
    }
    this.setData({
      count:count
    })
  }
},
gotoLogs:function(){
  wx.navigateTo({
    url: '../../readGuide/logs/logs',
  })
},
showFile:function(){
  console.log("显示宠物档案")
  var showFile = this.data.showFile
  this.setData({
    showFile:!showFile
  })
},
refresh:function(){
  console.log("刷新")
  wx.navigateTo({
    url: 'openid',
  })
}
})