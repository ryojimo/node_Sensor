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

const DataCmnt   = require( './js/DataCmnt' );
const DataPerson = require( './js/DataPerson' );
const DataSensor = require( './js/DataSensor' );
const Docomo     = require( './js/Docomo' );
const PlayMusic  = require( './js/PlayMusic' );


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

var cmnt    = new DataCmnt();

var acc_x   = new DataSensor( 'acc_x'   );
var acc_y   = new DataSensor( 'acc_y'   );
var acc_z   = new DataSensor( 'acc_z'   );
var atmos   = new DataSensor( 'atmos'   );
var dist    = new DataSensor( 'dist'    );
var gyro_g1 = new DataSensor( 'gyro_g1' );
var gyro_g2 = new DataSensor( 'gyro_g2' );
var lux     = new DataSensor( 'lux'     );
var temp    = new DataSensor( 'temp'    );

var docomo  = new Docomo();
var music   = new PlayMusic();
var music_pid = 0;


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

  timerFlg  = setInterval( function(){
                getSensorDataLast30s( "sudo ./board.out sensor" );
              }, 10000 );
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on( 'connection', function( socket ){

  // 切断したときに送信
  socket.on( 'disconnect', function(){
    console.log( "[main.js] " + 'disconnect' );
//  io.sockets.emit("S_to_C_DATA", {value:"user disconnected"});
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

    var file = '/media/pi/USBDATA/' + data.date + '_sensor.txt';

    var ret = false;
    switch( data.sensor )
    {
    case acc_x.name   : ret = acc_x.UpdateDataOneDay( file );   obj = acc_x.dataOneDay;   break;
    case acc_y.name   : ret = acc_y.UpdateDataOneDay( file );   obj = acc_y.dataOneDay;   break;
    case acc_z.name   : ret = acc_z.UpdateDataOneDay( file );   obj = acc_z.dataOneDay;   break;
    case atmos.name   : ret = atmos.UpdateDataOneDay( file );   obj = atmos.dataOneDay;   break;
    case dist.name    : ret = dist.UpdateDataOneDay( file );    obj = dist.dataOneDay;    break;
    case gyro_g1.name : ret = gyro_g1.UpdateDataOneDay( file ); obj = gyro_g1.dataOneDay; break;
    case gyro_g2.name : ret = gyro_g2.UpdateDataOneDay( file ); obj = gyro_g2.dataOneDay; break;
    case lux.name     : ret = lux.UpdateDataOneDay( file );     obj = lux.dataOneDay;     break;
    case temp.name    : ret = temp.UpdateDataOneDay( file );    obj = temp.dataOneDay;    break;
    }

    if( ret == false ){
      io.sockets.emit( 'S_to_C_SENSOR_ONE_DAY', {ret:false, value:JSON.stringify(obj)} );
    } else {
      io.sockets.emit( 'S_to_C_SENSOR_ONE_DAY', {ret:true, value:JSON.stringify(obj)} );
    }
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


  socket.on( 'C_to_S_CMNT', function( data ){
    console.log( "[main.js] " + 'C_to_S_CMNT' );
    console.log( "[main.js] data = " + data );

    var data = { time: hhmmss(), cmnt: data }
    var file = '/media/pi/USBDATA/' + yyyymmdd() + '_cmnt.txt';
    console.log( "[main.js] data.time = " + data.time );
    console.log( "[main.js] data.cmnt = " + data.cmnt );
    console.log( "[main.js] file = " + file );

    cmnt.Update( data );
    cmnt.AppendFile( file );
    var ret = cmnt.ReadFile( file );
  });


  socket.on( 'C_to_S_MUSIC', function( data ){
    console.log( "[main.js] " + 'C_to_S_MUSIC' );

    if( data == 'GET PID' ){
      music.GetPID( function( id ){
        music_pid = id;
        console.log( "[main.js] " + "pid=" + music_pid );
      });
    } else if( data == 'PLAY' ){
      music.Play( 'Coldplay.mp3' );
    } else {
      music.ChangeStatus( data );
    }
  });


  socket.on( 'C_to_S_TALK', function( cmnt ){
    console.log( "[main.js] " + 'C_to_S_TALK' );
    console.log( "[main.js] cmnt = " + cmnt );

    docomo.Update( "nozomi", "hello" );
    docomo.Talk( cmnt, function(){
      io.sockets.emit( 'S_to_C_TALK_CB', {value:true} )
    });
  });


});


/**
 * 全センサの値を取得する
 * @param {string} cmd - 実行するコマンド
 * @return {void}
 * @example
 * getSensorDataLast30s();
*/
function getSensorDataLast30s( cmd ){
  console.log( "[main.js] getSensorDataLast30s()" );
  console.log( "[main.js] cmd = " + cmd );
  var exec = require( 'child_process' ).exec;
  var ret  = exec( cmd,
    function( err, stdout, stderr ){
      console.log( "[main.js] stdout = " + stdout );
      console.log( "[main.js] stderr = " + stderr );
      if(err){
        console.log( "[main.js] " + err );
      }

      var obj = (new Function("return " + stdout))();

      acc_x.UpdateDataLast30s( obj.acc_x );
      acc_y.UpdateDataLast30s( obj.acc_y );
      acc_z.UpdateDataLast30s( obj.acc_z );
      atmos.UpdateDataLast30s( obj.atmos );
      dist.UpdateDataLast30s( obj.dist );
      gyro_g1.UpdateDataLast30s( obj.gyro_g1 );
      gyro_g2.UpdateDataLast30s( obj.gyro_g2 );
      lux.UpdateDataLast30s( obj.lux );
      temp.UpdateDataLast30s( obj.temp );

      var data = { acc_x:0, acc_y:0, acc_z:0, atmos:0, dist:0, gyro_g1:0, gyro_g2:0, lux:0, temp:0 };
      data.acc_x   = acc_x.dataLast30s;
      data.acc_y   = acc_y.dataLast30s;
      data.acc_z   = acc_z.dataLast30s;
      data.atmos   = atmos.dataLast30s;
      data.dist    = dist.dataLast30s;
      data.gyro_g1 = gyro_g1.dataLast30s;
      data.gyro_g2 = gyro_g2.dataLast30s;
      data.lux     = lux.dataLast30s;
      data.temp    = temp.dataLast30s;
      console.log( "[main.js] data = " + JSON.stringify(data) );

      // 加速度センサとジャイロセンサの "10秒前" と" 今" の値に大きな差があるか？をチェック
      var diff_acc_x   = false;
      var diff_acc_y   = false;
      var diff_acc_z   = false;
      var diff_gyro_g1 = false;
      var diff_gyro_g2 = false;

      diff_acc_x   = acc_x.IsLargeDiff();
      diff_acc_y   = acc_y.IsLargeDiff();
      diff_acc_z   = acc_z.IsLargeDiff();
      diff_gyro_g1 = gyro_g1.IsLargeDiff();
      diff_gyro_g2 = gyro_g2.IsLargeDiff();

      var diff_all = false;
      if( diff_acc_x   == true || diff_acc_z   == true ||
          diff_gyro_g1 == true || diff_gyro_g2 == true ){
        diff_all = true;
      }

      console.log( "[main.js] diff_all = " + diff_all );
      io.sockets.emit( 'S_to_C_DATA_LAST30S', {diff:diff_all, value:JSON.stringify(data)} );
  });
}


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits( 8 );
*/
var toDoubleDigits = function( num ){
  console.log( "[main.js] toDoubleDigits()" );
  console.log( "[main.js] num = " + num );
  num += "";
  if( num.length === 1 ){
    num = "0" + num;
  }
  return num;
};


/**
 * 現在の日付を YYYY_MM_DD 形式で取得する
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

  var time = hour + ":" + min + ":" + sec;
  console.log( "[main.js] time = " + time );
  return time;
};
