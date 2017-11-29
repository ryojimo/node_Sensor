/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = "sensor.rp.lfx.sony.co.jp";   // node.js server の IP アドレス
//var sv_ip   = "43.31.78.45";                // node.js server の IP アドレス
var sv_ip   = "192.168.91.123";               // node.js server の IP アドレス
var sv_port = 3000;                           // node.js server の port 番号

var server = io.connect( "http://" + sv_ip + ":" + sv_port ); //ローカル


//-----------------------------------------------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );

  makeChart( "chart_acc_x",   "chart_sensor_acc_x",   "acc_x",   dataPointsLast30s );
  makeChart( "chart_acc_y",   "chart_sensor_acc_y",   "acc_y",   dataPointsLast30s );
  makeChart( "chart_acc_z",   "chart_sensor_acc_z",   "acc_z",   dataPointsLast30s );
  makeChart( "chart_atmos",   "chart_sensor_atmos",   "atmos",   dataPointsLast30s );
  makeChart( "chart_dist",    "chart_sensor_dist",    "dist",    dataPointsLast30s );
  makeChart( "chart_gyro_g1", "chart_sensor_gyro_g1", "gyro_g1", dataPointsLast30s );
  makeChart( "chart_gyro_g2", "chart_sensor_gyro_g2", "gyro_g2", dataPointsLast30s );
  makeChart( "chart_lux",     "chart_sensor_lux",     "lux",     dataPointsLast30s );
  makeChart( "chart_temp",    "chart_sensor_temp",    "temp",    dataPointsLast30s );

  makeChart( "chart_daily",   "chart_sensor_daily",   "",        dataPointsDaily );
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


//-------------------------------------
var chart_acc_x;
var chart_acc_y;
var chart_acc_z;
var chart_atmos;
var chart_dist;
var chart_gyro_g1;
var chart_gyro_g2;
var chart_lux;
var chart_temp;

var chart_daily;

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
 * @param {string} name - グラフを表示する DOM の ID 名
 * @param {string} title - グラフに表示するタイトル
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * makeChart( "chart_temp", "chart_sensor_temp", "temp", data );
*/
function makeChart( chart, name, title, data ){
  console.log( "[app.js] makeChart()" );
  console.log( "[app.js] chart = " + chart );
  console.log( "[app.js] name  = " + name );
  console.log( "[app.js] title = " + title );

  // グローバル変数は window オブジェクトのプロパティなので window[変数] と記述できる
  // ただし makeChart() 関数を呼び出し時に
  // makeChart( "chart_acc_x", .... ) のように変数を文字列で渡す必要がある
  window[chart] = new CanvasJS.Chart(name, {
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
  document.getElementById( "val_sensor_acc_x"   ).innerHTML = obj.acc_x["今"];    // 数値を表示
  document.getElementById( "val_sensor_acc_y"   ).innerHTML = obj.acc_y["今"];    // 数値を表示
  document.getElementById( "val_sensor_acc_z"   ).innerHTML = obj.acc_z["今"];    // 数値を表示

  document.getElementById( "val_sensor_gyro_g1" ).innerHTML = obj.gyro_g1["今"];  // 数値を表示
  document.getElementById( "val_sensor_gyro_g2" ).innerHTML = obj.gyro_g2["今"];  // 数値を表示
  document.getElementById( "val_sensor_dist"    ).innerHTML = obj.dist["今"];     // 数値を表示

  document.getElementById( "val_sensor_atmos"   ).innerHTML = obj.atmos["今"];    // 数値を表示
  document.getElementById( "val_sensor_lux"     ).innerHTML = obj.lux["今"];      // 数値を表示
  document.getElementById( "val_sensor_temp"    ).innerHTML = obj.temp["今"];     // 数値を表示

  updateChartLast30s( "chart_acc_x",   obj.acc_x  );
  updateChartLast30s( "chart_acc_y",   obj.acc_y  );
  updateChartLast30s( "chart_acc_z",   obj.acc_z  );
  updateChartLast30s( "chart_atmos",   obj.atmos  );
  updateChartLast30s( "chart_dist",    obj.dist   );
  updateChartLast30s( "chart_gyro_g1", obj.gyro_g1);
  updateChartLast30s( "chart_gyro_g2", obj.gyro_g2);
  updateChartLast30s( "chart_lux",     obj.lux    );
  updateChartLast30s( "chart_temp",    obj.temp   );

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
    case 'acc_x'  : updateChartDaily( "acc_x",   obj ); break;
    case 'acc_y'  : updateChartDaily( "acc_y",   obj ); break;
    case 'acc_z'  : updateChartDaily( "acc_z",   obj ); break;
    case 'atmos'  : updateChartDaily( "atmos",   obj ); break;
    case 'dist'   : updateChartDaily( "dist",    obj ); break;
    case 'gyro_g1': updateChartDaily( "gyro_g1", obj ); break;
    case 'gyro_g2': updateChartDaily( "gyro_g2", obj ); break;
    case 'lux'    : updateChartDaily( "lux",     obj ); break;
    case 'temp'   : updateChartDaily( "temp",    obj ); break;
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

  chart_daily.options.title.text = title;
  chart_daily.options.data.dataPoints = dataPointsDaily;
  chart_daily.render();
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


