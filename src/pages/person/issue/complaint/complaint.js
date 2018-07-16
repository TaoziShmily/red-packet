// complaint.js
// 
Page({
	data:{
		checkboxItems: [
        	{name: '欺诈', value: '0'},
        	{name: '色情', value: '1'},
        	{name: '政治谣言', value: '2'},
        	{name: '诱导分享', value: '3'},
        	{name: '恶意营销', value: '4'},
        	{name: '隐私信息收集', value: '5'}
    	],
	},
	checkboxChange: function (e) {
        console.log('checkbox发生change事件，携带value值为：', e.detail.value);
        var checkboxItems = this.data.checkboxItems, values = e.detail.value;
        for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
            checkboxItems[i].checked = false;

            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if(checkboxItems[i].value == values[j]){
                    checkboxItems[i].checked = true;
                    break;
                }
            }
        }

        this.setData({
            checkboxItems: checkboxItems
        });
    },
})