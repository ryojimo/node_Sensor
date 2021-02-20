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

//const ApiAws        = require('./js/ApiAws');
const ApiCmn        = require('./js/ApiCmn');
//const ApiDocomo     = require('./js/ApiDocomo');
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
//let g_path_top     = '/home/ec2-user/workspace/node_Sensor/';
//let g_path_storage = '/home/ec2-user/workspace/node_Sensor/';
//let g_path_storage = '/media/pi/USBDATA/sensor/';
//let g_aws_key        = './data/aws_rootkey_bt.json';
//let g_aws_region     = 'ap-northeast-1';
//let g_aws_s3_sensor  = 'uz.sensor.2020';

//let g_apiAws        = new ApiAws(g_aws_key, g_aws_region);
let g_apiCmn        = new ApiCmn();
//let g_apiDocomo     = new ApiDocomo();
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

  createSensorObjects();

  let timerFlg  = setInterval(function(){getSensorData30s();}, 10000);

  let job01 = runBoard(      '30  7      * * *', 'sudo ./board.out --relay --on' );
  let job02 = runBoard(      '31  7      * * *', 'sudo ./board.out --relay --off');
  let job03 = runBoard(      ' 0  8      * * *', 'sudo ./board.out --relay --on' );
  let job04 = runBoard(      ' 1  8      * * *', 'sudo ./board.out --relay --off');
  let job05 = runBoardSensor(' 0  0-23/1 * * *', 'sudo ./board.out --sensors'  );
  let job06 = runBoardSensorStore(' 5  23     * * *'                                );
};


/**
 * 全センサのオブジェクトを生成して、オブジェクト配列 g_sensors[] へセットする。
 * @param {void}
 * @return {void}
 * @example
 * createSensorObjects();
*/
function createSensorObjects() {
  console.log("[main.js] createSensorObjects()");
  g_sensors['sa_acc_x'] = new DataSensor('sa_acc_x');
  g_sensors['sa_acc_y'] = new DataSensor('sa_acc_y');
  g_sensors['sa_acc_z'] = new DataSensor('sa_acc_z');

  g_sensors['sa_gyro_g1'] = new DataSensor('sa_gyro_g1');
  g_sensors['sa_gyro_g2'] = new DataSensor('sa_gyro_g2');

  g_sensors['si_bme280_atmos'] = new DataSensor('si_bme280_atmos');
  g_sensors['si_bme280_humi'] = new DataSensor('si_bme280_humi');
  g_sensors['si_bme280_temp'] = new DataSensor('si_bme280_temp');

  g_sensors['si_gp2y0e03'] = new DataSensor('si_gp2y0e03');

  g_sensors['si_lps25h_atmos'] = new DataSensor('si_lps25h_atmos');
  g_sensors['si_lps25h_temp'] = new DataSensor('si_lps25h_temp');

  g_sensors['si_tsl2561_lux'] = new DataSensor('si_tsl2561_lux');
}


/**
 * 全センサの値を取得して 30s 間のデータを更新する。
 * @return {void}
 * @example
 * getSensorData30s();
*/
function getSensorData30s() {
  console.log("[main.js] getSensorData30s()");

  let cmd = 'sudo ./board.out --sensors';
  let exec = require('child_process').exec;
  let ret  = exec(cmd, function(err, stdout, stderr) {
    console.log("[main.js] stdout = " + stdout);
    console.log("[main.js] stderr = " + stderr);
    if(err) {
      console.log("[main.js] " + err);
    }

    let jsonObj = (new Function('return ' + stdout))();

    // 各センサ・オブジェクトの data30s を更新する
    for(key in jsonObj) {
      g_sensors[key].setData30s(jsonObj[key]);
    }

    // 全センサの 30s 間の値の JSON オブジェクト配列を作成する
    let data = new Array();
    for(key in g_sensors) {
      data.push({sensor: key, values: g_sensors[key].data30s});
    }

    // data を送る
    io.sockets.emit('S_to_C_SENSOR_30S', data);

    // "10秒前" と" 今" の値に大きな差があるか？をチェックする
    let diff = checkDiff();
    if(diff == true) {
      talkAlert();
    }
  });
}


/**
 * 加速度センサとジャイロセンサの "10秒前" と" 今" の値に大きな差があるか？をチェックする。
 * @return {bool} ret - 大きな差があればれ true を返す
 * @example
 * checkDiff();
*/
function checkDiff() {
  console.log("[main.js] checkDiff()");
  let ret = false;

  let diff_sa_acc_x   = g_sensors['sa_acc_x'  ].isLarge();
  let diff_sa_acc_y   = g_sensors['sa_acc_y'  ].isLarge();
  let diff_sa_acc_z   = g_sensors['sa_acc_z'  ].isLarge();
  let diff_sa_gyro_g1 = g_sensors['sa_gyro_g1'].isLarge();
  let diff_sa_gyro_g2 = g_sensors['sa_gyro_g2'].isLarge();

  if(diff_sa_acc_x == true || diff_sa_acc_z == true || diff_sa_gyro_g1 == true || diff_sa_gyro_g2 == true) {
    ret = true;
  } else {
    ret = false;
  }

  return ret;
}


/**
 * cmnt の内容を話す。
 * @return {void}
 * @example
 * talkAlert();
*/
function talkAlert() {
  console.log("[main.js] talkAlert()");
  let cmnt = '10秒以上の揺れを検出しました';

//  g_apiDocomo.update('nozomi', 'hello');
//  g_apiDocomo.talk(cmnt, function() {
//    io.sockets.emit('S_to_C_TALK_CB', {value:true})
//  });
}


/**
 * node-schedule の Job を登録する。
 * @param {string} when - Job を実行する時間
 * @param {string} cmd - 実行するコマンド
 * @return {object} job - node-schedule に登録した job
 * @example
 * runBoard( '30 7 * * *', 'sudo ./board.out --relay on');
*/
function runBoard(when, cmd) {
  console.log("[main.js] runBoard()");
  console.log("[main.js] when = " + when);
  console.log("[main.js] cmd  = " + cmd);

  let job = schedule.scheduleJob(when, function() {
    console.log("[main.js] node-schedule で " + cmd + "が実行されました");

    let exec = require('child_process').exec;
    let ret  = exec(cmd, function(err, stdout, stderr) {
        console.log("[main.js] stdout = " + stdout);
        console.log("[main.js] stderr = " + stderr);
        if(err) {
          console.log("[main.js] " + err);
        }
      }
    );
  });

  return job;
};


/**
 * node-schedule の Job を登録する。
 * @param {string} when - Job を実行する時間
 * @param {string} cmd - 実行するコマンド
 * @return {object} job - node-schedule に登録した job
 * @example
 * runBoardSensor( ' 0 0-23/1 * * *', 'sudo ./board.out --sensors');
*/
function runBoardSensor(when, cmd) {
  console.log("[main.js] runBoardSensor()");
  console.log("[main.js] when = " + when);
  console.log("[main.js] cmd  = " + cmd);

  let job = schedule.scheduleJob(when, function() {
    console.log("[main.js] node-schedule で " + cmd + " が実行されました");

    let exec = require('child_process').exec;
    let ret  = exec(cmd, function(err, stdout, stderr) {
        console.log("[main.js] stdout = " + stdout);
        console.log("[main.js] stderr = " + stderr);
        if(err) {
          console.log("[main.js] " + err);
        }

        // stdout の文字列は以下のような感じ
        // { "sa_acc_x":2019, "sa_acc_y":2854,"sa_acc_z":1934, "sa_gyro_g1":1783, "sa_gyro_g2":1771, "si_bme280_atmos":718.53, "si_bme280_humi":38.84, "si_bme280_temp":29.82, "si_gp2y0e03":63.00, "si_lps25h_atmos":1018.34, "si_lps25h_temp":30.42, "si_tsl2561_lux":57.00 }
        let jsonObj = (new Function( 'return ' + stdout))();
        let date = new Date();
        let hour = ('0' + date.getHours()).slice(-2); // 現在の時間を 2 桁表記で取得
        hour = hour + ':00';

        for(key in jsonObj) {
          g_sensors[key].setData1day(hour, jsonObj[key]);
        }
      }
    );
  });

  return job;
};


/**
 * node-schedule の Job を登録する。
 * @param {string} when - Job を実行する時間
 * @return {object} job - node-schedule に登録した job
 * @example
 * runBoardSensorStore(' 5  23     * * *');
*/
function runBoardSensorStore(when) {
  console.log("[main.js] runBoardSensorStore()");
  console.log("[main.js] when = " + when);

  let job = schedule.scheduleJob(when, function() {
    console.log("[main.js] node-schedule で fs.writeFileSync() が実行されました");

    // 全センサ・オブジェクトの 1day の値の JSON オブジェクト配列を g_path_storage ディレクトリに txt ファイルとして保存する
    storeSensorObjects();
    uploadSensorObjects();

    // 全センサ・オブジェクトの 1day の値をクリアする
    clearSensorObjects();
  });

  return job;
};


/**
 * 全センサの 1day の値の JSON オブジェクト配列を g_path_storage ディレクトリに txt ファイルで保存する。
 * @example
 * storeSensorObjects();
*/
function storeSensorObjects() {
  console.log("[main.js] storeSensorObjects()");

  let filename = g_apiCmn.yyyymmdd() + '_sensor.json';

  // 既にファイルが存在するかを確認する
  let jsonObj = g_apiFileSystem.read(g_path_storage +  filename);

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

  g_apiFileSystem.write(g_path_storage +  filename, data);
};


/**
 * 全センサの 1day の値を AWS S3 へ upload する。
 * @example
 * uploadSensorObjects();
*/
function uploadSensorObjects() {
  console.log("[main.js] uploadSensorObjects()");

  let filename = g_apiCmn.yyyymmdd() + '_sensor.json';
//  g_apiAws.upload(g_path_storage, filename, g_aws_s3_sensor);
};


/**
 * 全センサの 1day の値の JSON オブジェクト配列の値をクリアする
 * @example
 * clearSensorObjects();
*/
function clearSensorObjects() {
  console.log("[main.js] clearSensorObjects()");

  for(key in g_sensors) {
    g_sensors[key].clearData1day();
  }
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

      // センサ値を取り出して value 配列にセットする
      // センサ値は value[0] に格納されている
      let value = stdout.split(/\s+/);    // 空白文字で分割する
      console.log("[main.js] value[0] = " + value[0]);

      io.sockets.emit('S_to_C_DATA', {value:Number(value[0])});

      // 対象のセンサ名を取り出して key にセットする
      let key;
      let cmd = data.split(/\s+/);              // 空白文字で分割する
      let sensor_name     = cmd[2].substr(2);   // '--si_bme280' の先頭 2 文字 (= '--' 部分 ) を除いて 'si_bme280' を取り出す
      let sensor_name_sub = cmd[3].substr(2);   // '--temp'      の先頭 2 文字 (= '--' 部分 ) を除いて 'temp'      を取り出す
      console.log("[main.js] sensor_name     = " + sensor_name);
      console.log("[main.js] sensor_name_sub = " + sensor_name_sub);

      // sensor_name_sub が 'data' の場合は無視
      if(sensor_name_sub == 'data') {
        key = sensor_name;
      } else {
        key = sensor_name + '_' + sensor_name_sub;
      }
      console.log("[main.js] key = " + key);

      // 時間を取得して hour にセットする
      let date = new Date();
      let hour = ('0' + date.getHours()).slice(-2); // 現在の時間を 2 桁表記で取得
      hour = hour + ':00';

      // 各センサ・オブジェクトの data1day[hour] を更新する
      g_sensors[key].setData1day(hour, Number(value[0]));
    });
  });


  socket.on('C_to_S_GET_SENSOR_DAILY', function(data) {
    console.log("[main.js] " + 'C_to_S_GET_SENSOR_DAILY');
    console.log("[main.js] data.date   = " + data.date);
    console.log("[main.js] data.sensor = " + data.sensor);

    let ret = {};
    let filename = data.date + '_sensor.json';
    let jsonObj = g_apiFileSystem.read(g_path_storage +  filename);
//    g_apiAws.download(g_path_top + 'data/', filename, g_aws_s3_sensor);
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
    storeSensorObjects();
  });


});


