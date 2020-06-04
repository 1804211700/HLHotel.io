Date.prototype.AddDay = function(dayCount){
	var addDate = new Date(Date.parse(this) + (dayCount * 24 * 60 * 60 * 1000)).DateFormat('yyyy-MM-dd');
	return addDate;
};

Date.prototype.DateDiff = function(anotherDate){
	var date1 = Date.parse(this);
	var date2 = Date.parse(anotherDate);
	
	var diff = Math.abs(date1 - date2);
	var diffDay = diff / (24 * 60 * 60 * 1000);
	return diffDay;
}

Date.prototype.HourDiff = function(hour){
	var diffDatetime = new Date(Date.parse(this) - ((hour - 24) * 60 * 60 * 1000)).DateFormat('yyyy年MM月dd日 HH:mm');
	
	return diffDatetime;
}

Date.prototype.DateFormat = function(format){
	var newDate = new Date();
	switch(format){
		case 'yyyy-MM-dd':
			newDate = this.getFullYear() + '-' + ((this.getMonth() + 1) >= 10 ? (this.getMonth() + 1) : '0' + (this.getMonth() + 1)) + '-' + (this.getDate() >= 10 ? this.getDate() : '0' + this.getDate());
			break;
		
		case 'MM-dd':
			newDate = ((this.getMonth() + 1) >= 10 ? (this.getMonth() + 1) : '0' + (this.getMonth() + 1)) + '-' + (this.getDate() >= 10 ? this.getDate() : '0' + this.getDate());
			break;
		
		case 'M-d':
			newDate = (this.getMonth() + 1) + '-' + this.getDate();
			break;
			
		case 'yyyy年MM月dd日 HH:mm':
			newDate = this.getFullYear() + '-' + ((this.getMonth() + 1) >= 10 ? (this.getMonth() + 1) : '0' + (this.getMonth() + 1)) + '-' + (this.getDate() >= 10 ? this.getDate() : '0' + this.getDate())+' '+ (this.getHours() >= 10 ? this.getHours() : '0' + this.getHours()) + ':' + (this.getMinutes() >= 10 ? this.getMinutes() : '0' + this.getMinutes());
			break;
	}
	return newDate;
}

Date.prototype.DayWeek = function(week){
	var day = '';
	switch(this.getDay()){
		case 0: day = '日'; break;
		case 1: day = '一'; break;
		case 2: day = '二'; break;
		case 3: day = '三'; break;
		case 4: day = '四'; break;
		case 5: day = '五'; break;
		case 6: day = '六'; break;
	}
	
	return week + day;
}

jQuery(function($){ 
     $.datepicker.regional['zh-CN'] = { 
        clearText: '清除', 
        clearStatus: '清除已选日期', 
        closeText: '关闭', 
        closeStatus: '不改变当前选择', 
        prevText: '< 上月', 
        prevStatus: '显示上月', 
        prevBigText: '<<', 
        prevBigStatus: '显示上一年', 
        nextText: '下月>', 
        nextStatus: '显示下月', 
        nextBigText: '>>', 
        nextBigStatus: '显示下一年', 
        currentText: '今天', 
        currentStatus: '显示本月', 
        monthNames: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'], 
        monthNamesShort: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'], 
        monthStatus: '选择月份', 
        yearStatus: '选择年份', 
        weekHeader: '周', 
        weekStatus: '年内周次', 
        dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'], 
        dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'], 
        dayNamesMin: ['日','一','二','三','四','五','六'], 
        dayStatus: '设置 DD 为一周起始', 
        dateStatus: '选择 m月 d日, DD', 
        dateFormat: 'yy-mm-dd', 
        firstDay: 1, 
        initStatus: '请选择日期', 
        isRTL: false
    };
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']); 
});

var DateSelect = function($, ds){
	ds.sCheckInOrOut = function(eleCheckIn, eleCheckOut){
		var checkIn = $.cookie('checkIn');
		var checkOut = $.cookie('checkOut');
		//var eleCheckIn = $('input[name="checkindate"]');
		//var eleCheckOut = $('input[name="checkoutdate"]');
		
		if(!checkIn || !checkOut){
			checkIn = new Date().DateFormat('yyyy-MM-dd');
			checkOut = new Date().AddDay(1);
		}
		eleCheckIn.val(checkIn);
		eleCheckOut.val(checkOut);
		
		var opt = { dateFormat: 'yy-mm-dd', defaultDate: "+1w", numberOfMonths: 2};
		var dailySeconds = 24 * 3600000;
		eleCheckIn.datepicker($.extend(opt, {minDate: new Date()})).on('change', function(){
			checkIn = $(this).val();
			$.cookie('checkIn', checkIn);
			
			eleCheckOut.datepicker("option", "minDate", new Date(new Date(eleCheckIn.val()).getTime() + dailySeconds));
            setTimeout(function () { eleCheckOut.focus(); }, 100);
		});
		
		eleCheckOut.datepicker($.extend(opt, {
            minDate: new Date(new Date().getTime() + dailySeconds)
        }));
        
        eleCheckOut.on('blur', function(){
        	setTimeout(function(){
        		checkOut = eleCheckOut.val();
	        	$.cookie('checkOut', checkOut);
	        	
	        	var dt = eleCheckOut.data('dt');
	        	var curUrl = window.location.href;
	        	if(dt == 'changeprice' && (curUrl.indexOf('/order') > 0 || curUrl.indexOf('/localOrder') > 0)){
	        		curUrl = curUrl.substring(0, curUrl.indexOf('.html') + 5);
	        		curUrl += '?checkIn=' + checkIn + '&checkOut=' + checkOut;
	        		self.location = curUrl;
	        	}
        	}, 200);
        });
	};
	
	return ds;
}(jQuery, DateSelect || {});

$(function(){
	DateSelect.sCheckInOrOut($('#checkindate'), $('#checkoutdate'));
	
	(function(){
		var phoneContainer = $('.phone');
		if($.trim(phoneContainer.text()) == '' || $.trim(phoneContainer.text()) == 'TEL:'){
			phoneContainer.hide();
			
			if(phoneContainer.prev('.colorBlack01')){
				phoneContainer.prev('.colorBlack01').hide();	
			}
		}
	})();
});









