
function ConvertToRequiredDate(dt, calledFrom) {
    dt = new Date(dt);
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

function daydiff(first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
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
