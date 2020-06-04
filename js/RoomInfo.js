// JavaScript Document
function StringToDate(DateStr){
	var converted = Date.parse(DateStr);
	var myDate = new Date(converted);
	if(isNaN(myDate)){
		var DateArr = DateStr.split('-');
		myDate = new Date(DateArr[0], --DateArr[1], DateArr[2]);
	}
	return myDate;
}
//返回总天数
function GetTotalDay(ArrivalDate, DepartureDate) {
    var mmSec = (new Date(DepartureDate).getTime() - new Date(ArrivalDate).getTime());
    if(isNaN(new Date(DepartureDate)) || isNaN(new Date(ArrivalDate))){
    	mmSec = StringToDate(DepartureDate) - StringToDate(ArrivalDate);
    }
    return (mmSec/3600000/24);
}

//本地价格到店时间检查是否需要担保
function CheckLocalArrivalGuarantee(ArrivalLateTime, StartTime, EndTime, IsTomorrow){
	var isGuarantee = false;
	if (IsTomorrow) {
        EndTime += 24;
    }

    if (ArrivalLateTime < 12) {
        ArrivalLateTime = ArrivalLateTime + 24;
    }

    if (ArrivalLateTime >= StartTime && ArrivalLateTime <= EndTime) {
        isGuarantee = true;
    }
    
    return isGuarantee;
}

//检查是否需要担保
function CheckGuaranteeRules(GuaranteeRuleIds, GuaranteeRules, roomNum, ArrivalLateTime) {
    if (GuaranteeRules == "undefined") {
        return false;
    }
    if (GuaranteeRuleIds == null || GuaranteeRuleIds == "") {
        return false;
    }
    var IsAmountGuarantee = GuaranteeRules.IsAmountGuarantee;
    var IsTimeGuarantee = GuaranteeRules.IsTimeGuarantee;
    var isGuarantee = false;

    var Amount = GuaranteeRules.Amount;
    var StartTime = GuaranteeRules.StartTime;
    var EndTime = GuaranteeRules.EndTime;
    var IsTomorrow = GuaranteeRules.IsTomorrow;
    var StartTimeInt = 0;
    var EndTimeInt = 0;
    if (IsAmountGuarantee == false && IsTimeGuarantee == false) {
        isGuarantee = true;
    }
    else if (IsAmountGuarantee == true && IsTimeGuarantee == false) {
        if (roomNum >= Amount) {
            isGuarantee = true;
        }
    }
    else if (IsAmountGuarantee == false && IsTimeGuarantee == true) {
        StartTimeInt = parseInt(StartTime.substring(0, 2));
        EndTimeInt = parseInt(EndTime.substring(0, 2));
        if (IsTomorrow) {
            EndTimeInt += 24;
        }

        if (ArrivalLateTime < 12) {
            ArrivalLateTime = parseInt(ArrivalLateTime) + 24;
        }

        if (ArrivalLateTime > StartTimeInt && ArrivalLateTime <= EndTimeInt) {
            isGuarantee = true;
        }
    }
    else if (IsAmountGuarantee == true && IsTimeGuarantee == true) {
        if (roomNum >= Amount) {
            isGuarantee = true;
        }

        StartTimeInt = parseInt(StartTime.substring(0, 2));
        EndTimeInt = parseInt(EndTime.substring(0, 2));
        if (IsTomorrow) {
            EndTimeInt += 24;
        }

        if (ArrivalLateTime < 12) {
            ArrivalLateTime = parseInt(ArrivalLateTime) + 24;
        }

        if (ArrivalLateTime > StartTimeInt && ArrivalLateTime <= EndTimeInt) {
            isGuarantee = true;
        }
    }
    return isGuarantee;
}

//返回房型的宽带
function getBroadnetInfo(bn) {
    var broadnetStr = "";
    switch (bn) {
        case "0":
            broadnetStr = "无网络";
            break;

        case "1":
            broadnetStr = "免费宽带";
            break;

        case "2":
            broadnetStr = "收费宽带";
            break;

        case "3":
            broadnetStr = "免费WIFI";
            break;

        case "4":
            broadnetStr = "收费WIFI";
            break;
    }
    return broadnetStr;
}

//本地宽带信息
function getBroadnetInfoLocal(hasBroadnet, broadnetFee) {
    var BroadnetInfo = "";
    if (hasBroadnet == "true") {
        hasBroadnet = true;
    } else if (hasBroadnet == "false") {
        hasBroadnet = false;
    }
    if (broadnetFee == "true") {
        broadnetFee = true;
    } else if (broadnetFee == "false") {
        broadnetFee = false;
    }
    if (hasBroadnet == "") {
        BroadnetInfo = "无宽带";
        return BroadnetInfo;
    }
    if (hasBroadnet) {
        if (broadnetFee) {
            BroadnetInfo = "收费宽带";
        } else {
            BroadnetInfo = "免费宽带";
        }
    } else {
        BroadnetInfo = "无宽带";
    }
    return BroadnetInfo;
}

function getBreakfast(ratePlanName) {
    var breakfast = "";
    if (ratePlanName.indexOf("不") >= 0) {
        breakfast = "无早";
    }
    else if (ratePlanName.indexOf("双早") >= 0) {
        breakfast = "双早";
    }
    else if (ratePlanName.indexOf("三早") >= 0) {
        breakfast = "三早";
    }
    else if (ratePlanName.indexOf("含早") >= 0) {
        breakfast = "含早";
    }
    else if (ratePlanName.indexOf("含单早") >= 0) {
        breakfast = "单早";
    }
    else {
        breakfast = "无早";
    }
    return breakfast;
}

function getBroadnet(hasBroadnet, broadnetFee) {
    var broadnetInfo = "";
    if (hasBroadnet == "无") {
        broadnetInfo = "无宽带";
    } else {
        broadnetInfo = broadnetFee;
    }
    return broadnetInfo;
}

function getBedType(bedType) {
    var bedTypeShort = "";
    if (bedType.indexOf("大床") >= 0) {
        bedTypeShort = "大";
    }
    if (bedType.indexOf("双床") >= 0) {
        bedTypeShort += (bedTypeShort == "" ? "" : "/") + "双";
    }
    return bedTypeShort;
}