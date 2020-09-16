// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
 const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event是什么",event);
  var pname = event.pname
  var age = event.age
  var gender = event.gender
  var pid = event.pid
  var openid = event.openid
  var rank = event.rank
  var greencard = event.greencard
  var dktime = new Date(JSON.parse(event.dktime))
  var food = event.food
  var fdtime = new Date(JSON.parse(event.fdtime))
 //更新数据库的内容
 console.log('云函数修改！！！')
return db.collection('pet').where({
  _openid:openid
}).update({
  data: {
    name:pname,
    age:age,
    gender:gender,
    pid:pid,
    openid:openid, //可要可不要，不过还是先留着吧
    rank:rank,
    greencard:greencard,
    dktime:dktime,
    food:food,
    fdtime:fdtime,
  }
}).then(res=>{
  console.log(res)
})
}