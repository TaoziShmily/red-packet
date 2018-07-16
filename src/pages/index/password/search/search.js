Page({
	data:{
		inputValue:false,
		btn:'取消',
		creatPwd:false,
		myPwd:[
			{name:'哈哈哈'},
			{name:'东南书店'},
		],
		hotPwd:[
			{name:'摩卡金打赏猫粮'},
			{name:'魔法弹硕大的'},
			{name:'分类看到的'},
		],
		resultPwd:[
			{name:'看你打看电视那'},
			{name:'刚上来方面水电费没开门'},
			{name:'而后袜何建大大你洒水等你'},
		]
	},
	bindinputTap(e){
		console.log('e',e)
		if(e.detail.value != ''){
			this.setData({
				inputValue:true,
				btn:'申请创建'

			})
		}
	},
	creatPwdTap(){
		this.setData({
			creatPwd:true
		})
	},
	usePwdTap(){
		wx.redirectTo({
		  	url: '/pages/index/password/password'
		})
	}

})