const modelBusiness = require('../../../utils/cameraBusiness.js')
const { registerGLTFLoader } = require('../../../utils/GLTFLoader.js');
const canvasId = 'canvas1';
var isDeviceMotion = false;
var isAndroid = false;
// camera listener
var listener = null;

Page({
  data: {
    devicePosition: 'front',
    modelUrl:''
  },
  onLoad(e) {
    var pid = Number(e.pid)
    console.log("pid="+pid)
    //计算url
    var url = 'https://pk.342996997.xyz/petmodels/'
    if(pid<=4){//猫
      var purl = pid+1
        url = url + 'cat'+purl+'_out/'+'cat'+purl+'fenli.gltf'
        console.log("地址："+url)
        this.setData({
          modelUrl:url
        })
    }
    else{//狗
      var purl = pid-4
      url = url + 'dog'+purl+'_out/'+'dog'+purl+'fenli.gltf'
      console.log("地址："+url)
      this.setData({
        modelUrl:url
      })
    }
    var _that = this;
    // set cameraStyle of camera by system platform
    const res = wx.getSystemInfoSync();
    console.log(res.system);
    if (res.system.indexOf('Android') !== -1) {
      isAndroid = true;
    }

    modelBusiness.initThree(canvasId,
      function (THREE) {
        modelBusiness.initScene(false);
        _that.loadModel(THREE);
      });
    modelBusiness.startDeviceMotion(isAndroid);
    isDeviceMotion = true;
    // temporarily disabled
    //_that.startTacking();
  },
  onUnload() {
    isDeviceMotion = false;
    modelBusiness.stopAnimate();
    modelBusiness.stopDeviceMotion();
    this.stopTacking();
    console.log('onUnload', 'listener is stop');
  },
  bindtouchstart_callback(event) {
    modelBusiness.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    modelBusiness.onTouchmove(event);
  },
  loadModel(THREE) {
    registerGLTFLoader(THREE);
    var loader = new THREE.GLTFLoader();
    wx.showLoading({
      title: '等下我先藏起来',
    });
    loader.load(this.data.modelUrl,
      function (gltf) {
        console.log('loadModel', 'success');
        wx.hideLoading();
        var model = gltf.scene;
        modelBusiness.addToScene(model);
      },
      null,
      function (error) {
        console.log('loadModel', error);
        wx.hideLoading();
        wx.showToast({
          title: 'Loading model failed.',
          icon: 'none',
          duration: 3000,
        });
      });
  },
  startTacking() {
    var _that = this;
    const context = wx.createCameraContext();

    if (!context.onCameraFrame) {
      var message = 'Does not support the new api "Camera.onCameraFrame".';
      console.log(message);
      wx.showToast({
        title: message,
        icon: 'none'
      });
      return;
    }

    // real-time
    listener = context.onCameraFrame(async function (res) {
      console.log('onCameraFrame:', res.width, res.height);
      const cameraFrame = {
        data: new Uint8Array(res.data),
        width: res.width,
        height: res.height,
      };
      modelBusiness.setCameraFrame(cameraFrame);
    });
    // start
    listener.start();
    console.log('startTacking', 'listener is start');
  },
  stopTacking() {
    if (listener) {
      listener.stop();
    }
  },
  changeDirection() {
    var status = this.data.devicePosition;
    if (status === 'back') {
      status = 'front';
    } else {
      status = 'back';
    }
    this.setData({
      devicePosition: status,
    });
  },
  touchIt:function(){
    wx.showToast({
      title: '摸摸头...',
      icon: 'loading',
      duration: 1000
    });
  }
});
