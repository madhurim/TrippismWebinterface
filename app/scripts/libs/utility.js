
function ConvertToRequiredDate(dtval, calledFrom) {
    var dt = ConvertToDateObject(dtval);
    if (dt == 'Invalid Date' || !dt) return null;
    var curr_date = ('0' + dt.getDate()).slice(-2);
    var curr_month = ('0' + (dt.getMonth() + 1)).slice(-2);
    var curr_year = dt.getFullYear();
    dt.setHours(0, 0, 0, 0);
    var _date;
    if (calledFrom == 'UI')
        _date = curr_month + "/" + curr_date + '/' + curr_year;
    else if (calledFrom == 'API')
        _date = curr_year + "-" + curr_month + "-" + curr_date;
    else
        _date = curr_month + "/" + curr_date + '/' + curr_year;
    return _date;
}

function ConvertToDateObject(dtval) {
    var dt;
    if (typeof dtval == 'string') {
        dtval = dtval.replace("T00:00:00", "").replace(/\//g, "-");
        var datearray = dtval.split('-');
        if (datearray.length == 3) {
            if (datearray[0].length == 4)
                dt = new Date(datearray[0], parseInt(datearray[1]) - 1, datearray[2]);
            else if (datearray[2].length == 4)
                dt = new Date(datearray[2], parseInt(datearray[0]) - 1, datearray[1]);
        }
    }
    else
        dt = new Date(dtval);
    return dt;
}

function Dateformat() {
    var format = ['yyyy-MM-dd', 'dd-MM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'MM/dd/yyyy'];
    return format;
}

function AvailableTheme() {
    var theme = [
                    { id: "BEACH", value: "BEACH" },
                    { id: "CARIBBEAN", value: "CARIBBEAN" },
                    { id: "DISNEY", value: "DISNEY" },
                    { id: "GAMBLING", value: "GAMBLING" },
                    { id: "HISTORIC", value: "HISTORIC" },
                    { id: "MOUNTAINS", value: "MOUNTAINS" },
                    { id: "NATIONAL-PARKS", value: "NATIONAL-PARKS" },
                    { id: "OUTDOORS", value: "OUTDOORS" },
                    { id: "ROMANTIC", value: "ROMANTIC" },
                    { id: "SHOPPING", value: "SHOPPING" },
                    { id: "SKIING", value: "SKIING" },
                    { id: "THEME-PARK", value: "THEME-PARK" }
    ];
    return theme;
}

function AvailableRegions() {
    var region = [
                    { id: 'Africa', value: 'Africa' },
                    { id: 'Asia Pacific', value: 'Asia Pacific' },
                    { id: 'Europe', value: 'Europe' },
                    { id: 'Latin America', value: 'Latin America' },
                    { id: 'Middle East', value: 'Middle East' },
                    { id: 'North America', value: 'North America' },
    ];

    return region;
}

function checkEmail(email) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(email))
        return false;
    else
        return true;
}

function getLengthOfStay(frdt, todt) {
    frdt = new Date(frdt);
    todt = new Date(todt);
    var timeDiff = Math.abs(todt.getTime() - frdt.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function addDays(dt, noOfDays) {
    var newDate = new Date(dt);
    newDate.setDate(newDate.getDate() + noOfDays);
    return newDate;
}

function loadScrollbars() {
    $(".contentHorizontal").mCustomScrollbar({
        axis: "x",
        advanced: {
            autoExpandHorizontalScroll: true
        }
    });
    $(".contentVertical").mCustomScrollbar({
        axis: "y",
        advanced: {
            autoExpandVerticallScroll: true
        }
    });
    $("#content-3").mCustomScrollbar({
        axis: "y",
        advanced: {
            autoExpandVerticallScroll: true
        }
    });
}
function updateScrollbars() {
    $(".contentHorizontal").mCustomScrollbar("update");
    $(".contentVertical").mCustomScrollbar("update");
    $("#content-3").mCustomScrollbar("update");
}

function ConvertToString(dtString) {
    var str = dtString;
    var substr = str.split(" ");
    var newStr = substr[0] + ", " + substr[1] + " " + substr[2] + " " + substr[3];
    return newStr;
}

function GetFromDate() {
    var dt = new Date();
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function GetDateDisplay(dtFrmStr) {
    var str;
    var newStr = new Date(dtFrmStr);
    str = ConvertToString(newStr.toDateString());
    if (str.toLowerCase().indexOf("invalid") != -1) {
        str = "Invalid Date !!";
    }
    return str;
}

function GetToDate(dtFromStr) {
    var Todt = new Date(dtFromStr);
    var fDate = new Date(dtFromStr);
    Todt.setDate(fDate.getDate() + 5); // add default from 5 days
    Todt.setHours(0, 0, 0, 0);
    return Todt;
}

function serialize(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            var propval = encodeURIComponent(obj[p]);
            if (propval != "undefined" && propval != "null" && propval != '')
                str.push(encodeURIComponent(p) + "=" + propval);
        }
    return str.join("&");
}

function Browser_Name() {
    var User_Browser_Info = navigator.userAgent;
    var browserName = navigator.appName;

    var OthorBrowser, AppInfo, ix;

    if ((AppInfo = User_Browser_Info.indexOf("OPR/")) != -1) {
        browserName = "Opera";
    }
    else if ((AppInfo = User_Browser_Info.indexOf("Opera")) != -1) {
        browserName = "Opera";
    }
    else if ((AppInfo = User_Browser_Info.indexOf("MSIE")) != -1) {
        browserName = "Microsoft Internet Explorer";
    }
    else if ((AppInfo = User_Browser_Info.indexOf("Chrome")) != -1) {
        browserName = "Google Chrome";
    }
    else if ((AppInfo = User_Browser_Info.indexOf("Safari")) != -1) {
        browserName = "Safari";
    }
    else if ((AppInfo = User_Browser_Info.indexOf("Firefox")) != -1) {
        browserName = "Firefox";
    }
    else if ((OthorBrowser = User_Browser_Info.lastIndexOf(' ') + 1) <
              (AppInfo = User_Browser_Info.lastIndexOf('/'))) {
        browserName = User_Browser_Info.substring(OthorBrowser, AppInfo);
    }
    return browserName;
}

function User_Device() {
    return window.navigator.platform;    
}
