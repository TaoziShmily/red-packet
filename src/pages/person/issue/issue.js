// issue
// 
Page({
	data:{
		category: [
			{id:1,name:'包你说语音红包怎么玩？',kb:[{id:1,title:'你可以设置一个带奖励的语音红包，好友说对口令才能领取红包'}]},
			{id:2,name:'为什么我不能设置口令红包？',kb:[{id:1,title:"Google多种语言之间的互译功能,可让您即时翻译字词、短语和网页内容"},{id:2,title:"爱词霸英语为广大网友提供在线翻译、在线词典、英语口语、英语学习资料"}]},
			{id:1,name:'包你说语音红包怎么玩？',kb:[{id:1,title:'你可以设置一个带奖励的语音红包，好友说对口令才能领取红包'}]},
			{id:2,name:'为什么我不能设置口令红包？',kb:[{id:1,title:"Google多种语言之间的互译功能,可让您即时翻译字词、短语和网页内容"},{id:2,title:"爱词霸英语为广大网友提供在线翻译、在线词典、英语口语、英语学习资料"}]},
			{id:1,name:'包你说语音红包怎么玩？',kb:[{id:1,title:'你可以设置一个带奖励的语音红包，好友说对口令才能领取红包'}]},
			{id:2,name:'为什么我不能设置口令红包？',kb:[{id:1,title:"Google多种语言之间的互译功能,可让您即时翻译字词、短语和网页内容"},{id:2,title:"爱词霸英语为广大网友提供在线翻译、在线词典、英语口语、英语学习资料"}]},
			{id:1,name:'包你说语音红包怎么玩？',kb:[{id:1,title:'你可以设置一个带奖励的语音红包，好友说对口令才能领取红包'}]},
			{id:2,name:'为什么我不能设置口令红包？',kb:[{id:1,title:"Google多种语言之间的互译功能,可让您即时翻译字词、短语和网页内容"},{id:2,title:"爱词霸英语为广大网友提供在线翻译、在线词典、英语口语、英语学习资料"}]},
			{id:1,name:'包你说语音红包怎么玩？',kb:[{id:1,title:'你可以设置一个带奖励的语音红包，好友说对口令才能领取红包'}]},
			{id:2,name:'为什么我不能设置口令红包？',kb:[{id:1,title:"Google多种语言之间的互译功能,可让您即时翻译字词、短语和网页内容"},{id:2,title:"爱词霸英语为广大网友提供在线翻译、在线词典、英语口语、英语学习资料"}]},
		],
	},
	toggleCategory: function (e) {
			console.log('e',e)
			const index = e.currentTarget.dataset.index
			const category = this.data.category
			for (let i = 0; i < category.length; i++) {
				if (i === index) {
					category[i].is_open = !category[i].is_open
				} else {
					category[i].is_open = false
				}
			}
			this.setData({
				category: category
			})
		},
})