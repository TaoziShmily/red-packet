
/*
|-------------------------------------------------------------------------------
| 基于token验证机制的微信小程序授权模块
|-------------------------------------------------------------------------------
| login()			- 登陆
| logout()			- 注销
| check()			- 验证当前用户授权是否有效/过期
| checkOrLogin()	- 验证当前授权是否有效, 无效则重新登录
| guest()			- 判断当前用户是否为游客
| user()			- 获取当前用户信息
| openid()			- 获取当前用户的openid
| token()			- 获取本地token
*/
const Auth = {}

/**
 * 获取当前登陆用户的openid
 * @return {string}
 */
Auth.openid = function() {
    const user = Auth.user()
    if (user && user.openid) {
        return user.openid
    } else {
        return ''
    }
}

/**
 * 判断当前用户是否为游客
 * @return {boolean}
 */
Auth.guest = function() {
    if (!Auth.user()) {
        return true
    } else {
        return false
    }
}

/**
 * 获取当前登陆用户信息
 * @return {object}
 */
Auth.user = function() {
    return wx.getStorageSync('user');
}

/**
 * 获取token
 * @return {string}
 */
Auth.token = function() {
    return wx.getStorageSync('token');
}

/**
 * 获取微信运动加密数据
 */
Auth.getWeRunData = function(msg='您必须授权才可以操作'){
    return new Promise(function(resolve, reject) {
        wx.getWeRunData({
            success: function(res) {
                resolve(res);
            },fail: function(err) {
                console.log(err);
                if(err.errMsg.indexOf('device not support')){
                    wx.showModal({
                        title: "设备不支持",
                        content: "你懒得连微信都放弃你了！",
                        showCancel:false,
                        confirmText: "掩面而逃"
                    });
                    reject(err);
                }else{
                    Auth.makeSure(msg).then(res=>{
                        resolve(res);
                    }, err=>{
                        reject(err);
                    });
                }
            }
        });
    });
}

/**
 * 获取授权登录加密数据
 */
Auth.getUserInfo = function(msg='您必须授权才可以操作'){
    return new Promise(function(resolve, reject) {
        wx.getUserInfo({
            // withCredentials: true,
            // lang: 'zh_CN',
            success: function(res) {
                console.log(res);
                resolve(res);
            },
            fail: function(err) {
                Auth.makeSure(msg).then(res=>{
                    resolve(res);
                }, err=>{
                    reject(err);
                });
            }
        });
    });
}

/**
 * 再次让用户打开设置开启授权登录
 */
Auth.makeSure = function(msg='您必须授权才可以操作'){
    return new Promise(function(resolve, reject) {
        wx.showModal({
            title: '温馨提示',
            content: msg,
            success: function(res) {
                if (res.confirm) {
                    wx.openSetting({
                        complete: function(res) {
                            reject(res);
                        }
                        // success: function(res){
                        //  if(res.authSetting["scope.userInfo"]){
                        //   Auth.login().then(res=>{
                        //       resolve(res);
                        //   }, err=>{
                        //       reject(err);
                        //   });
                        //  }else{
                        //      reject(res);    // 这里一定要返回 reject ，不会会有同时两个 auth.signon 请求，但是模拟器上会有bug
                        //  }
                        // },

                        // fail: function(err) {
                        //  reject(err);
                        // }
                    });
                }
            },
            fail: function(err) {
                reject(err);
            }
        });
    });
}

/**
 * 判断是否维持登录状态或者获取code
 * @return code
 */
Auth.checkSession = function(){
    return new Promise(function(resolve, reject) {
        wx.checkSession({
            success: function(res){
                console.log(res.errMsg);
                if(Auth.check()){
                    // resolve('');
                    Auth.code().then(res=>{
                        resolve(res);
                    }, err=>{
                        reject(err);
                    });
                }else{
                    Auth.code().then(res=>{
                        resolve(res);
                    }, err=>{
                        reject(err);
                    });
                }
            },
            fail: function(err){   //登录态过期 
                console.log(err);   // 这里 Reject 收不到，很奇怪
                Auth.code().then(res=>{
                    resolve(res);
                }, err=>{
                    reject(err);
                });
            }
        });
    });
}

/**
 * 通过 wx.login 获取code
 * @return code
 */
Auth.code = function(){
    return new Promise(function(resolve, reject) {
        wx.login({
            success: function(res){
                console.log('wx.login.code', res.code);
                resolve(res.code);
            },

            fail: function(err) {
                console.log(err);
                reject(err);
            }
        });
    });
}

/**
 * 验证当前授权是否有效, 无效则重新获取授权加密数据
 * @return {Promise} 用户
 */
Auth.checkOrGetUserInfo = function(msg = '您必须授权才可以操作') {
    if (Auth.check()) {
        return Promise.resolve(Auth.user());
    } else {
        return Auth.getUserInfo(msg);
    }
}

/**
 * 验证当前授权是否有效, 无效则重新登录
 * @return {Promise} 用户
 */
Auth.checkOrLogin = function(msg = '您必须授权才可以操作') {
    if (Auth.check()) {
        return Promise.resolve(Auth.user());
    } else {
        return Auth.login(msg);
    }
}

/**
 * 注销
 * @return {boolean}
 */
Auth.logout = function() {
    wx.removeStorageSync('user')
    wx.removeStorageSync('token')
    wx.removeStorageSync('expired_in')
    return true
}

/**
 * 判断token还是否在有效期内
 * @return {boolean}
 */
Auth.check = function() {
    if (Auth.user() && Date.now() < wx.getStorageSync('expired_in') && Auth.token()) {
        console.log('access_token过期时间：', (wx.getStorageSync('expired_in') - Date.now()) / 1000, '秒');
        return true;
    } else {
        return false;
    }
}

/**
 * 登陆
 * @return {Promise} 用户
 */
Auth.login = function(msg='您必须授权才可以操作') {
    return new Promise(function(resolve, reject) {
        wx.login({
            success: function(res) {
                console.log('wx.login.code', res.code);
                let args = {};
                args.code = res.code;
                Auth.getUserInfo(msg).then(res=>{
                    args.iv = res.iv;
                    args.encrypted_data =res.encryptedData;

                    resolve(args);
                }, err=>{
                    reject(err);
                })
            },

            fail: function(err) {
                reject(err);
            }
        });
    });
}

module.exports = Auth