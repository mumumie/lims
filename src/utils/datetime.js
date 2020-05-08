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
