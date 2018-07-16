Page({
	data:{
		adsImage:'/images/WechatIMG1359.jpg',
		list:[
			{avator:'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1341615326,3425514977&fm=27&gp=0.jpg',name:'周舒舒',sex:'female',duration:8,money:'0.03',time:'6月18号 08:34'},
			{avator:'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1341615326,3425514977&fm=27&gp=0.jpg',name:'周舒舒',sex:'female',duration:8,money:'0.03',time:'6月18号 08:34'},
			{avator:'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1341615326,3425514977&fm=27&gp=0.jpg',name:'周舒舒',sex:'female',duration:8,money:'0.03',time:'6月18号 08:34'}
		]

	},
	// previewImage: function (e) {  
	// 	var current=e.target.dataset.src;
	// 	console.log('e',e)
	// 	wx.previewImage({
	// 	  	current:current, // 当前显示图片的http链接
	// 	  	urls: '' // 需要预览的图片http链接列表
	// 	})
	// }
	goWithdrawPage(){
		wx.navigateTo({
		  url: '/pages/withdraw/withdraw'
		})
	},
	goHomePage(){
		wx.switchTab({
		  url: '/pages/index/index'
		})
	},
	onShareAppMessage: function (res) {
	    return {
	      title: '语音红包',
	      path: 'pages/voice/voice',
	      success: function(res) {
	        // 转发成功
	      },
	      fail: function(res) {
	        // 转发失败
	      }
	    }
  }
})