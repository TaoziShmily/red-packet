var app = getApp();
Page({
	data:{
		userInfo: {},
    balance:0.01,
	},
  getInputValue(e){
    console.log('e',e.detail.value)
    if(e.detail.value > this.data.balance){
      wx.showToast({
      title: '提现金额超过账户余额',
      icon:'none',
      duration: 2000
    })

    }
  },
	onLoad: function () {
      var that = this;
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log('app.globalData.userInfo',app.globalData.userInfo)
    }

})