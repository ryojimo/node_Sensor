/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
let http     = require('http');
let socketio = require('socket.io')();
let fs       = require('fs');
let colors   = require('colors');
let schedule = require('node-schedule');
require('date-utils');

const ApiCmn        = require('./js/ApiCmn');
const ApiFileSystem = require('./js/ApiFileSystem');
const DataSensor    = require('./js/DataSensor');


// Ver. 表示
let now = new Date();
console.log("[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow);
console.log("[main.js] " + "ver.01 : app.js".rainbow);

// サーバー・オブジェクトを生成
let server = http.createServer();

// request イベント処理関数をセット
server.on('request', doRequest);

// 待ち受けスタート
const PORT = 3000;
server.listen(process.env.VMC_APP_PORT || PORT);
console.log("[main.js] access to http://localhost:" + PORT);
console.log("[main.js] Server running!");

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch(req.url) {
  case '/':
    fs.readFile('./app/app.html', 'UTF-8', function(err, data) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('File Not Found.');
        res.end();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data);
      res.end();
    });
  break;
  case '/app.js':
    fs.readFile('./app/app.js', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'application/javascript',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data);
      res.end();
    });
  break;
  case '/style.css':
    fs.readFile('./app/style.css', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/css',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data);
      res.end();
    });
  break;
  case '/bg.gif':
    fs.readFile('./app/bg.gif', 'binary', function(err, data) {
      res.writeHead(200, {'Content-Type': 'image/gif',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data, 'binary');
      res.end();
    });
  break;
  case '/jQueryRotate.js':
    fs.readFile('./app/js_lib/jQueryRotate.js', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'application/javascript',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data);
      res.end();
    });
  break;
  case '/capture.jpg':
    fs.readFile('./app/capture.jpg', 'binary', function(err, data) {
      res.writeHead(200, {'Content-Type': 'image/jpg',
                          'Access-Control-Allow-Origin': '*'
                    });
      res.write(data, 'binary');
      res.end();
    });
  break;
  }
}


let io = socketio.listen(server);


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
let g_path_top       = '/home/pi/workspace/node_Sensor/';
let g_path_storage   = '/home/pi/workspace/node_Sensor/data/';
let g_apiCmn        = new ApiCmn();
let g_apiFileSystem = new ApiFileSystem();
let g_sensors       = new Array();

startSystem();

/**
 * システムを開始する。
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log("[main.js] startSystem()");

  g_sensors['si_bmx055_acc_x'] = new DataSensor('si_bmx055_acc_x');
  g_sensors['si_bmx055_acc_y'] = new DataSensor('si_bmx055_acc_y');
  g_sensors['si_bmx055_acc_z'] = new DataSensor('si_bmx055_acc_z');
  g_sensors['si_bmx055_gyro_x'] = new DataSensor('si_bmx055_gyro_x');
  g_sensors['si_bmx055_gyro_y'] = new DataSensor('si_bmx055_gyro_y');
  g_sensors['si_bmx055_gyro_z'] = new DataSensor('si_bmx055_gyro_z');
  g_sensors['si_bmx055_mag_x'] = new DataSensor('si_bmx055_mag_x');
  g_sensors['si_bmx055_mag_y'] = new DataSensor('si_bmx055_mag_y');
  g_sensors['si_bmx055_mag_z'] = new DataSensor('si_bmx055_mag_z');
  g_sensors['si_bme280_atmos'] = new DataSensor('si_bme280_atmos');
  g_sensors['si_bme280_humi'] = new DataSensor('si_bme280_humi');
  g_sensors['si_bme280_temp'] = new DataSensor('si_bme280_temp');
  g_sensors['si_gp2y0e03'] = new DataSensor('si_gp2y0e03');
  g_sensors['si_lps25h_atmos'] = new DataSensor('si_lps25h_atmos');
  g_sensors['si_lps25h_temp'] = new DataSensor('si_lps25h_temp');
  g_sensors['si_tsl2561_lux'] = new DataSensor('si_tsl2561_lux');
  g_sensors['co2'] = new DataSensor('co2');

  // 8 秒ごとに board.out を実行してセンサ値を取得する
  let gb = setInterval(function(){getSensorBoard();}, 8000);

  // 9 秒ごとに CO2 センサ値を取得する
  let gc = setInterval(function(){getSensorCo2();}, 9000);

  // 10 秒ごとにセンサ値を送信する
  let s = setInterval(function(){sendSensorData();}, 10000);

  // 毎日 23:05 にセンサ値をテキストファイルに保存
  let job = schedule.scheduleJob('5 23 * * *', function(){storeSensorData();});
};


/**
 * board.out を実行してセンサ値を取得する。
 * @return {void}
 * @example
 * getSensorBoard();
*/
function getSensorBoard() {
  console.log("[main.js] getSensorBoard()");

  let exec = require('child_process').exec;
  let ret  = exec('sudo ./board.out --sensors', function(err, stdout, stderr) {
    console.log("[main.js] stdout = " + stdout);
    console.log("[main.js] stderr = " + stderr);
    if(err) {
      console.log("[main.js] " + err);
    }

    let jsonObj = (new Function('return ' + stdout))();

    let date = new Date();
    let hour = ('0' + date.getHours()).slice(-2); // 現在の時間を 2 桁表記で取得
    hour = hour + ':00';

    for(key in jsonObj) {
      g_sensors[key].setData1day(hour, jsonObj[key]); // 各センサ・オブジェクトの data1day を更新
      g_sensors[key].setData30s(jsonObj[key]);        // 各センサ・オブジェクトの data30s を更新
    }
  });
}


/**
 * CO2 センサ値を取得する。
 * @return {void}
 * @example
 * getSensorCo2();
*/
function getSensorCo2() {
  console.log("[main.js] getSensorCo2()");

  let exec = require('child_process').exec;
  let ret  = exec('sudo python3 -m mh_z19', function(err, stdout, stderr) {
    console.log("[main.js] stdout = " + stdout);
    console.log("[main.js] stderr = " + stderr);
    if(err) {
      console.log("[main.js] " + err);
    }

    let jsonObj = (new Function('return ' + stdout))();

    if(jsonObj != null) {
      let date = new Date();
      let hour = ('0' + date.getHours()).slice(-2); // 現在の時間を 2 桁表記で取得
      hour = hour + ':00';

      g_sensors['co2'].setData1day(hour, jsonObj['co2']); // CO2 センサ・オブジェクトの data1day を更新
      g_sensors['co2'].setData30s(jsonObj['co2']);        // CO2 センサ・オブジェクトの data30s を更新
    }
  });
}


/**
 * 全センサの値を送信する。
 * @return {void}
 * @example
 * sendSensorData();
*/
function sendSensorData() {
  console.log("[main.js] sendSensorData()");
  // 全センサの 30s 間の値の JSON オブジェクト配列を作成する
  let data = new Array();
  for(key in g_sensors) {
    data.push({sensor: key, values: g_sensors[key].data30s});
  }

  // 送信する
  io.sockets.emit('S_to_C_SENSOR_30S', data);
}


/**
 * センサ値を保存する。
 * @return {void}
 * @example
 * storeSensorData();
*/
function storeSensorData() {
  console.log("[main.js] storeSensorData()");
  writeSensorDataToFile();

  // 全センサ・オブジェクトの 1day の値をクリアする
  for(key in g_sensors) {
    g_sensors[key].clearData1day();
  }
};


/**
 * 全センサの 1day の値の JSON オブジェクト配列を g_path_storage ディレクトリに txt ファイルで保存する。
 * @example
 * writeSensorDataToFile();
*/
function writeSensorDataToFile() {
  console.log("[main.js] writeSensorDataToFile()");

  let filename = g_path_storage + g_apiCmn.yyyymmdd() + '_sensor.json';

  // 既にファイルが存在するかを確認する
  let jsonObj = g_apiFileSystem.read(filename);

  // ファイルが存在する場合は g_sensors を更新する
  if(jsonObj != null) {
    // g_sensors を更新する
    for(let i=0; i<jsonObj.length; i++) {
      let name = jsonObj[i].sensor;
      let value = jsonObj[i].values;

      // 過去の時刻の情報を上書きする
      g_sensors[name].updateData1day(value);
    }
  }

  // ファイルに書き込む
  let data = new Array();
  for(key in g_sensors) {
    data.push({sensor: key, values: g_sensors[key].data1day});
  }

  g_apiFileSystem.write(filename, data);
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on('connection', function(socket) {

  // 切断したときに送信
  socket.on('disconnect', function() {
    console.log("[main.js] " + 'disconnect');
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on('C_to_S_NEW', function(data) {
    console.log("[main.js] " + 'C_to_S_NEW');
  });


  socket.on('C_to_S_DELETE', function(data) {
    console.log("[main.js] " + 'C_to_S_DELETE');
  });


  socket.on('C_to_S_GET', function(data) {
    console.log("[main.js] " + 'C_to_S_GET');
    console.log("[main.js] data = " + data);    // 例) data = sudo ./board.out --si_bme280   --temp

    let exec = require('child_process').exec;
    let ret  = exec(data, function(err, stdout, stderr) {
      console.log("[main.js] stdout = " + stdout);
      console.log("[main.js] stderr = " + stderr);
      if(err) {
        console.log("[main.js] " + err);
      }

      io.sockets.emit('S_to_C_DATA', {value:Number(stdout)});
    });
  });


  socket.on('C_to_S_GET_JSON', function(data) {
    console.log("[main.js] " + 'C_to_S_GET_JSON');
    console.log("[main.js] data = " + data);    // 例) data = sudo python3 -m mh_z19

    let exec = require('child_process').exec;
    let ret  = exec(data, function(err, stdout, stderr) {
      console.log("[main.js] stdout = " + stdout);
      console.log("[main.js] stderr = " + stderr);
      if(err) {
        console.log("[main.js] " + err);
      }

      let obj = (new Function('return ' + stdout))(); // JSON 文字列を JSON オブジェクトへ変換

      let value = 0;
      for(key in obj){
        value = obj[key];
      }
      console.log("[main.js] value = " + value);

      io.sockets.emit('S_to_C_DATA', {value:Number(value)});
    });
  });


  socket.on('C_to_S_GET_SENSOR_DAILY', function(data) {
    console.log("[main.js] " + 'C_to_S_GET_SENSOR_DAILY');
    console.log("[main.js] data.date   = " + data.date);
    console.log("[main.js] data.sensor = " + data.sensor);

    let ret = {};
    let filename = data.date + '_sensor.json';
    let jsonObj = g_apiFileSystem.read(g_path_storage +  filename);
//    let jsonObj = g_apiFileSystem.read(g_path_top + 'data/' +  filename);

    if(jsonObj == null) {
      io.sockets.emit('S_to_C_SENSOR_DAILY', {ret:false, value:null});
    } else {
      for(let i=0; i<jsonObj.length; i++) {
        if(data.sensor == jsonObj[i].sensor) {
          ret = jsonObj[i].values;
          break;
        }
      }
      io.sockets.emit('S_to_C_SENSOR_DAILY', {ret:true, value:ret});
    }
  });


  socket.on('C_to_S_SET', function(data) {
    console.log("[main.js] " + 'C_to_S_SET');
    console.log("[main.js] data = " + data);

    let exec = require('child_process').exec;
    let ret  = exec(data, function( err, stdout, stderr) {
      console.log("[main.js] stdout = " + stdout);
      console.log("[main.js] stderr = " + stderr);
      if(err) {
        console.log("[main.js] " + err);
      }
    });
  });


  socket.on('C_to_S_STORE', function() {
    console.log("[main.js] " + 'C_to_S_STORE');
    // 全センサ・オブジェクトの 1day の値の JSON オブジェクト配列を g_path_storage ディレクトリに txt ファイルとして保存する
    writeSensorDataToFile();
  });


});


