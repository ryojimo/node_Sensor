/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
var http     = require( 'http' );
var socketio = require( 'socket.io' );
var fs       = require( 'fs' );
var colors   = require( 'colors' );
require( 'date-utils' );
var schedule = require( 'node-schedule' );

const DataSensors = require( './js/DataSensors' );
const Docomo      = require( './js/Docomo' );


// Ver. 表示
var now = new Date();
console.log( "[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow );
console.log( "[main.js] " + "ver.01 : app.js".rainbow );
console.log( "[main.js] " + "access to http://localhost:3000" );

// サーバー・オブジェクトを生成
var server = http.createServer();

// request イベント処理関数をセット
server.on( 'request', doRequest );

// 待ち受けスタート
server.listen( process.env.VMC_APP_PORT || 3000 );
console.log( "[main.js] Server running!" );

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch( req.url ){
  case '/':
    fs.readFile( './app/app.html', 'UTF-8',
      function( err, data ){
        if( err ){
          res.writeHead( 404, {'Content-Type': 'text/html'} );
          res.write( 'File Not Found.' );
          res.end();
          return;
        }
        res.writeHead( 200, {'Content-Type': 'text/html',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/app.js':
    fs.readFile( './app/app.js', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'application/javascript',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/style.css':
    fs.readFile( './app/style.css', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'text/css',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/bg.gif':
    fs.readFile( './app/bg.gif', 'binary',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'image/gif',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data, 'binary' );
        res.end();
      }
    );
  break;
  case '/jQueryRotate.js':
    fs.readFile( './app/js_lib/jQueryRotate.js', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'application/javascript',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/tmp/picture.jpg':
    fs.readFile( './tmp/picture.jpg', 'binary',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'image/jpg',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data, 'binary' );
        res.end();
      }
    );
  break;
  }
}


var io = socketio.listen( server );


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
var timerFlg;

var sen_names = [ 'sa_acc_x', 'sa_acc_y', 'sa_acc_z',
                  'sa_gyro_g1', 'sa_gyro_g2',
                  'si_bme280_atmos', 'si_bme280_humi', 'si_bme280_temp',
                  'si_gp2y0e03',
                  'si_lps25h_atmos', 'si_lps25h_temp',
                  'si_tsl2561_lux'
                ];
var sensors = new DataSensors();

var docomo  = new Docomo();


startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log( "[main.js] startSystem()" );

  var job01;
  var job02;
  var job03;

  sensors.InitData30s( sen_names );

  timerFlg  = setInterval( function(){
                getSensorData30s( 'sudo ./board.out sensors' );
              }, 10000 );

  job01 = runBoard(       '30 7      * * *', 'sudo ./board.out relay on'  );
  job02 = runBoard(       '45 7      * * *', 'sudo ./board.out relay off' );
  job03 = runBoardSensor( ' 0 0-23/1 * * *', 'sudo ./board.out sensors'   );
};


/**
 * node-schedule の Job を登録する
 * @param {string} when - Job を実行する時間
 * @param {string} cmd - 実行するコマンド
 * @return {object} job - node-schedule に登録した job
 * @example
 * runBoard( '30 7 * * *', 'sudo ./board.out relay on' );
*/
function runBoard( when, cmd ) {
  console.log( "[main.js] runBoard()" );
  console.log( "[main.js] when = " + when );
  console.log( "[main.js] cmd  = " + cmd );

  var job = schedule.scheduleJob(when, function(){
    console.log( "[main.js] node-schedule で " + cmd + "が実行されました" );

    var exec = require( 'child_process' ).exec;
    var ret  = exec( cmd,
      function( err, stdout, stderr ){
        console.log( "[main.js] stdout = " + stdout );
        console.log( "[main.js] stderr = " + stderr );
        if( err ){
          console.log( "[main.js] " + err );
        }
      }
    );
  });

  return job;
};


/**
 * node-schedule の Job を登録する
 * @param {string} when - Job を実行する時間
 * @param {string} cmd - 実行するコマンド
 * @return {object} job - node-schedule に登録した job
 * @example
 * runBoard( '30 7 * * *', "sudo ./board.out relay on" );
*/
function runBoardSensor( when, cmd ) {
  console.log( "[main.js] runBoardSensor()" );
  console.log( "[main.js] when = " + when );
  console.log( "[main.js] cmd  = " + cmd );

  var job = schedule.scheduleJob(when, function(){
    console.log( "[main.js] node-schedule で " + cmd + "が実行されました" );

    var exec = require( 'child_process' ).exec;
    var ret  = exec( cmd,
      function( err, stdout, stderr ){
        console.log( "[main.js] stdout = " + stdout );
        console.log( "[main.js] stderr = " + stderr );
        if( err ){
          console.log( "[main.js] " + err );
        }

        var jsonObj = (new Function( 'return ' + stdout ))();
        var hour = hhmmss().substr(0,5);      // hh:mm:ss から hh:mm を取り出して hour にセット
        console.log( "[main.js] " + hour );
        sensors.CreateMDDoc( yyyymmdd(), hour, jsonObj );
      }
    );
  });

  return job;
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on( 'connection', function( socket ){

  // 切断したときに送信
  socket.on( 'disconnect', function(){
    console.log( "[main.js] " + 'disconnect' );
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on( 'C_to_S_NEW', function( data ){
    console.log( "[main.js] " + 'C_to_S_NEW' );
  });


  socket.on( 'C_to_S_DELETE', function( data ){
    console.log( "[main.js] " + 'C_to_S_DELETE' );
  });


  socket.on( 'C_to_S_GET', function( data ){
    console.log( "[main.js] " + 'C_to_S_GET' );
    console.log( "[main.js] data = " + data );

    var exec = require( 'child_process' ).exec;
    var ret  = exec( data,
      function( err, stdout, stderr ){
        console.log( "[main.js] stdout = " + stdout );
        console.log( "[main.js] stderr = " + stderr );
        if( err ){
          console.log( "[main.js] " + err );
        }

        io.sockets.emit( 'S_to_C_DATA', {value:stdout} );
    });
  });


  socket.on( 'C_to_S_GET_SENSOR_ONE_DAY', function( data ){
    console.log( "[main.js] " + 'C_to_S_GET_SENSOR_ONE_DAY' );
    console.log( "[main.js] data.date   = " + data.date );
    console.log( "[main.js] data.sensor = " + data.sensor );

    sensors.GetMDDocDataOneDay( data.date, data.sensor, function( err, data ){
//      console.log( data );
      io.sockets.emit( 'S_to_C_SENSOR_ONE_DAY', {ret:err, value:data} );
    });
  });


  socket.on( 'C_to_S_SET', function( data ){
    console.log( "[main.js] " + 'C_to_S_SET' );
    console.log( "[main.js] data = " + data );

    var exec = require( 'child_process' ).exec;
    var ret  = exec( data,
      function( err, stdout, stderr ){
        console.log( "[main.js] stdout = " + stdout );
        console.log( "[main.js] stderr = " + stderr );
        if( err ){
          console.log( "[main.js] " + err );
        }
      });
  });


  socket.on( 'C_to_S_TALK', function( cmnt ){
    console.log( "[main.js] " + 'C_to_S_TALK' );
    console.log( "[main.js] cmnt = " + cmnt );

    docomo.Update( 'nozomi', 'hello' );
    docomo.Talk( cmnt, function(){
      io.sockets.emit( 'S_to_C_TALK_CB', {value:true} )
    });
  });


  socket.on( 'C_to_S_TALK_W_NAME', function( data ){
    console.log( "[main.js] " + 'C_to_S_TALK_W_NAME' );
    console.log( "[main.js] data = " + data );
    console.log( "[main.js] data.talker = " + data.talker );
    console.log( "[main.js] data.cmnt   = " + data.cmnt );

    docomo.Update( data.talker , 'hello' );
    docomo.Talk( data.cmnt, function(){
    });
  });


});


/**
 * 全センサの値を取得する
 * @param {string} cmd - 実行するコマンド
 * @return {void}
 * @example
 * getSensorData30s();
*/
function getSensorData30s( cmd ){
  console.log( "[main.js] getSensorData30s()" );
  console.log( "[main.js] cmd = " + cmd );
  var exec = require( 'child_process' ).exec;
  var ret  = exec( cmd,
    function( err, stdout, stderr ){
      console.log( "[main.js] stdout = " + stdout );
      console.log( "[main.js] stderr = " + stderr );
      if(err){
        console.log( "[main.js] " + err );
      }

      var jsonObj = (new Function( 'return ' + stdout ))();
      var data = sensors.UpdateData30s( jsonObj );
      console.log( "[main.js] data = " + JSON.stringify(data) );

      // 加速度センサとジャイロセンサの "10秒前" と" 今" の値に大きな差があるか？をチェック
      var diff_sa_acc_x   = sensors.IsLargeDiff( 'sa_acc_x' );
      var diff_sa_acc_y   = sensors.IsLargeDiff( 'sa_acc_y' );
      var diff_sa_acc_z   = sensors.IsLargeDiff( 'sa_acc_z' );
      var diff_sa_gyro_g1 = sensors.IsLargeDiff( 'sa_gyro_g1' );
      var diff_sa_gyro_g2 = sensors.IsLargeDiff( 'sa_gyro_g2' );

      var diff_all = false;
      if( diff_sa_acc_x   == true || diff_sa_acc_z   == true ||
          diff_sa_gyro_g1 == true || diff_sa_gyro_g2 == true ){
        diff_all = true;
        console.log( "10秒前の値と今の値が 500 以上差があります。" );
      } else {
        console.log( "10秒前の値と今の値が 500 以上差がありません。" );
      }

      console.log( "[main.js] diff_all = " + diff_all );
      io.sockets.emit( 'S_to_C_DATA_LAST30S', {diff:diff_all, value:data} );
    }
  );
}


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits( 8 );
*/
var toDoubleDigits = function( num ){
//  console.log( "[main.js] toDoubleDigits()" );
//  console.log( "[main.js] num = " + num );
  num += '';
  if( num.length === 1 ){
    num = '0' + num;
  }
  return num;
};


/**
 * 現在の日付を YYYY-MM-DD 形式で取得する
 * @param {void}
 * @return {string} day - 日付
 * @example
 * yyyymmdd();
*/
var yyyymmdd = function(){
  console.log( "[main.js] yyyymmdd()" );
  var date = new Date();

  var yyyy = date.getFullYear();
  var mm   = toDoubleDigits( date.getMonth() + 1 );
  var dd   = toDoubleDigits( date.getDate() );

  var day = yyyy + '-' + mm + '-' + dd;
  console.log( "[main.js] day = " + day );
  return day;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
var hhmmss = function(){
  console.log( "[main.js] hhmmss()" );
  var date = new Date();

  var hour = toDoubleDigits( date.getHours() );
  var min  = toDoubleDigits( date.getMinutes() );
  var sec  = toDoubleDigits( date.getSeconds() );

  var time = hour + ':' + min + ':' + sec;
  console.log( "[main.js] time = " + time );
  return time;
};


