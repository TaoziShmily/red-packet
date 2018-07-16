// password.js
// 
// 
Page( { 
	data: { 
		currItem:{},
		hdItems:[
			{name:'热门'},
			{name:'恶搞好友'},
			{name:'土味情话'},
			{name:'搞笑段子'},
			{name:'热门'},
			{name:'恶搞好友'},
			{name:'土味情话'},
			{name:'搞笑段子'},
		],
		bdItems:[
			{items:[{title:'计春华去世计春华去世'},{title:'北电96级聚会照北电96级聚会'},{title:'怒江拍照失足坠崖怒江拍照失足坠崖怒崖怒江拍照失足坠崖'}]},
			{items:[{title:'京时间7月11日凌晨，俄罗斯世界杯半决赛进'},{title:'土得到了反映，球迷们手持照明弹和旗帜庆祝在巴'}]},
			{items:[{title:'球迷们带着国旗和穿着法国队球衣走上街头'},{title:'将对阵英格兰队或克罗地亚队'}]},
			{items:[{title:'黎市中心'},{title:'球迷为了庆祝点起了烟火'}]},
			{items:[{title:'计春华去世计春华去世'},{title:'北电96级聚会照北电96级聚会'},{title:'怒江拍照失足坠崖怒江拍照失足坠崖怒崖怒江拍照失足坠崖'}]},
			{items:[{title:'京时间7月11日凌晨，俄罗斯世界杯半决赛进'},{title:'土得到了反映，球迷们手持照明弹和旗帜庆祝在巴'}]},
			{items:[{title:'球迷们带着国旗和穿着法国队球衣走上街头'},{title:'将对阵英格兰队或克罗地亚队'}]},
			{items:[{title:'黎市中心'},{title:'球迷为了庆祝点起了烟火'}]},
		],
		tabArr: { 
			curHdIndex: 0, 
			curBdIndex: 0,
		},
	}, 
	tabFun(e){ 
		var _datasetId=e.target.dataset.id; 
		var _obj={}; 
		_obj.curHdIndex=_datasetId; 
		_obj.curBdIndex=_datasetId; 
		this.setData({ 
			tabArr: _obj
		}); 
	}, 
	goSearchTap(){
		wx.redirectTo({
		  	url: '/pages/index/password/search/search'
		})
	},
	selectItemTap(e){
		var pages = getCurrentPages();
		var Page = pages[pages.length - 1];    //当前页
		var prevPage = pages[pages.length - 2];  //上一个页面
		var aaa = prevPage.data.firstInfo.placeholder
		prevPage.setData({aaa:e.currentTarget.dataset.title })//设置数据
		console.log('e',e.currentTarget.dataset.title)
		wx.switchTab({
		  url: '/pages/index/index'
		})
		
	}

}); 