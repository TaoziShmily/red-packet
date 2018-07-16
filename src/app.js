
App({
	onLaunch: function (options) {
	    let app = this;
	    wx.getSystemInfo({
	      success: function (res) {
	        var lang_list = {
	          'zh_CN': "简体中文",
	          'zh_HK': "繁体中文",
	          'zh_TW': "繁体中文",
	        };

	        if (res.language in lang_list) {
	          var lang = lang_list[res.language];
	        } else {
	          var lang = res.language;
	        }

	        app.globalData.deviceInfo = {
	          src: (res.platform == 'ios') ? '/images/iphone_banner_bj.jpg' : '/images/android_banner_bj.jpg',
	          platform: (res.platform == 'android') ? 'Android' : ((res.platform == 'ios') ? 'iOS' : res.platform),
	          model: res.model.replace(/\(.*|<.*?\>|\)/g, ''),
	          system: res.system,
	          version: res.version,
	          language: lang
	        };
	      }
	    });
	  },

	  onShow: function (options) {
	    console.log(options);

	    this.globalData.scene = options.scene;
	    this.globalData.appParameter = options;

	    if (options.scene == 1044 && options.shareTicket) {
	      this.globalData.shareTicket = options.shareTicket;
	    }
	  },

	  globalData: {
	    API_HOST: 'https://apple110.wpweixin.com',
	    INVALID_TOKEN: 'illegal_access_token',
	    scene: '',
	    shareTicket: '',
	    gid: '',
	    deviceInfo: null,
	    wxacode: '',
	    userInfo: null,
	    appParameter: null
	  }
})