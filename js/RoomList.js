var RoomChannel = function($, rc){
	var loadingIndex = 0;
	//统计总入住天数
	var getTotalDays = function(date1, date2) {
		var dateTime1 = Date.parse(date1),
			dateTime2 = Date.parse(date2);
	
		if(isNaN(dateTime1) || isNaN(dateTime2)) {
			var date1Arr = date1.split('-'),
				date2Arr = date2.split('-');
	
			dateTime1 = new Date(date1Arr[0], parseInt(date1Arr[1]) - 1, date1Arr[2]).getTime();
			dateTime2 = new Date(date2Arr[0], parseInt(date2Arr[1]) - 1, date2Arr[2]).getTime();
		}
	
		var totalDays = (dateTime2 - dateTime1) / (24 * 60 * 60 * 1000);
	
		return totalDays;
	};
	
	//字符串转为日期
	var stringToGetTime = function(d){
		var dt = Date.parse(d);
		if(isNaN(dt)){
			var dArr = d.split('-');
			
			dt = new Date(dArr[0], parseInt(dArr[1]) - 1, dArr[2]).getTime();
		}
		return dt;
	}
	
	//获取早餐名称
	var getBreakfastName = function(isInclude, amount, flag){
		var bfName = '';
		if(isInclude){
			switch(amount){
				case 0: bfName = '无早'; break;
				case 1: bfName = '单早'; break;
				case 2: bfName = '双早'; break;
				default: bfName = '--'; break;
			}	
		} else {
			bfName = '无早';
		}
		
		if(flag){
			bfName = '部分' + bfName;
		}
		
		return bfName;
	}
	
	//获取渠道列表
	var getChannelList = function() {
		$.ajax({
			type: 'post',
			url: '/ajax.aspx?at=getChannels',
			async: true,
//			data: {
//				HotelIds: HotelIds
//			},
			dataType: 'json',
			success: function(resp, status) {
				if(status == 'success') {
					$('#onlineBooking').hide();
					if(resp.msgInfo.ctripHotelID){
						$('#channelBooking').show();
						$('#channelBooking').find('#ctripChannel').attr('href', 'http://www.jiudianzaixian.cn/go.aspx?ctripHotelID=' + resp.msgInfo.ctripHotelID);	
					}
				}
			}
		});
	};
	
	var getValueAddsBreakfast = function(ValueAdds, ArrivalDate, DepartureDate){
		var oBreakfast = {};
		var totalDays = getTotalDays(ArrivalDate, DepartureDate);
		$.each(ValueAdds, function(i, item) {
			if(item.TypeCode == '99') {
				//console.log(item.ValueAddId + ',' + item.Description);
				var startDate = item.StartDate.substring(0, item.StartDate.indexOf('T'));
				var endDate = item.EndDate.substring(0, item.EndDate.indexOf('T'));
				
				var startDateTime = stringToGetTime(startDate),
					endDateTime = stringToGetTime(endDate),
					checkInDateTime = stringToGetTime(ArrivalDate),
					checkOutDateTime = stringToGetTime(DepartureDate);
		
				var accordDate = 0;
				for(var i = 0; i < totalDays; i++) {
					var tmpDate = checkInDateTime + (i * 24 * 60 * 60 * 1000);
					var tmpDay = new Date(tmpDate).getDay() + 1;
					if(tmpDate >= startDateTime && tmpDate <= endDateTime && item.WeekSet.indexOf(tmpDay + ',') >= 0) {
						accordDate++;
					}
				}
		
				var breakfastName = '';
				if(accordDate == totalDays) {
					//所有日期都符合
					breakfastName = getBreakfastName(item.IsInclude, item.Amount, false);
				} else if(accordDate == 0) {
					//所有日期都不符合
					breakfastName = '';
				} else if(accordDate < totalDays) {
					//部分日期符合
					breakfastName = getBreakfastName(item.IsInclude, item.Amount, true);
				}
				oBreakfast['n' + item.ValueAddId] = {
					typeCode: item.TypeCode,
					breakfast: breakfastName
				};
		
			} else if(item.TypeCode == '01') {
				//console.log(item.TypeCode, item.Description, getBreakfastName(item.IsInclude, item.Amount));
				oBreakfast['n' + item.ValueAddId] = {
					typeCode: item.TypeCode,
					breakfast: getBreakfastName(item.IsInclude, item.Amount, false)
				};
			}
		});
		
		return oBreakfast;
	}
	rc.getValueAddsBreakfast = getValueAddsBreakfast;
	
	var getRatePlanBreakfast = function(ValueAddIds, oBreakfast){
		var breakfastName = '';
		var breakfastValueAddIdsArr = ValueAddIds.split(',');
		if(breakfastValueAddIdsArr == 0) {
			breakfastName = '无早';
		} else {
			var breakfastName99 = '';
			$.each(breakfastValueAddIdsArr, function(i, itemValueId) {
				if(oBreakfast['n' + itemValueId]) {
					if(oBreakfast['n' + itemValueId].typeCode == '99') {
						breakfastName99 = oBreakfast['n' + itemValueId].breakfast;
					} else {
						breakfastName = oBreakfast['n' + itemValueId].breakfast;
					}
				}
			});
			breakfastName = (breakfastName99 != '' ? breakfastName99 : breakfastName);
		}
		
		return breakfastName;
	}
	rc.getRatePlanBreakfast = getRatePlanBreakfast;
	
	rc.getLocalRoomList = function(ArrivalDate, DepartureDate, LocalHotelId, ChannelId){
		if(!LocalHotelId){
			getChannelList();
			return false;
		}
		var today = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
		var totalDays = getTotalDays(ArrivalDate, DepartureDate); //总天数
		var nowDay = new Date(Date.parse(ArrivalDate));
		if(isNaN(nowDay)) {
			var dateArr = ArrivalDate.split('-');
			nowDay = new Date(dateArr[0], parseInt(dateArr[1]) - 1, dateArr[2]);
		}
		var getDay = nowDay.getDay();
		var week = "";
		var weeksArr = [];
		if(totalDays > 0) {
			for(var i = 0; i < totalDays; i++) {
				var j = getDay + i;
				week = today[(j % 7)];
				weeksArr.push(week);
				if(i == 6) break;
			}
		} else {
			layer.msg('入住日期和离店日期不能是同一天');
			return false;
		}
		
		$('#onlineBooking').show();
		$('#channelList').hide();
		
		$.ajax({
			type:'get',
			//url:'/template/p1/js/localPrice.json',
			url:'localRooms.aspx?at=getLocalAllRooms&hotelID=' + LocalHotelId + '&ArrivalDate=' + ArrivalDate + '&DepartureDate=' + DepartureDate + '&d=' + new Date().getTime(),
			async:true,
			dataType:'json',
			data:{},
			beforeSend: function(xhr){
				loadingIndex = layer.load(0, {shade: [0.1,'#000']});
			},
			success: function(resp, status){
				layer.close(loadingIndex);
				if(status == 'success'){
					var outHtml = '        <table width="100%" border="0" cellspacing="0" cellpadding="0">' +
								'        <thead>' +
								'		  <tr style="background-color:#ddd1a7; height:30px;">' +
								'		    <th style="width:30%;">房型</th>' +
								'		    <th style="width:10%;">床型</th>' +
								'		    <th style="width:10%;">宽带</th>' +
								'		    <th style="width:10%;">早餐</th>' +
								'		    <th style="width:15%;">日均价</th>' +
								'		    <th style="width:15%; text-align:left; padding-left:21px;">操作</th>' +
								'		  </tr>' +
								'        </thead>' +
								'        <tbody>';
					var Rooms = resp.Rooms;
					if(Rooms.length == 0){
						getChannelList();
						return false;
					}
					if(resp.Rooms.length > 0){
						var roomListHtml = $.map(resp.Rooms, function(item) {
							var RatePlans = item.RatePlans;
							var tmpHtml = '';
							if(RatePlans.length == 1){
								var isMf = false;
								if(!RatePlans[0].Status) {
									isMf = true;
								}
								$.each(RatePlans[0].NightlyRates, function(i, nrItem) {
									if(!nrItem.Status || nrItem.Member == -1) {
										isMf = true;
										//break;
									}
								});
								tmpHtml = '		  <tr class="room_bg_color">' +
									'		    <td class="text-weizhi1 padding-top-bottom border-bottom roomNameText" style="text-align:left;"><span class="roomSp popup1" name="fx" RoomId="' + item.RoomId + '" RoomName="' + item.Name + '" Floor="' + item.Floor + '" Broadnet="' + item.Broadnet + '" BedType="' + item.BedType + '" Description="' + item.Description + '" data-type="roomDetail">' + item.Name + ' - ' + RatePlans[0].RatePlanName + '</span></td>' +
									'		    <td class="text-weizhi2 padding-top-bottom border-bottom">' + item.BedType + '</td>' +
									'		    <td class="text-weizhi3 padding-top-bottom border-bottom">' + getBroadnetInfo(item.Broadnet) + '</td>' +
									'		    <td class="text-weizhi4 padding-top-bottom border-bottom">' + RatePlans[0].Breakfast + '</td>' +
									'		    <td class="text-weizhi5 padding-top-bottom border-bottom"><span class="color1 popup1" name="price" RatePlanID="' + RatePlans[0].RatePlanId + '" RoomTypeId="' + item.RoomId + '" RoomId="' + item.RoomId + '" data-type="price">￥' + RatePlans[0].AverageRate + '</span></td>' +
									'		    <td class="text-weizhi6 padding-top-bottom border-bottom">' + (isMf ? '<a class="booknone" href="javascript:;">满房</a>' : '<a class="book" href="/localOrder' + item.RoomId + '_' + RatePlans[0].RatePlanId + '.html">预订</a>') + '</td>' +
									'		  </tr>';
							} else {
								tmpHtml = '		  <tr class="room_bg_color">' +
										'		    <td class="text-weizhi1 padding-top-bottom roomNameText" style="text-align:left;"><span class="roomSp popup1" name="fx" RoomId="' + item.RoomId + '" RoomName="' + item.Name + '" Floor="' + item.Floor + '" Broadnet="' + item.Broadnet + '" BedType="' + item.BedType + '" Description="' + item.Description + '" data-type="roomDetail">' + item.Name + '</span></td>' +
										'		    <td class="text-weizhi2 padding-top-bottom"></td>' +
										'		    <td class="text-weizhi3 padding-top-bottom"></td>' +
										'		    <td class="text-weizhi4 padding-top-bottom"></td>' +
										'		    <td class="text-weizhi5 padding-top-bottom"></td>' +
										'		    <td class="text-weizhi6 padding-top-bottom"></td>' +
										'		  </tr>';
								
								$.each(RatePlans, function(i, rpItem) {
									var isMf = false;
									$.each(rpItem.NightlyRates, function(i, nrItem) {
										if(!nrItem.Status || nrItem.Member == -1) {
											isMf = true;
											//break;
										}
									});
									
									tmpHtml += '		  <tr>' +
											'		    <td class="text-weizhi1 padding-top-bottom"><div class="rpName">' + rpItem.RatePlanName + '</div></td>' +
											'		    <td class="text-weizhi2 padding-top-bottom">' + item.BedType + '</td>' +
											'		    <td class="text-weizhi3 padding-top-bottom">' + getBroadnetInfo(item.BedType) + '</td>' +
											'		    <td class="text-weizhi4 padding-top-bottom">' + RatePlans[i].Breakfast + '</td>' +
											'		    <td class="text-weizhi5 padding-top-bottom"><span class="color1 popup1" name="price" RatePlanId="' + rpItem.RatePlanId + '" RoomTypeId="' + rpItem.RoomTypeId + '" RoomId="' + item.RoomId + '" data-type="price">￥' + rpItem.AverageRate + '</span></td>' +
											'		    <td class="text-weizhi6 padding-top-bottom">' + (isMf ? '<a class="booknone" href="javascript:;">满房</a>' : '<a class="book" href="/localOrder' + item.RoomId + '_' + rpItem.RatePlanId + '.html">预订</a>') + '</td>' +
											'		  </tr>';
									
								});
								
							}
							
							return tmpHtml;
						}).join('');
						
						outHtml += roomListHtml;
					}
					
					outHtml += '        </tbody>' +
								'		</table>';
					//$('#testRoomList').html(outHtml);
					$('#roomList').html(outHtml);
					
					//渠道预订
					$('#channel-booking').append('<ul class="channel-booking">'+
									'	<li><span class="roomSp">渠道预订</span></li>'+
									'	<li>如以上没有您所需要的房型或房型已满，您可以前往合作渠道查询及预订。</li>'+
									'	<li>'+
									'		<a href="http://www.jiudianzaixian.cn/go.aspx?ctripHotelID=' + ChannelId + '">携程预订</a>'+
									'	</li>'+
									'</ul>');
						
					//Tip开始
					$(document).tooltip({
						items: '[data-type]',
					    show: null,
					    position: {
					        my: "left top",
					        at: "left bottom"
					    },
					    open: function( event, ui ) {
					        ui.tooltip.animate({ top: ui.tooltip.position().top + 10 }, "fast" );
					    },
					    content: function(){
					    	var element = $(this);
					    	if(element.data('type') == 'price'){
					    		var weeksMenu = '';
					    		for(var i = 0; i < weeksArr.length; i++) {
									weeksMenu += '<th>' + weeksArr[i] + '</th>';
								}
					    		
					    		var priceList = '';
					    		var RoomTypeId = element.attr("RoomTypeId");
								var RatePlanId = element.attr("RatePlanId");
								var RoomId = element.attr("RoomId");
					    		for(var i = 0; i < Rooms.length; i++) {
									var room = Rooms[i];
									//alert(room.RoomId);
									if(room.RoomId == RoomId) {
										for(var j = 0; j < room.RatePlans.length; j++) {
											var ratePlan = room.RatePlans[j];
											if(ratePlan.RatePlanId == RatePlanId && ratePlan.RoomTypeId == RoomTypeId) {
												for(var k = 0; k < ratePlan.NightlyRates.length; k++) {
													var rate = ratePlan.NightlyRates[k];
													
													if(rate.Status == false || rate.Member == '-1') {
														showStr = '满房';
													} else {
														showStr = '<sub>￥</sub>' + rate.Member + '</span>';
													}
													priceList += '<td><time>' + rate.Date.substring(5, 10) + '</time><span class="P-pricescurve-price">' + showStr + '</td>';
													if(k % 7 == 6) priceList += '</tr><tr>';
												}
											}
										}
									}
								}
					    		
					    		var priceInfo = '<table class="price-table" cellpadding="0" cellspacing="0" border="0">'+
					    					'<thead>' + weeksMenu + '</tr>'+
					    					'<tbody>'+
					    					'<tr>' + priceList + '</tr>'+
					    					'</tbody>'+
					    					'</table>';
					    		return priceInfo;
					    	} else if(element.data('type') == 'roomDetail'){
					    		var RoomName = $(this).attr("RoomName");
								var Broadnet = $(this).attr("Broadnet");
								var Floor = $(this).attr("Floor");
								var BedType = $(this).attr("BedType");
								var Description = $(this).attr("Description");
								var roomDetail = '<div class="i-pp-bd"><div class="P-tips"><dl class="P-tips_sheshi">' +
												'<dt>房间设施</dt>' +
												'<dd><strong>房型:' + RoomName + '</strong>;</dd>' +
												'<dd>简述:' + Description + ';</dd>' +
												'</dl></div></div>';
					    		return roomDetail;
					    	}
					    }
				    });
					//Tip结束
				}
			},
			error: function(xhr){
				layer.close(loadingIndex);
				getChannelList();
			},
			complete: function(){
				layer.close(loadingIndex);
			}
		});
	};
	
	rc.getRoomList = function(ArrivalDate, DepartureDate, HotelIds, LocalHotelId, ChannelId) {
		var _self = this;
		if(HotelIds == ''){
			_self.getLocalRoomList(ArrivalDate, DepartureDate, LocalHotelId, ChannelId);
			//getChannelList();
			return false;
		}
		var today = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
		var totalDays = getTotalDays(ArrivalDate, DepartureDate); //总天数
		var nowDay = new Date(Date.parse(ArrivalDate));
		if(isNaN(nowDay)) {
			var dateArr = ArrivalDate.split('-');
			nowDay = new Date(dateArr[0], parseInt(dateArr[1]) - 1, dateArr[2]);
		}
		var getDay = nowDay.getDay();
		var week = "";
		var weeksArr = [];
		if(totalDays > 0) {
			for(var i = 0; i < totalDays; i++) {
				var j = getDay + i;
				week = today[(j % 7)];
				weeksArr.push(week);
				if(i == 6) break;
			}
		} else {
			layer.msg('入住日期和离店日期不能是同一天');
			return false;
		}
	
		var getElongPrice = $.ajax({
			type: 'get',
			url: 'http://price.leyohotel.com/hotelData.aspx?at=hotel.detail&ArrivalDate=' + ArrivalDate + '&DepartureDate=' + DepartureDate + '&HotelIds=' + HotelIds + '&callback=?',
			async: true,
			dataType: 'json',
			beforeSend: function(xhr){
				loadingIndex = layer.load(0, {shade: [0.1,'#000']});
			},
			error: function(xhr){
				layer.close(loadingIndex);
				layer.msg('加载价格失败');
			},
			complete: function(){
				layer.close(loadingIndex);
			}
		}).then(function(data) {
			layer.close(loadingIndex);
			if(data.Code != '0' || data.Result.Count == 0) {
				//getChannelList();
				_self.getLocalRoomList(ArrivalDate, DepartureDate, LocalHotelId, ChannelId);
	
				return false;
			}
			var hotels = data.Result.Hotels;
			if(hotels.length == 0) {
				//getChannelList();
				_self.getLocalRoomList(ArrivalDate, DepartureDate, LocalHotelId, ChannelId);
	
				return false;
			}
			var oneHotel = hotels[0];
			var HotelId = oneHotel.HotelId;
			var LowRate = oneHotel.LowRate;
			var CurrencyCode = oneHotel.CurrencyCode;
			var Rooms = oneHotel.Rooms;
			if(!Rooms || Rooms.length == 0) {
				//getChannelList();
				_self.getLocalRoomList(ArrivalDate, DepartureDate, LocalHotelId, ChannelId);
	
				return false;
			}
			
			$('#onlineBooking').show();
			$('#channelList').hide();
	
			//增值服务
			var oBreakfast = getValueAddsBreakfast(oneHotel.ValueAdds, ArrivalDate, DepartureDate);
			//console.log(oBreakfast);
			
			var outHtml = '        <table width="100%" border="0" cellspacing="0" cellpadding="0">' +
				'        <thead>' +
				'		  <tr style="background-color:#ddd1a7; height:30px;">' +
				'		    <th style="width:30%;">房型</th>' +
				'		    <th style="width:10%;">床型</th>' +
				'		    <th style="width:10%;">宽带</th>' +
				'		    <th style="width:10%;">早餐</th>' +
				'		    <th style="width:15%;">日均价</th>' +
				'		    <th style="width:15%; text-align:left; padding-left:21px;">操作</th>' +
				'		  </tr>' +
				'        </thead>' +
				'        <tbody>';
	
			for(var i = 0; i < Rooms.length; i++) {
				var oneRoom = Rooms[i];
				var RatePlans = Rooms[i].RatePlans;
				if(RatePlans.length == 1) {
					var isMf = false;
					if(!RatePlans[0].Status) {
						isMf = true;
					}
					for(var k = 0; k < RatePlans[0].NightlyRates.length; k++) {
						if(RatePlans[0].NightlyRates[k].Status == false || RatePlans[0].NightlyRates[k].Member == "-1") {
							isMf = true;
							break;
						}
					}
					
					var breakfastName = getRatePlanBreakfast(RatePlans[0].ValueAddIds, oBreakfast);
					
					outHtml += '		  <tr class="room_bg_color">' +
						'		    <td class="text-weizhi1 padding-top-bottom border-bottom roomNameText" style="text-align:left;"><span class="roomSp popup" name="fx" RoomId="' + oneRoom.RoomId + '" RoomName="' + oneRoom.Name + '" Floor="' + oneRoom.Floor + '" Broadnet="' + oneRoom.Broadnet + '" BedType="' + oneRoom.BedType + '" Description="' + oneRoom.Description + '" data-type="roomDetail">' + oneRoom.Name + ' - ' + RatePlans[0].RatePlanName + '</span></td>' +
						'		    <td class="text-weizhi2 padding-top-bottom border-bottom">' + oneRoom.BedType + '</td>' +
						'		    <td class="text-weizhi3 padding-top-bottom border-bottom">' + getBroadnetInfo(oneRoom.Broadnet) + '</td>' +
						'		    <td class="text-weizhi4 padding-top-bottom border-bottom">' + getBreakfast(RatePlans[0].RatePlanName) + '</td>' +
						'		    <td class="text-weizhi5 padding-top-bottom border-bottom"><span class="color1 popup" name="price" RatePlanID="' + RatePlans[0].RatePlanId + '" RoomTypeId="' + RatePlans[0].RoomTypeId + '" RoomId="' + oneRoom.RoomId + '" data-type="price">￥' + RatePlans[0].AverageRate + '</span></td>' +
						'		    <td class="text-weizhi6 padding-top-bottom border-bottom">' + (isMf ? '<a class="booknone" href="javascript:;">满房</a>' : '<a class="book" href="/order' + RatePlans[0].RoomTypeId + '_' + RatePlans[0].RatePlanId + '.html">预订</a>') + '</td>' +
						'		  </tr>';
				} else {
					outHtml += '		  <tr class="room_bg_color">' +
						'		    <td class="text-weizhi1 padding-top-bottom roomNameText" style="text-align:left;"><span class="roomSp" name="fx" RoomId="' + oneRoom.RoomId + '" RoomName="' + oneRoom.Name + '" Floor="' + oneRoom.Floor + '" Broadnet="' + oneRoom.Broadnet + '" BedType="' + oneRoom.BedType + '" Description="' + oneRoom.Description + '" data-type="roomDetail">' + oneRoom.Name + '</span></td>' +
						'		    <td class="text-weizhi2 padding-top-bottom"></td>' +
						'		    <td class="text-weizhi3 padding-top-bottom"></td>' +
						'		    <td class="text-weizhi4 padding-top-bottom"></td>' +
						'		    <td class="text-weizhi5 padding-top-bottom"></td>' +
						'		    <td class="text-weizhi6 padding-top-bottom"></td>' +
						'		  </tr>';
					for(var j = 0; j < RatePlans.length; j++) {
						var isMf = false;
						for(var k = 0; k < RatePlans[j].NightlyRates.length; k++) {
							if(RatePlans[j].NightlyRates[k].Status == false || RatePlans[j].NightlyRates[k].Member == "-1") {
								isMf = true;
								break;
							}
						}
						
						var breakfastName = getRatePlanBreakfast(RatePlans[j].ValueAddIds, oBreakfast);
						
						outHtml += '		  <tr>' +
							'		    <td class="text-weizhi1 padding-top-bottom' + (j == (RatePlans.length - 1) ? " border-bottom" : "") + '"><div class="rpName">' + RatePlans[j].RatePlanName + '</div></td>' +
							'		    <td class="text-weizhi2 padding-top-bottom' + (j == (RatePlans.length - 1) ? " border-bottom" : "") + '">' + oneRoom.BedType + '</td>' +
							'		    <td class="text-weizhi3 padding-top-bottom' + (j == (RatePlans.length - 1) ? " border-bottom" : "") + '">' + getBroadnetInfo(oneRoom.BedType) + '</td>' +
							'		    <td class="text-weizhi4 padding-top-bottom' + (j == (RatePlans.length - 1) ? " border-bottom" : "") + '">' + breakfastName + '</td>' +
							'		    <td class="text-weizhi5 padding-top-bottom' + (j == (RatePlans.length - 1) ? " border-bottom" : "") + '"><span class="color1 popup" name="price" RatePlanId="' + RatePlans[j].RatePlanId + '" RoomTypeId="' + RatePlans[j].RoomTypeId + '" RoomId="' + oneRoom.RoomId + '" data-type="price">￥' + RatePlans[j].AverageRate + '</span></td>' +
							'		    <td class="text-weizhi6 padding-top-bottom' + (j == (RatePlans.length - 1) ? " border-bottom" : "") + '">' + (isMf ? '<a class="booknone" href="javascript:;">满房</a>' : '<a class="book" href="/order' + RatePlans[j].RoomTypeId + '_' + RatePlans[j].RatePlanId + '.html">预订</a>') + '</td>' +
							'		  </tr>';
					}
				}
			}
			outHtml += '        </tbody>' +
				'		</table>';
			$("#roomList").html(outHtml);
			
			//渠道预订
			$('#channel-booking').append('<ul class="channel-booking">'+
									'	<li><span class="roomSp">渠道预订</span></li>'+
									'	<li>如以上没有您所需要的房型或房型已满，您可以前往合作渠道查询及预订。</li>'+
									'	<li>'+
									'		<a href="http://www.jiudianzaixian.cn/go.aspx?ctripHotelID=' + ChannelId + '">携程预订</a>'+
									'	</li>'+
									'</ul>');
	
			//Tip开始
			$(document).tooltip({
				items: '[data-type]',
			    show: null,
			    position: {
			        my: "left top",
			        at: "left bottom"
			    },
			    open: function( event, ui ) {
			        ui.tooltip.animate({ top: ui.tooltip.position().top + 10 }, "fast" );
			    },
			    content: function(){
			    	var element = $(this);
			    	if(element.data('type') == 'price'){
			    		var weeksMenu = '';
			    		for(var i = 0; i < weeksArr.length; i++) {
							weeksMenu += '<th>' + weeksArr[i] + '</th>';
						}
			    		
			    		var priceList = '';
			    		var RoomTypeId = element.attr("RoomTypeId");
						var RatePlanId = element.attr("RatePlanId");
						var RoomId = element.attr("RoomId");
			    		for(var i = 0; i < Rooms.length; i++) {
							var room = Rooms[i];
							//alert(room.RoomId);
							if(room.RoomId == RoomId) {
								for(var j = 0; j < room.RatePlans.length; j++) {
									var ratePlan = room.RatePlans[j];
									if(ratePlan.RatePlanId == RatePlanId && ratePlan.RoomTypeId == RoomTypeId) {
										for(var k = 0; k < ratePlan.NightlyRates.length; k++) {
											var rate = ratePlan.NightlyRates[k];
											
											if(rate.Status == false || rate.Member == '-1') {
												showStr = '满房';
											} else {
												showStr = '<sub>￥</sub>' + rate.Member + '</span>';
											}
											priceList += '<td><time>' + rate.Date.substring(5, 10) + '</time><span class="P-pricescurve-price">' + showStr + '</td>';
											if(k % 7 == 6) priceList += '</tr><tr>';
										}
									}
								}
							}
						}
			    		
			    		var priceInfo = '<table class="price-table" cellpadding="0" cellspacing="0" border="0">'+
			    					'<thead>' + weeksMenu + '</tr>'+
			    					'<tbody>'+
			    					'<tr>' + priceList + '</tr>'+
			    					'</tbody>'+
			    					'</table>';
			    		return priceInfo;
			    	} else if(element.data('type') == 'roomDetail'){
			    		var RoomName = $(this).attr("RoomName");
						var Broadnet = $(this).attr("Broadnet");
						var Floor = $(this).attr("Floor");
						var BedType = $(this).attr("BedType");
						var Description = $(this).attr("Description");
						var roomDetail = '<div class="i-pp-bd"><div class="P-tips"><dl class="P-tips_sheshi">' +
										'<dt>房间设施</dt>' +
										'<dd><strong>房型:' + RoomName + '</strong>;</dd>' +
										'<dd>简述:' + Description + ';</dd>' +
										'</dl></div></div>';
			    		return roomDetail;
			    	}
			    }
		    });
			//Tip结束
		});
	};
	
	return rc;
}(jQuery, RoomChannel || {});
			