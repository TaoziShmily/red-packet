//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    firstInfo:{},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // showFlag:false,
    infos:[
      // {name:'设置口令',placeholder:'设置口令',type:'number',disabled:'true',url:'/pages/index/password/password'},
      {name:'输入金额',placeholder:'填写红包总金额(总)',type:'number',disabled:'false',url:''},
      {name:'红包个数',placeholder:'填写个数',type:'number',disabled:'false',url:''},
    ]
  },
  onLoad: function () {
    this.setData({
      firstInfo:this.data.infos[0]
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo(e) {
    console.log(e)
    if(e.detail.errMsg == 'getUserInfo:fail auth deny'){
        this.setData({
          showFlag:true
        })
    }else{
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true
      })
    }
    
  },
  goRecordPage(){
    console.log('222')
    wx.navigateTo({
      url: '/pages/record/record'
    })
  },
  onShareAppMessage: function (res) {
      return {
        title: '语音红包',
        path: 'pages/index/index',
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
  }
})
