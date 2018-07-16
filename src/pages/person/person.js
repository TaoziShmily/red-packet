const app = getApp()
Page({
	data:{
		userInfo: {},
		list:[
			{src:'/images/icon_qianbao.png',name:'钱包',url:"/pages/withdraw/withdraw"},
			{src:'/images/icon_shizhong.png',name:'我的记录',url:'/pages/record/record'},
			{src:'/images/icon_wenti.png',name:'常见问题',url:'/pages/person/issue/issue'},
			// {src:'/images/icon_kefu.png',name:'联系客服'},
		]
	},
	onLoad: function () {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
   }
})