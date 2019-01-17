/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//const SV_IP   = 'sensor.rp.lfx.sony.co.jp';   // node.js server の IP アドレス
//const SV_IP   = '43.2.100.152';               // node.js server の IP アドレス
const SV_IP   = '192.168.91.11';              // node.js server の IP アドレス
const SV_PORT = 3000;                         // node.js server の port 番号

let server = io.connect('http://' + SV_IP + ':' + SV_PORT); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
var obj_sa_acc_x        = {name:'sa_acc_x',        chart:null, data:null, type:'area', color:'#E64A19', minimum:0,   title:'加速度(x)',      unit:'[?]'};
var obj_sa_acc_y        = {name:'sa_acc_y',        chart:null, data:null, type:'area', color:'#E64A19', minimum:0,   title:'加速度(y)',      unit:'[?]'};
var obj_sa_acc_z        = {name:'sa_acc_z',        chart:null, data:null, type:'area', color:'#E64A19', minimum:0,   title:'加速度(z)',      unit:'[?]'};
var obj_sa_gyro_g1      = {name:'sa_gyro_g1',      chart:null, data:null, type:'area', color:'#FFA000', minimum:0,   title:'ジャイロ(g1)',   unit:'[?]'};
var obj_sa_gyro_g2      = {name:'sa_gyro_g2',      chart:null, data:null, type:'area', color:'#FFA000', minimum:0,   title:'ジャイロ(g2)',   unit:'[?]'};

var obj_si_bme280_atmos = {name:'si_bme280_atmos', chart:null, data:null, type:'area', color:'#1976D2', minimum:500, title:'気圧(bme280)',   unit:'[hPa]'};
var obj_si_bme280_humi  = {name:'si_bme280_humi',  chart:null, data:null, type:'area', color:'#00796B', minimum:0,   title:'湿度(bme280)',   unit:'[%]'};
var obj_si_bme280_temp  = {name:'si_bme280_temp',  chart:null, data:null, type:'area', color:'#C2185B', minimum:0,   title:'温度(bme280)',   unit:'[℃]'};
var obj_si_gp2y0e03     = {name:'si_gp2y0e03',     chart:null, data:null, type:'area', color:'#455A64', minimum:0,   title:'距離(gp2y0e03)', unit:'[cm]'};
var obj_si_lps25h_atmos = {name:'si_lps25h_atmos', chart:null, data:null, type:'area', color:'#1976D2', minimum:500, title:'気圧(lps25h)',   unit:'[hPa]'};
var obj_si_lps25h_temp  = {name:'si_lps25h_temp',  chart:null, data:null, type:'area', color:'#C2185B', minimum:0,   title:'温度(lps25h)',   unit:'[℃]'};
var obj_si_tsl2561_lux  = {name:'si_tsl2561_lux',  chart:null, data:null, type:'area', color:'#AFB42B', minimum:0,   title:'照度(tsl2561)',  unit:'[LUX]'};

var obj_sensors_daily   = {name:'sensors_daily',   chart:null, data:null, type:'area', color:'#1E88E5', minimum:0,   title:'一日のデータ', unit:''};


// ブラウザオブジェクトから受け取るイベント
window.onload = function() {
  console.log("[app.js] window.onloaded");
  initChartSensor30s();
  initChartSensorDaily();
  initTableSensorNow();
};


window.onunload = function() {
  console.log("[app.js] window.onunloaded");
};


/**
 * 30 sec のセンサ値表示用のパラメータを初期化する。
 * @param {void}
 * @return {void}
 * @example
 * initChartSensor30s();
*/
function initChartSensor30s() {
  console.log("[app.js] initChartSensor30s()");

  makeChartSensor30s(obj_sa_acc_x       );
  makeChartSensor30s(obj_sa_acc_y       );
  makeChartSensor30s(obj_sa_acc_z       );
  makeChartSensor30s(obj_sa_gyro_g1     );
  makeChartSensor30s(obj_sa_gyro_g2     );
  makeChartSensor30s(obj_si_bme280_atmos);
  makeChartSensor30s(obj_si_bme280_humi );
  makeChartSensor30s(obj_si_bme280_temp );
  makeChartSensor30s(obj_si_gp2y0e03    );
  makeChartSensor30s(obj_si_lps25h_atmos);
  makeChartSensor30s(obj_si_lps25h_temp );
  makeChartSensor30s(obj_si_tsl2561_lux );

  obj_sa_acc_x.chart.render();
  obj_sa_acc_x.chart.render();
  obj_sa_acc_y.chart.render();
  obj_sa_acc_z.chart.render();
  obj_sa_gyro_g1.chart.render();
  obj_sa_gyro_g2.chart.render();
  obj_si_bme280_atmos.chart.render();
  obj_si_bme280_humi.chart.render();
  obj_si_bme280_temp.chart.render();
  obj_si_gp2y0e03.chart.render();
  obj_si_lps25h_atmos.chart.render();
  obj_si_lps25h_temp.chart.render();
  obj_si_tsl2561_lux.chart.render();
  return;
};


/**
 * 1 day のセンサ値表示用のパラメータを初期化する。
 * @param {void}
 * @return {void}
 * @example
 * initChartSensorDaily();
*/
function initChartSensorDaily() {
  console.log("[app.js] initChartSensorDaily()");

  makeChartSensorDaily(obj_sensors_daily);
  obj_sensors_daily.chart.render();
  return;
};


/**
 * 現在のセンサ値表示用のテーブルを初期化する。
 * @param {void}
 * @return {void}
 * @example
 * initTableSensorNow();
*/
function initTableSensorNow() {
  console.log("[app.js] initTableSensorNow()");

  $('#tabulator-table-10sec').tabulator( {
    layout: 'fitData',
    tooltips: true,
    addRowPos: 'top',
    history: true,
    pagination: 'local',
    paginationSize: 15,
    movableColumns: true,
    initialSort: [
      {column:'title', dir:'asc'},
    ],
    columns:[
      {title:'センサ', field:'sensor', align:'left',  width:'150', sortable:'true', sorter:'string', formatter:'plaintext', editable:false,                                  },
      {title:'値',     field:'value',  align:'right', width:'100', sortable:'true', sorter:'number', formatter:'plaintext', editable:false, cssClass:'tabulator-background', },
      {title:'単位',   field:'unit',   align:'left',  width:'100', sortable:'true', sorter:'string', formatter:'plaintext', editable:false,                                  },
    ],
  });
  return;
};


/**
 * 30sec のデータを表示するグラフ ( チャート ) を作成する。
 * @param {object} obj - グラフ化する対象のオブジェクト
 * @return {void}
 * @example
 * makeChartSensor30s(obj_sa_acc_x);
*/
function makeChartSensor30s(obj) {
  console.log("[app.js] makeChartSensor30s()");

  let data = new Array({label:'30秒前', y:0}, {label:'20秒前', y:0}, {label:'10秒前', y:0}, {label:'今', y:0});

  let domid = 'cid_' + obj.name;
  console.log("[app.js] domid = " + domid);

  let chart = new CanvasJS.Chart(domid, {
    animationEnabled:  true,
    animationDuration: 2000,
    title: {
      text:      obj.title,
      fontColor: '#222',
      fontSize:  16,
    },
    subtitles: [{
      text:      '単位: ' + obj.unit,
      fontColor: '#555',
      fontSize:  12,
    }],
    axisX: {labelAngle:-45, labelFontSize:14, labelFontColor:'#222'},
    axisY: {minimum: obj.minimum, labelFontSize:14, labelFontColor:'#222'},
    data: [{
      type:       obj.type,           // グラフの種類 (area, bar, bubble, column, stackedColumn )
      color:      obj.color,
      cursor:     'pointer',
      dataPoints: data        // グラフに描画するデータ
    }]
  });

  obj.chart = chart;
  obj.data  = data;
  return;
};


/**
 * 1 day のデータを表示するグラフ ( チャート ) を作成する。
 * @param {object} obj - グラフ化する対象のオブジェクト
 * @return {void}
 * @example
 * makeChartSensorDaily(obj_sensors_daily);
*/
function makeChartSensorDaily(obj) {
  console.log("[app.js] makeChartSensorDaily()");

  let data = new Array({label:'00-00', y:0}, {label:'01-00', y:0}, {label:'02-00', y:0}, {label:'03-00', y:0},
                       {label:'04-00', y:0}, {label:'05-00', y:0}, {label:'06-00', y:0}, {label:'07-00', y:0},
                       {label:'08-00', y:0}, {label:'09-00', y:0}, {label:'10-00', y:0}, {label:'11-00', y:0},
                       {label:'12-00', y:0}, {label:'13-00', y:0}, {label:'14-00', y:0}, {label:'15-00', y:0},
                       {label:'16-00', y:0}, {label:'17-00', y:0}, {label:'18-00', y:0}, {label:'19-00', y:0},
                       {label:'20-00', y:0}, {label:'21-00', y:0}, {label:'22-00', y:0}, {label:'23-00', y:0}
                      );

  let domid = 'cid_' + obj.name;
  console.log("[app.js] domid = " + domid);

  let chart = new CanvasJS.Chart(domid, {
    animationEnabled:  true,
    animationDuration: 2000,
    title: {
      text:      obj.title,
      fontColor: '#222',
      fontSize:  16,
    },
    subtitles: [{
      text:      '単位: ' + obj.unit,
      fontColor: '#555',
      fontSize:  12,
    }],
    axisX: {labelAngle:-45, labelFontSize:14, labelFontColor:'#222'},
    axisY: {minimum: obj.minimum, labelFontSize:14, labelFontColor:'#222'},
    data: [{
      type:       obj.type,           // グラフの種類 (area, bar, bubble, column, stackedColumn )
      color:      obj.color,
      cursor:     'pointer',
      dataPoints: data        // グラフに描画するデータ
    }]
  });

  obj.chart = chart;
  obj.data  = data;
  return;
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on('connect', function() {               // 接続時
  console.log("[app.js] " + 'connected');
});


server.on('disconnect', function(client) {    // 切断時
  console.log("[app.js] " + 'disconnected');
});


server.on('S_to_C_DATA', function(data) {
  console.log("[app.js] " + 'S_to_C_DATA');
  console.log("[app.js] data = " + data.value);
//  window.alert( 'コマンドを送信しました。\n\r' + data.value );

  document.getElementById('val_sensor').innerHTML = data.value; // 数値を表示
});


server.on('S_to_C_SENSOR_30S', function(data) {
  console.log("[app.js] " + 'S_to_C_SENSOR_30S');
//  console.log( "[app.js] data.value = " + JSON.stringify(data) );

//  obj = (new Function( 'return ' + data.value ))();

  // グラフ表示
  updateChartSensor30s(data);

  // テーブル表示
  updateTableSensorNow(data);
});


server.on('S_to_C_SENSOR_DAILY', function(data) {
  console.log("[app.js] " + 'S_to_C_SENSOR_DAILY');
  console.log("[app.js] data = " + JSON.stringify(data));

  if(data.ret == false) {
    alert('データがありません。\n\r');
  }

  // グラフ表示
  updateChartSensorDaily(data.value);
});


server.on('S_to_C_TALK_CB', function() {
  console.log("[app.js] " + 'S_to_C_TALK_CB');
//    window.alert('play  ****.wav が完了しました。\n\r');
  recognition.start();
});


//-------------------------------------
/**
 * 30s 間のセンサ値をグラフ表示する。
 * @param {object} obj - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartSensor30s(obj);
*/
function updateChartSensor30s(obj) {
  console.log("[app.js] updateChartSensor30s()");
//  console.log("[app.js] obj = " + JSON.stringify(obj));

  for(let i=0; i<obj.length; i++) {
//    console.log("[app.js] obj[" + i + "].sensor = " + obj[i].sensor);
//    console.log("[app.js] obj[" + i + "].values = " + JSON.stringify(obj[i].values));

    let name = 'obj_' + obj[i].sensor;

    let cnt = 0;
    for(let key in obj[i].values) {
      window[name].data[cnt].label = key;
      window[name].data[cnt].y     = obj[i].values[key];
      cnt++;
    }

    window[name].chart.options.title.text = window[name].title;
    window[name].chart.options.data.dataPoints = window[name].data;
    window[name].chart.render();
  }
}


/**
 * 1 day のセンサ値をグラフ表示する。
 * @param {object} obj - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartSensorDaily(obj);
*/
function updateChartSensorDaily(obj) {
  console.log("[app.js] updateChartSensorDaily()");
//  console.log("[app.js] obj = " + JSON.stringify(obj));

  let name = 'obj_sensors_daily';

  let cnt = 0;
  for(let key in obj) {
    window[name].data[cnt].label = key;
    window[name].data[cnt].y     = obj[key];
    cnt++;
  }

  window[name].chart.options.title.text = window[name].title;
  window[name].chart.options.data.dataPoints = window[name].data;
  window[name].chart.render();
}


/**
 * 現在のセンサ値表示用のテーブルを更新する。
 * @param {object} obj - テーブルに表示するデータ
 * @return {void}
 * @example
 * updateTableSensorNow(obj);
*/
function updateTableSensorNow(obj) {
  console.log("[app.js] updateTableSensorNow()");
//  console.log("[app.js] obj = " + JSON.stringify(obj));

  let data = [];

  for(let i = 0; i < obj.length; i++) {
    let name = 'obj_' + obj[i].sensor;
    let unit = window[name].unit;

    data[i] = {sensor: obj[i].sensor, unit: unit, value: obj[i].values['今']};
  }

//  console.log( "[app.js] data = " + JSON.stringify(data) );
  $('#tabulator-table-10sec').tabulator('setData', data);
  return;
};


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * Get コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendGetCmd('sudo ./board.out --sa_pm');
*/
function sendGetCmd(cmd) {
  console.log("[app.js] sendGetCmd()");
  console.log("[app.js] cmd = " + cmd);

  console.log("[app.js] server.emit(" + 'C_to_S_GET' + ")");
  server.emit('C_to_S_GET', cmd);
}


/**
 * 指定した 1 日の、指定したセンサ値を取得するためのコマンドを送る。
 * @return {void}
 * @example
 * sendGetCmdSensorOneDay();
*/
function sendGetCmdSensorOneDay() {
  console.log("[app.js] sendGetCmdSensorOneDay()");

  let date   = $('#val_date_sensor').val();
  let sensor = $('#val_which').val();
  console.log("[app.js] date   = " + date);
  console.log("[app.js] sensor = " + sensor);

  if(date < '2018-08-01') {
    alert('2018/08/01 以降を指定してください。');
  } else {
    let obj = {date:date, sensor:sensor};
    console.log("[app.js] server.emit(" + 'C_to_S_GET_SENSOR_DAILY' + ")");
    server.emit('C_to_S_GET_SENSOR_DAILY', obj);
  }
}


/**
 * Set コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendSetCmd('sudo ./board.out --relay on');
*/
function sendSetCmd(cmd) {
  console.log("[app.js] sendSetCmd()");
  console.log("[app.js] cmd = " + cmd);

  console.log("[app.js] server.emit(" + 'C_to_S_SET' + ")");
  server.emit('C_to_S_SET', cmd);
}


/**
 * サーボモータを駆動するためのコマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendSetCmdServo(0, 'sudo ./board.out --motorsv ' + 30);
*/
function sendSetCmdServo(tgt, cmd) {
  console.log("[app.js] sendSetCmdServo()");
  console.log("[app.js] tgt = " + tgt);
  console.log("[app.js] cmd = " + cmd);

  let str = '';

  if(tgt == 0) {
    str = $('#val_range00').val();
    console.log("[app.js] str = " + str);
    document.getElementById('val_servo00').innerHTML = str.match(/\d+/); // 数値を表示
  } else if(tgt == 1) {
    str = $('#val_range01').val();
    console.log("[app.js] str = " + str);
    document.getElementById('val_servo01').innerHTML = str.match(/\d+/); // 数値を表示
  } else if(tgt == 2) {
    str = $('#val_range02').val();
    console.log("[app.js] str = " + str);
    document.getElementById('val_servo02').innerHTML = str.match(/\d+/); // 数値を表示
  }

  sendSetCmd(cmd);
}


/**
 * 今日、保存している 1 時間ごとの各センサ値を保存するためのコマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendStore();
*/
function sendStore() {
  console.log("[app.js] sendStore()");
  console.log("[app.js] server.emit(" + 'C_to_S_STORE' + ")");
  server.emit('C_to_S_STORE');
}


/**
 * 撮影している画を回す
 * @param {string} value - 回す角度
 * @return {void}
 * @example
 * rotateScreen(90);
*/
function rotateScreen(which, value) {
  console.log("[app.js] rotateScreen()");
  console.log("[app.js] which = " + which);
  console.log("[app.js] value = " + value);

  document.getElementById('val_rotate').innerHTML = value.match(/\d+/);
  $('#' + which + ' img').rotate({angle:Number(value)});
}


