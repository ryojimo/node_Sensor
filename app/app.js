/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = "sensor.rp.lfx.sony.co.jp";   // node.js server の IP アドレス
//var sv_ip   = "43.31.78.45";                // node.js server の IP アドレス
var sv_ip   = "192.168.91.103";               // node.js server の IP アドレス
var sv_port = 3000;                           // node.js server の port 番号

var server = io.connect( "http://" + sv_ip + ":" + sv_port ); //ローカル


//-----------------------------------------------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );

  makeChart( "obj_sa_acc_x",        "cid_sa_acc_x",        "sa_acc_x",        dataPointsLast30s );
  makeChart( "obj_sa_acc_y",        "cid_sa_acc_y",        "sa_acc_y",        dataPointsLast30s );
  makeChart( "obj_sa_acc_z",        "cid_sa_acc_z",        "sa_acc_z",        dataPointsLast30s );
  makeChart( "obj_sa_gyro_g1",      "cid_sa_gyro_g1",      "sa_gyro_g1",      dataPointsLast30s );
  makeChart( "obj_sa_gyro_g2",      "cid_sa_gyro_g2",      "sa_gyro_g2",      dataPointsLast30s );
  makeChart( "obj_si_bme280_atmos", "cid_si_bme280_atmos", "si_bme280_atmos", dataPointsLast30s );
  makeChart( "obj_si_bme280_humi",  "cid_si_bme280_humi",  "si_bme280_humi",  dataPointsLast30s );
  makeChart( "obj_si_bme280_temp",  "cid_si_bme280_temp",  "si_bme280_temp",  dataPointsLast30s );
  makeChart( "obj_si_gp2y0e03",     "cid_si_gp2y0e03",     "si_gp2y0e03",     dataPointsLast30s );
  makeChart( "obj_si_lps25h_atmos", "cid_si_lps25h_atmos", "si_lps25h_atmos", dataPointsLast30s );
  makeChart( "obj_si_lps25h_temp",  "cid_si_lps25h_temp",  "si_lps25h_temp",  dataPointsLast30s );
  makeChart( "obj_si_tsl2561_lux",  "cid_si_tsl2561_lux",  "si_tsl2561_lux",  dataPointsLast30s );
  makeChart( "obj_sensors_daily",   "cid_sensors_daily",   "",                dataPointsDaily );
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


//-------------------------------------
var obj_sa_acc_x;
var obj_sa_acc_y;
var obj_sa_acc_z;
var obj_sa_gyro_g1;
var obj_sa_gyro_g2;

var obj_si_gp2y0e03;
var obj_si_tsl2561_lux;

var obj_si_bme280_atmos;
var obj_si_bme280_humi;
var obj_si_bme280_temp;

var obj_si_lps25h_atmos;
var obj_si_lps25h_temp;

var obj_sensors_daily;

var dataPointsLast30s = [{ label:"30秒前", y: 0 }, { label:"20秒前", y: 0 }, { label:"10秒前", y: 0 }, { label:"今",     y: 0 }];
var dataPointsDaily   = [{ label: "00-00", y: 0 }, { label: "01-00", y: 0 }, { label: "02-00", y: 0 }, { label: "03-00", y: 0 },
                         { label: "04-00", y: 0 }, { label: "05-00", y: 0 }, { label: "06-00", y: 0 }, { label: "07-00", y: 0 },
                         { label: "08-00", y: 0 }, { label: "09-00", y: 0 }, { label: "10-00", y: 0 }, { label: "11-00", y: 0 },
                         { label: "12-00", y: 0 }, { label: "13-00", y: 0 }, { label: "14-00", y: 0 }, { label: "15-00", y: 0 },
                         { label: "16-00", y: 0 }, { label: "17-00", y: 0 }, { label: "18-00", y: 0 }, { label: "19-00", y: 0 },
                         { label: "20-00", y: 0 }, { label: "21-00", y: 0 }, { label: "22-00", y: 0 }, { label: "23-00", y: 0 }
                        ];


/**
 * グラフ ( チャート ) を作成する。
 * @param {string} chart - 作成するグラフのオブジェクト
 * @param {string} domid - グラフを表示する DOM の ID 名
 * @param {string} title - グラフに表示するタイトル
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * makeChart( "chart_temp", "chart_sensor_temp", "temp", data );
*/
function makeChart( chart, domid, title, data ){
  console.log( "[app.js] makeChart()" );
  console.log( "[app.js] chart = " + chart );
  console.log( "[app.js] domid = " + domid );
  console.log( "[app.js] title = " + title );

  // グローバル変数は window オブジェクトのプロパティなので window[変数] と記述できる
  // ただし makeChart() 関数を呼び出し時に
  // makeChart( "obj_sa_acc_x", .... ) のように変数を文字列で渡す必要がある
  window[chart] = new CanvasJS.Chart(domid, {
    title:{text: title},
    data: [{type: 'area',           // グラフの種類 (area, bar, bubble, column, stackedColumn )
            dataPoints: data        // グラフに描画するデータ
    }]
  });
  window[chart].render();
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on( 'connect', function(){               // 接続時
  console.log( "[app.js] " + 'connected' );
});


server.on( 'disconnect', function( client ){    // 切断時
  console.log( "[app.js] " + 'disconnected' );
});


server.on( 'S_to_C_DATA', function( data ){
  console.log( "[app.js] " + 'S_to_C_DATA' );
  console.log( "[app.js] data = " + data.value );
//  window.alert( "コマンドを送信しました。\n\r" + data.value );

  document.getElementById("val_sensor").innerHTML = data.value; // 数値を表示
});


server.on( 'S_to_C_DATA_LAST30S', function( data ){
  console.log( "[app.js] " + 'S_to_C_DATA_LAST30S' );
//  console.log( "[app.js] data.diff  = " + data.diff );
//  console.log( "[app.js] data.value = " + data.value );

  var obj = (new Function( "return " + data.value ))();
  document.getElementById( "val_sa_acc_x"   ).innerHTML = obj.sa_acc_x["今"];    // 数値を表示
  document.getElementById( "val_sa_acc_y"   ).innerHTML = obj.sa_acc_y["今"];    // 数値を表示
  document.getElementById( "val_sa_acc_z"   ).innerHTML = obj.sa_acc_z["今"];    // 数値を表示
  document.getElementById( "val_sa_gyro_g1" ).innerHTML = obj.sa_gyro_g1["今"];  // 数値を表示
  document.getElementById( "val_sa_gyro_g2" ).innerHTML = obj.sa_gyro_g2["今"];  // 数値を表示

  document.getElementById( "val_si_bme280_atmos" ).innerHTML = obj.si_bme280_atmos["今"];  // 数値を表示
  document.getElementById( "val_si_bme280_humi"  ).innerHTML = obj.si_bme280_humi["今"];   // 数値を表示
  document.getElementById( "val_si_bme280_temp"  ).innerHTML = obj.si_bme280_temp["今"];   // 数値を表示
  document.getElementById( "val_si_gp2y0e03"     ).innerHTML = obj.si_gp2y0e03["今"];      // 数値を表示
  document.getElementById( "val_si_lps25h_atmos" ).innerHTML = obj.si_lps25h_atmos["今"];  // 数値を表示
  document.getElementById( "val_si_lps25h_temp"  ).innerHTML = obj.si_lps25h_temp["今"];   // 数値を表示
  document.getElementById( "val_si_tsl2561_lux"  ).innerHTML = obj.si_tsl2561_lux["今"];   // 数値を表示

  updateChartLast30s( "obj_sa_acc_x",        obj.sa_acc_x  );
  updateChartLast30s( "obj_sa_acc_y",        obj.sa_acc_y  );
  updateChartLast30s( "obj_sa_acc_z",        obj.sa_acc_z  );
  updateChartLast30s( "obj_sa_gyro_g1",      obj.sa_gyro_g1);
  updateChartLast30s( "obj_sa_gyro_g2",      obj.sa_gyro_g2);

  updateChartLast30s( "obj_si_bme280_atmos", obj.si_bme280_atmos);
  updateChartLast30s( "obj_si_bme280_humi",  obj.si_bme280_humi );
  updateChartLast30s( "obj_si_bme280_temp",  obj.si_bme280_temp );
  updateChartLast30s( "obj_si_gp2y0e03",     obj.si_gp2y0e03    );
  updateChartLast30s( "obj_si_lps25h_atmos", obj.si_lps25h_atmos);
  updateChartLast30s( "obj_si_lps25h_temp",  obj.si_lps25h_temp );
  updateChartLast30s( "obj_si_tsl2561_lux",  obj.si_tsl2561_lux );

  if( data.diff == true ){
    var hi = "10秒以上の揺れを検出しました";
    sendTalkData( hi );
  }
});


server.on( 'S_to_C_SENSOR_ONE_DAY', function( data ){
  console.log( "[app.js] " + 'S_to_C_SENSOR_ONE_DAY' );
//  console.log( "[app.js] data = " + data );
  var str = $("#val_which").val();
//  console.log( "[app.js] str = " + str );

  if( data.ret == false ){
    window.alert( "データがありません。\n\r" );
  }

  var obj = (new Function("return " + data.value))();
  switch( str ){
    case 'sa_acc_x'  : updateChartDaily( "sa_acc_x",   obj ); break;
    case 'sa_acc_y'  : updateChartDaily( "sa_acc_y",   obj ); break;
    case 'sa_acc_z'  : updateChartDaily( "sa_acc_z",   obj ); break;
    case 'sa_gyro_g1': updateChartDaily( "sa_gyro_g1", obj ); break;
    case 'sa_gyro_g2': updateChartDaily( "sa_gyro_g2", obj ); break;

    case 'si_bme280_atmos': updateChartDaily( "si_bme280_atmos", obj ); break;
    case 'si_bme280_humi' : updateChartDaily( "si_bme280_humi",  obj ); break;
    case 'si_bme280_temp' : updateChartDaily( "si_bme280_temp",  obj ); break;
    case 'si_gp2y0e03'    : updateChartDaily( "si_gp2y0e03",     obj ); break;
    case 'si_lps25h_atmos': updateChartDaily( "si_lps25h_atmos", obj ); break;
    case 'si_lps25h_temp' : updateChartDaily( "si_lps25h_temp",  obj ); break;
    case 'si_tsl2561_lux' : updateChartDaily( "si_tsl2561_lux",  obj ); break;
    default       : alert( "unknown sensor." ); break;
  }
});


server.on( 'S_to_C_TALK_CB', function(){
  console.log( "[app.js] " + 'S_to_C_TALK_CB' );
//    window.alert( "play  ****.wav が完了しました。\n\r" );
  recognition.start();
});


//-------------------------------------
/**
 * dataPointsLast30s プロパティの値をグラフ表示する。
 * @param {string} chart - 対象のグラフ
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartLast30s( "chart_temp", obj.acc_x );
*/
function updateChartLast30s( chart, data ){
  console.log( "[app.js] updateChartLast30s()" );
  console.log( "[app.js] chart = " + chart );

//  var obj = (new Function("return " + data))();

  var i = 0;
  for( var key in data ){
    dataPointsLast30s[i].label = key;
    dataPointsLast30s[i].y     = data[key];
    i++;
  }

  window[chart].options.data.dataPoints = dataPointsLast30s;
  window[chart].render();
}


/**
 * dataPointsDaily プロパティの値をグラフ表示する。
 * @param {string} title - グラフに表示するタイトル
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartDaily( "temp", obj );
*/
function updateChartDaily( title, data ){
  console.log( "[app.js] updateChartDaily()" );
  console.log( "[app.js] title = " + title );

//  var obj = (new Function("return " + data))();

  var i = 0;
  for( var key in data ){
    dataPointsDaily[i].label = key;
    dataPointsDaily[i].y     = data[key];
    i++;
  }

  obj_sensors_daily.options.title.text = title;
  obj_sensors_daily.options.data.dataPoints = dataPointsDaily;
  obj_sensors_daily.render();
}


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * Get コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendGetCmd( 'sudo ./board.out temp1' );
*/
function sendGetCmd( cmd ){
  console.log( "[app.js] sendGetCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_GET' + ")" );
  server.emit( 'C_to_S_GET', cmd );
}


/**
 * 指定した 1 日の、指定したセンサ値を取得するためのコマンドを送る。
 * @return {void}
 * @example
 * sendGetCmdSensorOneDay();
*/
function sendGetCmdSensorOneDay(){
  console.log( "[app.js] sendGetCmdSensorOneDay()" );

  var date   = $("#val_date").val();
  var sensor = $("#val_which").val();
  console.log( "[app.js] date   = " + date );
  console.log( "[app.js] sensor = " + sensor );

  if( date < "2017-11-30" ){
    alert( "2017/11/30 以降を指定してください。" );
  }

  var obj = { date:date, sensor:sensor };
  console.log( "[app.js] server.emit(" + 'C_to_S_GET_SENSOR_ONE_DAY' + ")" );
  server.emit( 'C_to_S_GET_SENSOR_ONE_DAY', obj );
}


/**
 * Set コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendSetCmd( 'sudo ./board.out relay on' );
*/
function sendSetCmd( cmd ){
  console.log( "[app.js] sendSetCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_SET' + ")" );
  server.emit( 'C_to_S_SET', cmd );
}


/**
 * サーボモータを駆動するためのコマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendSetCmdServo( 'sudo ./board.out motorsv ' + 30 );
*/
function sendSetCmdServo( cmd ){
  console.log( "[app.js] sendSetCmdServo()" );
  console.log( "[app.js] cmd = " + cmd );

  var str = $("#val_range").val();
  console.log( "[app.js] str = " + str );

  document.getElementById("val_servo").innerHTML = str.match( /\d+/ ); // 数値を表示

  sendSetCmd( cmd );
}


/**
 * コメントのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendCmnt();
*/
function sendCmnt(){
  console.log( "[app.js] sendCmnt()" );

  // データをチェック
  var cmnt = document.getElementById( "val_cmnt" );

  var data = cmnt.value;
//  console.log( "[app.js] data=" + data );

  // サーバーへデータを送信
  if( cmnt.value == "" ){
    alert( "ご要望・ご意見を記入してください。" );
  } else{
    console.log( "[app.js] server.emit(" + 'C_to_S_CMNT' + ")" );
    server.emit( 'C_to_S_CMNT', data );
  }

  // データをクリア
  clearCmnt();
}


/**
 * コメントをクリアする
 * @param {void}
 * @return {void}
 * @example
 * clearCmnt();
*/
function clearCmnt(){
  console.log( "[app.js] clearCmnt()" );
  var cmnt = document.getElementById( "val_cmnt" );
  cmnt.value = "";
}


/**
 * Music コマンド ( PLAY, PAUSE, STOP, RESUME ) を送る。
 * @param {string} cmd - 'start'/'stop'
 * @return {void}
 * @example
 * sendMusicCmd( 'PLAY' );
*/
function sendMusicCmd( cmd ){
  console.log( "[app.js] sendMusicCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_MUSIC' + ")" );
  server.emit( 'C_to_S_MUSIC', cmd );
}


/**
 * しゃべる文字データを送る。
 * @param {string} cmnt - しゃべる文字列
 * @return {void}
 * @example
 * sendTalkData( cmnt );
*/
function sendTalkData( cmnt ){
  console.log( "[app.js] sendTalkData()" );
  console.log( "[app.js] cmnt = " + cmnt );

  console.log( "[app.js] server.emit(" + 'C_to_S_TALK' + ")" );
  server.emit( 'C_to_S_TALK', cmnt );
}


/**
 * Mic 入力 / 停止
 * @param {void}
 * @return {void}
 * @example
 * submitMicStart(); / submitMicStop();
*/
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
var recognition = new webkitSpeechRecognition();
recognition.lang = 'ja';


// 録音終了時トリガー
recognition.addEventListener( 'result', function(event){
    var text = event.results.item(0).item(0).transcript;
    console.log( "[app.js] text = " + text );
    $("#val_cmnt").val( text );
}, false );


function submitMicStart(){
  console.log( "[app.js] submitMicStart()" );

  var hi = "ご用件をどうぞ";

  sendTalkData( hi );
//  recognition.start();
}


function submitMicStop(){
  console.log( "[app.js] submitMicStop()" );
  recognition.stop();
}


/**
 * 撮影している画を回す
 * @param {string} value - 回す角度
 * @return {void}
 * @example
 * rotateScreen( 90 );
*/
function rotateScreen( value ){
  console.log( "[app.js] rotateScreen()" );
  console.log( "[app.js] value = " + value );

  document.getElementById( "val_rotate" ).innerHTML = value.match( /\d+/ );
  $("#cam_screen img").rotate( {angle:Number(value)} );
}


