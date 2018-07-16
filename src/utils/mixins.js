
const API		= require('../utils/api')
const Auth		= require('../utils/auth')
const app	 	= getApp()
const NC		= require('../utils/notificationcenter.js')

let isSubmiting	= false
let isFocusing	= false

const loadTopics = function(args){
	if (this.data.isLoading) return;
	
	this.setData({
		isLoading: true
	})

	API.queryTopics(args).then(res => {		// 列表数据合并

		let args = {};

		if(res.next_first){	
			args.next_first 	= res.next_first
		}

		if(this.data.isPull){	
			if(res.next_cursor){	// 下拉刷新数据超过一页
				args.topics			= res.topics
				args.next_cursor	= res.next_cursor
			}else{
				args.topics		= [].concat(res.topics, this.data.topics)
			}
		}else{
			args.topics			= [].concat(this.data.topics, res.topics)
			args.next_cursor	= res.next_cursor
		}

		
		args.page_title			= res.page_title;
		args.share_title		= res.share_title;
		args.version		= res.version;

		if(this.data.is_home){
			NC.addNotification("userChange", this.onUserChange, this)
		}

		if(res.current_user){
			NC.postNotificationName("userChange", res.current_user)
		}

		if(this.data.isPull){
			wx.stopPullDownRefresh()
		}

		wx.setNavigationBarTitle({title: res.page_title})

		args.isLoading	= false;
		args.isPull		= false;
		args.topics.forEach((item) => {
			item.homeReplys = (item.replies.length > 5) 
			? item.replies.slice(0, 5) : item.replies;
		  
		})

		this.setData(args)

		NC.addNotification("topicChange", this.onTopicChange, this)
	}).catch(err => {
		this.setData({
			isLoading: false,
			isPull: false
		})
		wx.stopPullDownRefresh()
	})
}
const loadVote = function(args){
	if (this.data.isLoading) return;
	
	this.setData({
		isLoading: true
	})

	API.queryTopics(args).then(res => {		// 列表数据合并

		let args = {};

		if(res.next_first){	
			args.next_first 	= res.next_first
		}
		// res.topics = res.topics.filter(item => (item.topic_type === 'image'));

		if(this.data.isPull){	
			if(res.next_cursor){	// 下拉刷新数据超过一页
				args.topics			= res.topics
				args.next_cursor	= res.next_cursor
			}else{
				args.topics		= [].concat(res.topics, this.data.topics)
			}
		}else{
			args.topics			= [].concat(this.data.topics, res.topics)
			args.next_cursor	= res.next_cursor
		}

		args.page_title			= res.page_title;
		args.share_title		= res.share_title;

		if(this.data.is_home){
			NC.addNotification("userChange", this.onUserChange, this)
		}

		if(res.current_user){
			NC.postNotificationName("userChange", res.current_user)
		}

		if(this.data.isPull){
			wx.stopPullDownRefresh()
		}

		wx.setNavigationBarTitle({title: res.page_title})

		args.isLoading	= false;
		args.isPull		= false;

		args.topics.forEach((item) => {
			item.homeReplys = (item.replies.length > 5) 
			? item.replies.slice(0, 5) : item.replies;
		  
		})
		
		this.setData(args)

		NC.addNotification("topicChange", this.onTopicChange, this)
	}).catch(err => {
		this.setData({
			isLoading: false,
			isPull: false
		})
		wx.stopPullDownRefresh()
	})
}

const loadTopic = function(id) {

	let pages = getCurrentPages()
	let count = pages.length;
	let topic = null;
	if(count >=2 && (pages[count-2].data.is_list == true)){
		let topics = pages[count-2].data.topics.filter(item => item.id == id);

		if(topics){
			topic = topics[0];
		}
	}

	if(topic){
		this.setData({
			topic: topic,
			share_title: topic.title,
			isLoading: false
		})
		wx.setNavigationBarTitle({title: topic.title})
		NC.addNotification("topicChange", this.onTopicChange, this)
	}else{
		API.getTopic(id).then(res => {
			this.setData({
				topic: res.topic,
				share_title: res.share_title,
				isLoading: false
			})

			wx.setNavigationBarTitle({title: res.page_title})
			NC.addNotification("topicChange", this.onTopicChange, this)

			if(res.current_user){
				NC.postNotificationName("userChange", res.current_user)
			}
		}).catch(err => {
			this.setData({
				isLoading: false
			})
			console.log(err)
		})
	}
}

const setNavigationBarTitle = function(){
	if(this.data.page_title){
		wx.setNavigationBarTitle({title: this.data.page_title})
	}
}

const preview = function (e) {
	const current	= e.currentTarget.dataset.url
	let images	= ''
	if(this.data.is_single){
		images	= this.data.topic.images
	}else{
		images	= this.data.topics[e.currentTarget.dataset.topic].images
	}
	
	wx.previewImage({
		current: current,
		urls: images.map(item => item.original)
	})
}

const zoomPic = function (e) {
	const url = e.currentTarget.dataset.url
	wx.previewImage({
		urls: [url]
	})
}

const toggleLike = function(e) {
	const key		= e.currentTarget.dataset.key
	const topics	= this.data.topics
	const topic 	= topics[key]
	if (topic && topic.is_liked) {
		topic.is_liked		= false
		topic.like_count	-= 1
		API.unlike(topic.id);
	} else {
		topic.is_liked		= true
		topic.like_count	+= 1
		API.like(topic.id).then(res=>{
			NC.postNotificationName("userChange", res.user)
		});
	}

	NC.postNotificationName("topicChange", topic)
}

const like = function() {

	API.like(this.data.id, this.data.type).then(res => {
		let topic	= this.data.topic

		topic.is_liked		= true
		topic.like_count	= topic.like_count + 1
		topic.likes			= [].concat(res.user, topic.likes)

		if(this.data.type == 'topic'){
			NC.postNotificationName("topicChange", topic)
		}else{
			this.setData({topic: topic})
			topic.id = topic.topic_id;
			NC.postNotificationName("topicChange", topic)
		}

		NC.postNotificationName("userChange", res.user)

	}).catch(err => {
		console.log(err)
	})
}

const unlike = function() {
	API.unlike(this.data.id, this.data.type).then(res => {
		let topic	= this.data.topic

		topic.is_liked		= false
		topic.like_count	= topic.like_count - 1
		topic.likes			= topic.likes.filter(user => user.openid !== res.user.openid)

		if(this.data.type == 'topic'){
			NC.postNotificationName("topicChange", topic)
		}else{
			this.setData({topic: topic})
			topic.id = topic.topic_id;
			NC.postNotificationName("topicChange", topic)
		}
	}).catch(err => {
		console.log(err)
	})
}

const toggleFav = function(e) {
	let topic = {}

	if(this.data.is_single){
		topic	= this.data.topic
	}else{
		topic	= this.data.topics[e.currentTarget.dataset.key]
	}

	let id		= topic.id

	if(topic.is_faved){
		topic.is_faved = false
		API.unfav(id, this.data.type)
	}else{
		topic.is_faved = true
		API.fav(id, this.data.type).then(res=>{
			NC.postNotificationName("userChange", res.user)
		});
	}

	if(this.data.type == 'article'){
		this.setData({topic: topic})
		topic.id = topic.topic_id;
		NC.postNotificationName("topicChange", topic)
	}else{
		NC.postNotificationName("topicChange", topic)
	}
}

const copyUrl = function(e) {
	wx.setClipboardData({
		data: e.currentTarget.dataset.url,
		success: function(res) {
			wx.showModal({
				title: '购买链接复制成功',
				content: '请粘贴链接至浏览器打开！',
				showCancel: false
			})
		}
	})
}

const copyCode = function(e) {
	wx.setClipboardData({
		data: e.currentTarget.dataset.code,
		success: function(res) {
			wx.showModal({
				title: '淘口令复制成功',
				content: '请打开淘宝就可以一键购买！',
				showCancel: false
			})
		}
	})
}

const navigateToMiniProgram = function (e) {
	const app = e.currentTarget.dataset.app
	wx.navigateToMiniProgram({
		appId:	app.appid,
		path:	app.app_path
	})
}

const voteSelect = function(e) {
	let topic = (this.data.is_single)?this.data.topic:this.data.topics[e.currentTarget.dataset.i];

	let options	= topic.votes
	const key	= e.currentTarget.dataset.key
	options.forEach(o => {
		if (o.key === key) {
			o.is_selected = true
		} else {
			o.is_selected = false
		}
	})
	topic.has_selected = true

	if(this.data.is_single){
		this.setData({topic: topic})
	}else{
		this.setData({topics: this.data.topics})
	}
}
const groupPhones = function(type=''){
	let args={};
	let that = this;

	Auth.checkSession().then(code=>{
		if(code){
			args.code = code;
		}

		args.phone = that.data.phoneInfo.model;

		Auth.checkOrGetUserInfo().then(user_res=>{
			
			if(user_res.iv){
				args.iv = user_res.iv;
				args.encrypted_data = user_res.encryptedData;
			}

			if(type == 'timeline'){
				args.gid	= that.data.pageScene;
				args.type	= 'timeline';
				that.getGroupPhones(args);
			}else{
				// let gid	= getApp().globalData.gid;

				// if(gid){
				// 	args.gid = gid;
				// 	that.getGroupPhones(args);
				// }else{
					wx.getShareInfo({
						shareTicket: getApp().globalData.shareTicket,
						success: function(share_res) {
							args.share_iv = share_res.iv;
							args.share_encrypted_data = share_res.encryptedData;
							that.getGroupPhones(args);
						},
						fail: function(err) {
							console.log(err);
						}
					});
				// }
			}
			
		}).catch(err=>{
			console.log(err);
		});
	}).catch(err=>{
	   console.log(err);
	});
}

const getShareInfo = function (shareTicket) {
	return new Promise ((resolve, reject) => {
		wx.getShareInfo({
			shareTicket,
			success (res) {
				resolve(res);
			},
			fail (err) {
				reject(err);
			}
		})
	}) 

}
const handleGroupData = function (groupData, voteData) {
	let result = [];
	groupData.forEach(item => {
		let option;
		voteData.forEach((item2) => {
		  if (item2.key == item.key) {
		  	option = item2.item;
		  }
		})
		result.push({
			avatar: item.user.avatarurl,
			nickname: item.user.nickname,
			option
		})
	})
	return result;
}

const voteSubmit = function(e) {
	let topic = (this.data.is_single)?this.data.topic:this.data.topics[e.currentTarget.dataset.i];
	const that = this;	

	let options			= topic.votes
	let selectedOption	= null
	for (let i = 0; i < options.length; i++) {
		if (options[i].is_selected) {
			selectedOption = options[i]
			break
		}
	}

	if (!selectedOption) return;
	 let args = {topic_id: topic.id, key: selectedOption.key}
	if (this.data.fromGroup) {
		console.log('新家的群中打开');
		Auth.checkSession()
		.then(code => {
			if (code) {
	           args.code = code;
			}
           args.share_type = 'group';
           let shareTicket = getApp().globalData.shareTicket;
           getShareInfo(shareTicket)
           .then(share_res => {
           		args.share_iv = share_res.iv;
           		args.share_encrypted_data = share_res.encryptedData;

           		API.vote(args).then(res => {
           			console.log(res, '群中打开并提交数据');

           			let groupLists = handleGroupData(res.group_shares, res.votes);

	           		that.setData({
	           			groupLists
	           		})

           			topic.votes		= res.votes
           			topic.is_voted	= true
           			NC.postNotificationName("topicChange", topic)
           			NC.postNotificationName("userChange", res.user)
           		}).catch(err => {
           			
           		})
           }, err => {
           	console.log(err);
           })
		})
		
	} else {
		API.vote(args).then(res => {
			topic.votes		= res.votes
			topic.is_voted	= true
			NC.postNotificationName("topicChange", topic)
			NC.postNotificationName("userChange", res.user)
		}).catch(err => {
			
		})
	}

	
}

const getGroupVoteData = function () {
	const that = this;
	var id = this.data.id;
	let args = {};
	Auth.checkSession()
		.then(code => {
			if (code) {
	           args.code = code;
			}
           args.share_type = 'group';
           // args.topic_id = id;

           wx.getShareInfo({
           	shareTicket: getApp().globalData.shareTicket,
           	success: function(share_res) {
           		args.share_iv = share_res.iv;
           		args.share_encrypted_data = share_res.encryptedData;
           		// that.getGroupPhones(args);
           		API.getTopic(id, args).then(res => {
           			let groupLists = handleGroupData(res.topic.group_shares, res.topic.votes);

	           		that.setData({
	           			groupLists,
	           			topic: res.topic,
	           			share_title: res.topic.title,
	           			isLoading: false
	           		})

           			NC.postNotificationName("topicChange", res.topic)
           			NC.postNotificationName("userChange", res.user)
           		}).catch(err => {
           			console.log(err, '哦那show 的错误信息');
           		})
           	},
           	fail: function(err) {
           		console.log(err);
           	}
           });
		})
		
}

const needAuth = function() {
	this.auth().then(user=>{
		this.setData({user: user})
	});
}

const auth = function(){
	return new Promise(function(resolve, reject) {
		const self = this

		if(Auth.check()){
			resolve(Auth.user())
		}else{
			wx.showModal({
				title: '授权',
				content: '只有授权用户才能进行此操作，确认授权吗？',
				success: function(res) {
					if (res.confirm) {
						API.signon().then(user=>{
							resolve(user)
						}, err=>{
							reject(err);
						})
					} else if (res.cancel) {
						reject(res);
					}
				},
				fail: function(err){
					reject(err);
				}
			})
		}
	})
}

const replyTo = function(e) {
	const self = this
	const comment_id	= e.currentTarget.dataset.id
	const username		= e.currentTarget.dataset.user
	const openid		= e.currentTarget.dataset.openid

	// 1.检测有没有本地用户
	// if (!Auth.user()) {
	//   this.needAuth()
	//   return false
	// }

	//1.检测有没有本地用户
	self.auth().then(user=>{
		self.setData({user: user})

		// 2.如果是自己的评论则显示删除菜单
		if (openid === Auth.openid()) {
			wx.showActionSheet({
				itemList: ['删除评论'],
				itemColor: '#e74c3c',
				success: function(res) {
					if (res.tapIndex === 0) {
						self.deleteReply(comment_id, self.data.type)
					}
				}
			})
		} else {
			isFocusing = true;
			// 3.如果是其他人评论则回复
			console.log('reply_to', isFocusing);
			self.setData({
				reply_to: comment_id,
				placeholder: '回复' + username + ':',
				reply_focus: true
			})
		}
	})
}

const onRepleyFocus = function(e) {
	isFocusing = false;
	console.log('onRepleyFocus', isFocusing);
	if (!this.data.reply_focus) {
		this.setData({reply_focus: true})
	}
}

const onReplyBlur = function(e) {
	console.log('onReplyBlur', isFocusing);
	if(!isFocusing){
		const text = e.detail.value.trim()
		// 只有输入内容为空的时候, 输入框失焦才会重置回复对象
		if (text === '') {
			// 保证先提交评论再重置
			// setTimeout(() => {
				this.setData({
					reply_to: 0,
					placeholder: '发布评论',
					reply_focus: false
				})
			// }, 50)
		}
	}
}

const deleteReply = function(comment_id) {
	API.deleteReply(comment_id, this.data.type).then(res => {
		let topic = this.data.topic;

		topic.reply_count	= topic.reply_count - 1
		topic.replies		= topic.replies.filter(item => item.id !== comment_id)
		topic.homeReplys = topic.homeReplys.filter(item => item.id !== comment_id)
		topic.homeReplys = topic.homeReplys.length >= 5 
		? topic.homeReplys.slice(0, 5) : topic.homeReplys;
		if(this.data.type == 'topic'){
			NC.postNotificationName("topicChange", topic)
		}else{
			this.setData({topic: topic})
			topic.id = topic.topic_id;
			NC.postNotificationName("topicChange", topic)
		}
		
	}).catch(err => {
		console.log('err', err)
	})
}

const commentSubmit = function(e) {
	const text = e.detail.value.text.trim()
	if (text === '' || isSubmiting) return;

	isSubmiting = true

	let args = {
		text: text,
		reply_to: this.data.reply_to,
		form_id: e.detail.formId
	}

	if(this.data.type == 'topic'){
		args.topic_id = this.data.id
	}else{
		args.post_id = this.data.id
	}

	API.createReply(args, this.data.type).then(res => {
		this.setData({
			text: '',
			reply_to: 0,
			placeholder: '发布评论',
			reply_focus: false,
		})

		let topic = this.data.topic;

		topic.reply_count	= topic.reply_count + 1
		topic.replies		= [].concat(topic.replies, res.reply)
		topic.homeReplys.push(res.reply);
		topic.homeReplys = topic.homeReplys.length >= 5 
		? topic.homeReplys.slice(0, 5) : topic.homeReplys;
		
		if(this.data.type == 'topic'){
			NC.postNotificationName("topicChange", topic)
		}else{
			this.setData({topic: topic})
			topic.id = topic.topic_id;
			NC.postNotificationName("topicChange", topic)
		}

		NC.postNotificationName("userChange", res.user)

		isSubmiting = false
	}).catch(err => {
		isSubmiting = false
		console.log(err)
	})
}

const onTopicChange = function(data, type='topic'){
	if(this.data.is_single){
		if(data.id == this.data.topic.id){
			data = Object.assign(this.data.topic, data)
			this.setData({topic:data})
		}
	}else{
		let topics = this.data.topics;
		topics = topics.map(function(topic){
			if(topic.id == data.id){
				data = Object.assign(topic, data)
				return data
			}else{
				return topic
			}
		})
		this.setData({topics: topics})
	}
}

const onUserChange = function(user){
	this.setData({user:user})
	app.globalData.user = user
}

const removeTopicChange = function(){
	NC.removeNotification("topicChange", this)
}

const removeUserChange = function(){
	NC.removeNotification("userChange", this)
}

const getProfile = function(){
	NC.addNotification("userChange", this.onUserChange, this)

	if(app.globalData.user && app.globalData.user.credit){
		this.setData({user: app.globalData.user})
	}else{
		API.checkOrSignon().then(user => {
			return API.getProfile()
		}).then(res => {
			NC.postNotificationName("userChange", res.user)
		})
		
	}
}

const checkin = function () {
	if (this.data.is_checkined) return
	API.checkin().then(res => {
		NC.postNotificationName("userChange", res.user)
	})
}

const loadCredits = function (args) {
	if (this.data.isLoading) return

	this.setData({
		isLoading: true
	})

	API.queryCreditList(args).then(res => {
		this.setData({
			credits: this.data.credits.concat(res.credits),
			next_cursor: res.next_cursor,
			isLoading: false
		})

		NC.postNotificationName("userChange", res.current_user)
	}).catch(err => {
		this.setData({
			isLoading: false
		})
	})
}

const loadFavs = function (args) {
	if (this.data.isLoading) return

	this.setData({
		isLoading: true
	})

	API.queryFavList(args).then(res => {
		this.setData({
			favs: this.data.favs.concat(res.topics),
			next_cursor: res.next_cursor,
			isLoading: false
		})
		
		NC.postNotificationName("userChange", res.current_user)
	}).catch(err => {
		this.setData({
			isLoading: false
		})
	})
}

const loadMyArticle = function (args) {
	console.log('jiazai 我的帖子');
	if (this.data.isLoading) return

	this.setData({
		isLoading: true
	})

	API.queryMyarticle(args).then(res => {
		if (res.page_title) {
			wx.setNavigationBarTitle({
				title: res.page_title 
			})
		}
		this.setData({
			myArticles: this.data.myArticles.concat(res.topics),
			next_cursor: res.next_cursor,
			page_title: res.page_title || '我的帖子',
			isLoading: false
		})
		
		NC.postNotificationName("userChange", res.current_user)
	}).catch(err => {
		this.setData({
			isLoading: false
		})
	})
}
const loadNotifications = function (args) {
	if (this.data.isLoading ) return

	this.setData({
		isLoading: true
	})

	API.queryNotificationList(args).then(res => {
		this.setData({
			notifications: this.data.notifications.concat(res.notifications),
			next_cursor: res.next_cursor,
			isLoading: false
		})

		NC.postNotificationName("userChange", res.current_user)
	}).catch(err => {
		this.setData({
			isLoading: false
		})
	})
}

const getBanners = function(){
	let that = this;

	API.getBanners().then(res => {
		that.setData({ banners: res.banners });
	}).catch(err => {
		console.log('获取Banner失败', err);
	});
}

const getGroupPhones = function(args){
	let that = this;

	console.log("args", args);
	return new Promise(function(resolve, reject) {
		API.getGroupPhones(args).then(res=>{
			console.log("GroupPhones gong", res.phones);
			
			if(res.user){
				API.storageUser(res);
			}

			let data = {};

			if(res.share_user){
				data.shareUser  = res.share_user;
			}

			data.phoneList  = res.phones;
			that.setData(data);

			// if(res.gid){
			// 	getApp().globalData.gid = res.gid;
			// }
			resolve(res);
		}).catch(err=>{
			console.log('获取手机列表失败', err);
			reject(err);
		});
	});
}

module.exports = function (obj) {
	obj.loadTopics				= loadTopics
	obj.getGroupPhones				= getGroupPhones
	obj.groupPhones				= groupPhones
	obj.loadVote				= loadVote
	obj.loadTopic				= loadTopic
	obj.setNavigationBarTitle	= setNavigationBarTitle
	
	obj.onTopicChange			= onTopicChange
	obj.removeTopicChange		= removeTopicChange
	obj.onUserChange			= onUserChange
	obj.removeUserChange		= removeUserChange

	obj.preview					= preview
	obj.zoomPic					= zoomPic
	obj.copyUrl					= copyUrl
	obj.copyCode				= copyCode
	obj.toggleLike				= toggleLike
	obj.like					= like
	obj.unlike					= unlike
	obj.toggleFav				= toggleFav
	obj.voteSelect				= voteSelect
	obj.voteSubmit				= voteSubmit
	obj.navigateToMiniProgram	= navigateToMiniProgram

	obj.replyTo					= replyTo
	obj.deleteReply				= deleteReply
	obj.commentSubmit			= commentSubmit
	obj.auth					= auth
	obj.needAuth				= needAuth
	obj.onRepleyFocus			= onRepleyFocus
	obj.onReplyBlur				= onReplyBlur

	obj.getProfile				= getProfile
	obj.checkin					= checkin

	obj.loadCredits				= loadCredits
	obj.loadFavs				= loadFavs
	obj.loadNotifications		= loadNotifications
	obj.getBanners		= getBanners
	obj.loadMyArticle		= loadMyArticle
	obj.getGroupVoteData		= getGroupVoteData
}
