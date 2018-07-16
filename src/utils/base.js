
const API_HOST	= 'https://techcar.wpweixin.com'
const Auth		= require('./auth')
/**
 * 统一接口返回数据处理流程
 *
 * 0.全部wx.request的fail回调统一用reject返回的res
 * 
 * 1.普通不需授权的接口
 * 1.1先判断res.data.errcode是否为0, 为0则调用正常, 可传递给下一步继续操作
 * 1.2如果不为0, 则先toast数据中的res.data.errmsg, 然后reject此返回res
 * 
 * 2.需要授权的接口
 * 2.1先判断res.data.errcode是否为0, 为0则调用正常, 且toast数据中的res.data.errmsg作为
 * 操作提醒, 接着传递给下一步继续操作
 * 2.2如果不为0, 则直接reject返回的res即可, 此会让guard来统一处理异常情况
 */

const API = {}

API.request = function(url, method = "GET", data={}, args = { showLoading: false, token: true, cache_key: '', cache_time: 3600 }) {
	if (args.cache_key && args.cache_time && API.getStorageSync(args.cache_key)) {
		console.log(args.cache_key + '过期时间：', (wx.getStorageSync(args.cache_key + '_expired_in') - Date.now()) / 1000, '秒');
		return Promise.resolve(API.getStorageSync(args.cache_key));
	} else {
		return new Promise(function(resolve, reject) {
			if (args.showLoading) {
				wx.showLoading({
					title: '加载中',
				});
			}
			wx.showNavigationBarLoading()

			url = API_HOST + url;
			if (args.token && API.token()) {
				if(url.indexOf("?")>0){
					url = url + '&access_token=' + API.token();
				}else{
					url = url + '?access_token=' + API.token();
				}
			}

			console.log(url);
			console.log(data);

			wx.request({
				url: url,
				data: data,
				method: method,
				success: function(res) {
					if (res.data.errcode == 0) {
						if (args.cache_key && args.cache_time) {
							API.setStorageSync(args.cache_key, res.data, args.cache_time);
						}

						if(res.data.errmsg){
							wx.showToast({
								title: res.data.errmsg
							});
						}else{
							if (args.showLoading) {
								wx.hideLoading();
							}
						}

						resolve(res.data);
					} else if (res.data.errcode && res.data.errcode === 'illegal_access_token') {
						wx.showToast({
							title: "用户信息有误\n请重试",
						});

						API.signout();
						reject(res.data);
					} else if (res.data.errmsg) {
						wx.showToast({
							title: res.data.errmsg,
						})
						reject(res.data);
					} else {	// 兼容处理。。。
						if (args.cache_key && args.cache_time) {
							API.setStorageSync(args.cache_key, res.data, args.cache_time);
						}

						if (args.showLoading) {
							wx.hideLoading();
						}

						resolve(res.data);
					}

					wx.hideNavigationBarLoading()
				},
				fail: function(err) {
					if (args.showLoading) {
						wx.hideLoading();
					}

					wx.showToast({
						title: err.errMsg
					});

					wx.hideNavigationBarLoading()

					console.log(err);
					reject(err);
				}
			})
		});
	}
}

API.get = function(url, data={}, args = { showLoading: false, token: true }) {
	return API.request(url, "GET", data, args);
}

API.post = function(url, data, args = { showLoading: false, token: true }) {
	return API.request(url, "POST", data, args);
}

API.getStorageSync = function(key) {
	if (Date.now() < wx.getStorageSync(key + '_expired_in')) {
		return wx.getStorageSync(key);
	} else {
		return false;
	}
}
API.uploadFile = function (filePath, contxt) {
  contxt.setData({ files: contxt.data.files.concat(filePath) });
  return new Promise(function (resolve, reject) {
    let uploadTask = wx.uploadFile({
      url: API_HOST + '/api2/upload.media.json',
      filePath: filePath,
      name: 'media',
      success: function (res) {
        if (res.statusCode == 200) {
          let data = JSON.parse(res.data);
          if (data.errcode == 0) {
            contxt.data.real_files.push(data.url)
            resolve(data.url);
          } else if (data.errcode) {
            wx.showToast({
              title: data.errmsg,
            })
            reject(data);
          }
        } else {
          console.log("上传失败！");
        }
      }
    })

    uploadTask.onProgressUpdate((res) => {
      contxt.setData({
        progress: res.progress
      })
    })
  })
}

API.setStorageSync = function(key, value, cache_time = 3600) {
	wx.setStorageSync(key, value);
	wx.setStorageSync(key + '_expired_in', Date.now() + cache_time * 1000);
}

API.signon = function() {
	return new Promise(function(resolve, reject) {
		Auth.login().then(data=>{
			API.post('/api2/auth.signon.json', data, { token: false }).then(res => {
				API.storageUser(res);
				resolve(res.user);
			}, err => {
				reject(err);
			});
		})
	});
}

API.token = function() {
	if (Date.now() < wx.getStorageSync('expired_in') && wx.getStorageSync('token')) {
		return wx.getStorageSync('token');
	} else {
		return '';
	}
}

API.checkOrSignon = function(){
	return new Promise(function(resolve, reject) {
		if(Auth.check()){
			resolve(Auth.user());
		}else{
			API.signon().then(user => {
				resolve(user);
			}, err => {
				reject(err);
				console.log('登录失败', err);
			});
		}
	})
}

 /**
 * 需要授权的接口调用
 * @param  {Function} fn
 * @return {Promise}
 */
API.guard = function(fn) {
	const self = this
	return function() {
		if (Auth.check()) {
			return fn.apply(self, arguments)
		} else {
			return API.signon().then(res => {
				console.log('登录成功');
				return fn.apply(self, arguments)
			}, err => {
				console.log('登录失败', err);
				reject(err);
			});
		}
	}
}

API.storageUser = function(res){
	getApp().globalData.user = res.user;
	wx.setStorageSync('user', res.user);
	wx.setStorageSync('token', res.access_token);
	wx.setStorageSync('expired_in', Date.now() + parseInt(res.expired_in, 10) * 1000 - 60000);
}

API.signout = function() {
	getApp().globalData.user = null;
	wx.removeStorageSync('user');
	wx.removeStorageSync('token');
	wx.removeStorageSync('expired_in');
}

API.debugMode = function() {
	return API.get('/api2/debug.mode.json');
}

API.uploadFile = function (filePath, contxt) {
  contxt.setData({ files: contxt.data.files.concat(filePath) });
  return new Promise(function (resolve, reject) {
    let uploadTask = wx.uploadFile({
      url: API_HOST + '/api2/upload.media.json',
      filePath: filePath,
      name: 'media',
      success: function (res) {
        if (res.statusCode == 200) {
          let data = JSON.parse(res.data);
          if (data.errcode == 0) {
            contxt.data.real_files.push(data.url)
            resolve(data.url);
          } else if (data.errcode) {
            wx.showToast({
              title: data.errmsg,
            })
            reject(data);
          }
        } else {
          console.log("上传失败！");
        }
      }
    })

    uploadTask.onProgressUpdate((res) => {
      contxt.setData({
        progress: res.progress
      })
    })
  })
}

module.exports = API