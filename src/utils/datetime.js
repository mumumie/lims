/**
 * 时间日期相关操作
 */


/**
 * 时间格式化
 * 将 2018-09-23T11:54:16.000+0000 格式化成 2018/09/23 11:54:16
 * @param datetime 国际化日期格式
 */
export function format (datetime) {
  return formatWithSeperator(datetime, "/", ":");
}

/**
 * 时间格式化
 * 将 2018-09-23T11:54:16.000+0000 格式化成类似 2018/09/23 11:54:16
 * 可以指定日期和时间分隔符
 * @param datetime 国际化日期格式
 */
function isZero(m){
  return m<10?'0'+m:m
}
export function formatWithSeperator (datetime, dateSeprator, timeSeprator) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = dateMat.getMonth() + 1;
    const day = dateMat.getDate();
    const hh = dateMat.getHours();
    const mm = dateMat.getMinutes();
    const ss = dateMat.getSeconds();
    const timeFormat = year + dateSeprator + isZero(month) + dateSeprator + isZero(day) + " " + isZero(hh) + timeSeprator + isZero(mm) + timeSeprator + isZero(ss);
    return timeFormat;
  }
}
// 年月日
export function formatData (datetime) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = dateMat.getMonth() + 1;
    const day = dateMat.getDate();
    const hh = dateMat.getHours();
    const mm = dateMat.getMinutes();
    const ss = dateMat.getSeconds();
    const timeFormat = year + '/' + isZero(month) + '/' + isZero(day);
    return timeFormat;
  }
}
// 年月日 时分秒
export function formatDataAll(datetime) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = dateMat.getMonth() + 1;
    const day = dateMat.getDate();
    const hh = dateMat.getHours();
    const mm = dateMat.getMinutes();
    const ss = dateMat.getSeconds();
    const timeFormat = year + '/' + isZero(month) + '/' + isZero(day) + " " + isZero(hh) + ":" + isZero(mm) + ":" + isZero(ss);
    return timeFormat;
  }
}
// 年月日随机码
export function formatDataCode (datetime) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = dateMat.getMonth() + 1;
    const day = dateMat.getDate();
    const hh = dateMat.getHours();
    const mm = dateMat.getMinutes();
    const ss = dateMat.getSeconds();
    const timeFormat = year + '' + isZero(month) + '' + isZero(day) + '' + isZero(hh) + '' + isZero(mm) + '' + isZero(ss);
    return timeFormat;
  }
}
// 时间差时分秒
export function formatDataStep(datetime) {
  if (datetime != null) {
    //计算出相差天数
    let days = Math.floor(datetime / (24 * 60 * 60 * 1000));
    //计算小时数
    let hourLevel = datetime % (24 * 60 * 60 * 1000);
    let hh = Math.floor(datetime / (60 * 60 * 1000));
    //计算分钟数
    let minutesLevel = hourLevel % (60 * 60 * 1000);
    let mm = Math.floor(minutesLevel / (60 * 1000));
    //计算秒数
    let ss = Math.round((minutesLevel % (60 * 1000)) / 1000);
    const timeFormat = isZero(hh) + ":" + isZero(mm) + ":" + isZero(ss);
    // console.log(hh,mm,ss);
    return timeFormat;
  }
}


/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * (formatDate_fmtn("yyyy-MM-dd hh:mm:ss.S") ==> 2007-07-02 08:09:04.423
 * (formatDate_fmt("yyyy-MM-dd E HH:mm:ss") ==> 2007-03-10 二 20:09:04
 * (formatDate_fmt("yyyy-MM-dd EE hh:mm:ss") ==> 2007-03-10 周二 08:09:04
 * (formatDate_fmt("yyyy-MM-dd EEE hh:mm:ss") ==> 2007-03-10 星期二 08:09:04
 * (formatDate_fmt("yyyy-M-d h:m:s.S") ==> 2007-7-2 8:9:4.18
 */

export const formatDate_fmt = function(date, fmt) {

  var o = {
      "M+": date.getMonth() + 1,
      //月份
      "d+": date.getDate(),
      //日
      "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
      //小时
      "H+": date.getHours(),
      //小时
      "m+": date.getMinutes(),
      //分
      "s+": date.getSeconds(),
      //秒
      "q+": Math.floor((date.getMonth() + 3) / 3),
      //季度
      "S": date.getMilliseconds() //毫秒
    },
    week = {
      "0": "\u65e5",
      "1": "\u4e00",
      "2": "\u4e8c",
      "3": "\u4e09",
      "4": "\u56db",
      "5": "\u4e94",
      "6": "\u516d"
    };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f": "\u5468") : "") + week[date.getDay() + ""]);
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }

  return fmt;
}
