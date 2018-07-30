/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = 'sensor.rp.lfx.sony.co.jp';   // node.js server の IP アドレス
//var sv_ip   = '43.31.78.45';                // node.js server の IP アドレス
var sv_ip   = '192.168.91.11';                // node.js server の IP アドレス
var sv_port = 3000;                           // node.js server の port 番号

var server = io.connect( 'http://' + sv_ip + ':' + sv_port ); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
var obj_sa_acc_x        = {chart:null, data:null, type:'area', color:'#E64A19', title:'加速度(x)',    unit:'[?]'};
var obj_sa_acc_y        = {chart:null, data:null, type:'area', color:'#E64A19', title:'加速度(y)',    unit:'[?]'};
var obj_sa_acc_z        = {chart:null, data:null, type:'area', color:'#E64A19', title:'加速度(z)',    unit:'[?]'};
var obj_sa_gyro_g1      = {chart:null, data:null, type:'area', color:'#FFA000', title:'ジャイロ(g1)', unit:'[?]'};
var obj_sa_gyro_g2      = {chart:null, data:null, type:'area', color:'#FFA000', title:'ジャイロ(g2)', unit:'[?]'};

var obj_si_bme280_atmos = {chart:null, data:null, type:'area', color:'#1976D2', title:'気圧(bme280)', unit:'[hPa]'};
var obj_si_bme280_humi  = {chart:null, data:null, type:'area', color:'#00796B', title:'湿度(bme280)', unit:'[%]'};
var obj_si_bme280_temp  = {chart:null, data:null, type:'area', color:'#C2185B', title:'温度(bme280)', unit:'[℃]'};
var obj_si_gp2y0e03     = {chart:null, data:null, type:'area', color:'#455A64', title:'距離(gp2y0e03)', unit:'[cm]'};
var obj_si_lps25h_atmos = {chart:null, data:null, type:'area', color:'#1976D2', title:'気圧(lps25h)', unit:'[hPa]'};
var obj_si_lps25h_temp  = {chart:null, data:null, type:'area', color:'#C2185B', title:'温度(lps25h)', unit:'[℃]'};
var obj_si_tsl2561_lux  = {chart:null, data:null, type:'area', color:'#AFB42B', title:'照度(tsl2561)', unit:'[LUX]'};

var obj_sensors_daily   = {chart:null, data:null, type:'area', color:'#1E88E5', title:'一日のデータ', unit:''};


// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );

  obj_sa_acc_x        = makeChartSensor30s( 'cid_sa_acc_x',        obj_sa_acc_x        );
  obj_sa_acc_y        = makeChartSensor30s( 'cid_sa_acc_y',        obj_sa_acc_y        );
  obj_sa_acc_z        = makeChartSensor30s( 'cid_sa_acc_z',        obj_sa_acc_z        );
  obj_sa_gyro_g1      = makeChartSensor30s( 'cid_sa_gyro_g1',      obj_sa_gyro_g1      );
  obj_sa_gyro_g2      = makeChartSensor30s( 'cid_sa_gyro_g2',      obj_sa_gyro_g2      );
  obj_si_bme280_atmos = makeChartSensor30s( 'cid_si_bme280_atmos', obj_si_bme280_atmos );
  obj_si_bme280_humi  = makeChartSensor30s( 'cid_si_bme280_humi',  obj_si_bme280_humi  );
  obj_si_bme280_temp  = makeChartSensor30s( 'cid_si_bme280_temp',  obj_si_bme280_temp  );
  obj_si_gp2y0e03     = makeChartSensor30s( 'cid_si_gp2y0e03',     obj_si_gp2y0e03     );
  obj_si_lps25h_atmos = makeChartSensor30s( 'cid_si_lps25h_atmos', obj_si_lps25h_atmos );
  obj_si_lps25h_temp  = makeChartSensor30s( 'cid_si_lps25h_temp',  obj_si_lps25h_temp  );
  obj_si_tsl2561_lux  = makeChartSensor30s( 'cid_si_tsl2561_lux',  obj_si_tsl2561_lux  );
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

  obj_sensors_daily   = makeChartDaily( 'cid_sensors_daily', obj_sensors_daily );
  obj_sensors_daily.chart.render();
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


/**
 * 30sec のデータを表示するグラフ ( チャート ) を作成する。
 * @param {string} domid - グラフを表示する DOM の ID 名
 * @param {object} obj - グラフ化する対象のオブジェクト
 * @return {object} chart - 作成するグラフのオブジェクトとデータ
 * @example
 * makeChartSensor30s( 'cid_sa_acc_x', obj_sa_acc_x );
*/
function makeChartSensor30s( domid, obj ){
  console.log( "[app.js] makeChartSensor30s()" );
  console.log( "[app.js] domid = " + domid );

  var data = new Array({label:'30秒前', y:0}, {label:'20秒前', y:0}, {label:'10秒前', y:0}, {label:'今', y:0});

  var chart = new CanvasJS.Chart(domid, {
    animationEnabled: true,
    animationDuration: 2000,
    title:{text: obj.title,
           fontColor: '#222',
           fontSize: 16,
    },
    subtitles:[{text: '単位: ' + obj.unit,
                fontColor: '#555',
                fontSize: 12,
               }
    ],
    axisX: { labelAngle:-45, labelFontSize:14, labelFontColor:'#222' },
    axisY: { labelFontSize:14, labelFontColor:'#222' },
    data: [{type: obj.type,           // グラフの種類 (area, bar, bubble, column, stackedColumn )
            color: obj.color,
            cursor: 'pointer',
            dataPoints: data        // グラフに描画するデータ
    }]
  });

  return {chart:chart, data:data};
};


/**
 * 1 day のデータを表示するグラフ ( チャート ) を作成する。
 * @param {string} domid - グラフを表示する DOM の ID 名
 * @param {object} obj - グラフ化する対象のオブジェクト
 * @return {string} chart - 作成するグラフのオブジェクトとデータ
 * @example
 * makeChartDaily( 'cid_sensors_daily', obj_sensors_daily );
*/
function makeChartDaily( domid, obj ){
  console.log( "[app.js] makeChartDaily()" );
  console.log( "[app.js] domid = " + domid );

  var data = new Array({label:'00-00', y:0}, {label:'01-00', y:0}, {label:'02-00', y:0}, {label:'03-00', y:0},
                       {label:'04-00', y:0}, {label:'05-00', y:0}, {label:'06-00', y:0}, {label:'07-00', y:0},
                       {label:'08-00', y:0}, {label:'09-00', y:0}, {label:'10-00', y:0}, {label:'11-00', y:0},
                       {label:'12-00', y:0}, {label:'13-00', y:0}, {label:'14-00', y:0}, {label:'15-00', y:0},
                       {label:'16-00', y:0}, {label:'17-00', y:0}, {label:'18-00', y:0}, {label:'19-00', y:0},
                       {label:'20-00', y:0}, {label:'21-00', y:0}, {label:'22-00', y:0}, {label:'23-00', y:0}
                      );

  var chart = new CanvasJS.Chart(domid, {
    animationEnabled: true,
    animationDuration: 2000,
    title:{text: obj.title,
           fontColor: '#222',
           fontSize: 16,
    },
    subtitles:[{text: '単位: ' + obj.unit,
                fontColor: '#555',
                fontSize: 12,
               }
    ],
    axisX: { labelAngle:-45, labelFontSize:14, labelFontColor:'#222' },
    axisY: { labelFontSize:14, labelFontColor:'#222' },
    data: [{type: obj.type,           // グラフの種類 (area, bar, bubble, column, stackedColumn )
            color: obj.color,
            cursor: 'pointer',
            dataPoints: data        // グラフに描画するデータ
    }]
  });

  return {chart:chart, data:data};
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
//  window.alert( 'コマンドを送信しました。\n\r' + data.value );

  document.getElementById('val_sensor').innerHTML = data.value; // 数値を表示
});


server.on( 'S_to_C_DATA_LAST30S', function( data ){
  console.log( "[app.js] " + 'S_to_C_DATA_LAST30S' );
  console.log( "[app.js] data.diff  = " + data.diff );
  console.log( "[app.js] data.value = " + JSON.stringify(data.value) );

//  var obj = [];
//  obj = (new Function( 'return ' + data.value ))();

  for( var i=0; i<data.value.length; i++ ){
    var name;
    console.log( "[app.js] data.value[ " + i + " ].sensor = " + data.value[i].sensor );

    // 今の値を表示
    name = 'val_' + data.value[i].sensor;
    document.getElementById( name ).innerHTML = data.value[i].values['今'];

    // グラフ表示
    name = 'obj_' + data.value[i].sensor;
    updateChartLast30s( name, data.value[i].values );
  }

  if( data.diff == true ){
    var hi = '10秒以上の揺れを検出しました';
    sendTalkData( hi );
  }
});


server.on( 'S_to_C_SENSOR_ONE_DAY', function( data ){
  console.log( "[app.js] " + 'S_to_C_SENSOR_ONE_DAY' );
//  console.log( "[app.js] data = " + JSON.stringify(data.value) );

  if( data.ret == false ){
    alert( 'データがありません。\n\r' );
  }

  updateChartDaily( obj_sensors_daily, data.value );
});


server.on( 'S_to_C_TALK_CB', function(){
  console.log( "[app.js] " + 'S_to_C_TALK_CB' );
//    window.alert( 'play  ****.wav が完了しました。\n\r' );
  recognition.start();
});


//-------------------------------------
/**
 * 30s 間のセンサ値をグラフ表示する。
 * @param {string} chart - 対象のグラフ
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartLast30s( 'chart_temp', obj.acc_x );
*/
function updateChartLast30s( chart, data ){
  console.log( "[app.js] updateChartLast30s()" );
  console.log( "[app.js] chart = " + chart );

//  var obj = (new Function('return ' + data))();

  var i = 0;
  for( var key in data ){
    window[chart].data[i].label = key;
    window[chart].data[i].y     = data[key];
    i++;
  }

  window[chart].chart.options.data.dataPoints = window[chart].data;
  window[chart].chart.render();
}


/**
 * 1 day のセンサ値をグラフ表示する。
 * @param {object} obj_chart - 対象の chart オブジェクト
 * @param {object} data - グラフに表示するデータ
 * @return {void}
 * @example
 * updateChartDaily( 'temp', obj );
*/
function updateChartDaily( obj_chart, data ){
  console.log( "[app.js] updateChartDaily()" );

//  var obj = (new Function('return ' + data))();

  var i = 0;
  for( var key in data ){
    obj_chart.data[i].label = key;
    obj_chart.data[i].y     = data[key];
    i++;
  }

  obj_chart.chart.options.title.text = obj_chart.title;
  obj_chart.chart.options.data.dataPoints = obj_sensors_daily.data;
  obj_chart.chart.render();
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

  var date   = $('#val_date_sensor').val();
  var sensor = $('#val_which').val();
  console.log( "[app.js] date   = " + date );
  console.log( "[app.js] sensor = " + sensor );

  if( date < '2018-05-25' ){
    alert( '2018/05/25 以降を指定してください。' );
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

  var str = $('#val_range').val();
  console.log( "[app.js] str = " + str );

  document.getElementById('val_servo').innerHTML = str.match( /\d+/ ); // 数値を表示

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
  var cmnt = document.getElementById( 'val_cmnt' );
//  console.log( "[app.js] cmnt.value =" + cmnt.value );

  // サーバーへデータを送信
  if( cmnt.value == '' ){
    alert( 'ご要望・ご意見を記入してください。' );
  } else{
    console.log( "[app.js] server.emit(" + 'C_to_S_CMNT' + ")" );
    server.emit( 'C_to_S_CMNT', cmnt.value );
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
  var cmnt = document.getElementById( 'val_cmnt' );
  cmnt.value = '';
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
    $('#val_cmnt').val( text );
}, false );


function submitMicStart(){
  console.log( "[app.js] submitMicStart()" );

  var hi = 'ご用件をどうぞ';

  sendTalkData( hi );
//  recognition.start();
}


function submitMicStop(){
  console.log( "[app.js] submitMicStop()" );
  recognition.stop();
}


/**
 * トークのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendTalk();
*/
function sendTalk(){
  console.log( "[app.js] sendTalk()" );

  var talker = $('#val_talker').val();
  var cmnt   = $('#val_talk').val();
  console.log( "[app.js] talker = " + talker );
  console.log( "[app.js] cmnt   = " + cmnt );

  // サーバーへデータを送信
  if( cmnt == '' ){
    alert( '話す内容を記入してください。' );
  } else{
    var obj = { talker:talker, cmnt:cmnt };
    console.log( "[app.js] server.emit(" + 'C_to_S_TALK_W_NAME' + ")" );
    server.emit( 'C_to_S_TALK_W_NAME', obj );
  }
}


/**
 * 撮影している画を回す
 * @param {string} value - 回す角度
 * @return {void}
 * @example
 * rotateScreen( 90 );
*/
function rotateScreen( which, value ){
  console.log( "[app.js] rotateScreen()" );
  console.log( "[app.js] which = " + which );
  console.log( "[app.js] value = " + value );

  document.getElementById( 'val_rotate' ).innerHTML = value.match( /\d+/ );
  $( '#' + which + ' img').rotate( {angle:Number(value)} );
}


