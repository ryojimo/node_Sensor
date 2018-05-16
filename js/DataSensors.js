/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );
var MongoClient  = require( 'mongodb' ).MongoClient;


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * var obj = new DataSensors();
*/
var DataSensors = function(){
  /**
   * MongoDB のデータベース名
   * @type {string}
  */
  this.nameDatabase = "sensors";

  /**
   * MongoDB の URL
   * @type {string}
  */
  this.mongo_url = "mongodb://localhost:27017/";

  /**
   * 1 日のセンサ値
   * @type {Object}
  */
  this.dataOneDay = { "00-00": 0, "01-00": 0, "02-00": 0, "03-00": 0, "04-00": 0, "05-00": 0,
                      "06-00": 0, "07-00": 0, "08-00": 0, "09-00": 0, "10-00": 0, "11-00": 0,
                      "12-00": 0, "13-00": 0, "14-00": 0, "15-00": 0, "16-00": 0, "17-00": 0,
                      "18-00": 0, "19-00": 0, "20-00": 0, "21-00": 0, "22-00": 0, "23-00": 0
                    };
};


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する
 * @param {string} day - 日付。( MongoDB のコレクション名でも使用 )
 * @param {string} hour - 時間。
 * @param {string} data - センサ名:値 が入った JSON 文字列
 * @return {void}
 * @example
 * CreateMongoDbDocument( "2018-05-14", "08:00", "{...}" );
*/
DataSensors.prototype.CreateMongoDbDocument = function( day, hour, data ){
  console.log( "[DataSensors.js] CreateMongoDbDocument()" );

  var jsonObj = (new Function( "return " + data ))();

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースの取得する
    var dbo = db.db( "sensors" );

    // コレクションの取得する
    var clo = dbo.collection( day );

    // { hour: "08:00", sensor:{...} } を持つドキュメントを作る
    var obj = { hour: hour, sensors: jsonObj };

    // obj をデータベースに insert する
    clo.insertOne( obj, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する
 * @param {string} day - 日付。( MongoDB のコレクション名でも使用 )
 * @param {string} hour - 時間。
 * @param {string} data - センサ名:値 が入った JSON 文字列
 * @return {void}
 * @example
 * UpdateMongoDb( "2018-05-14", "08:00", "{...}" );
*/
DataSensors.prototype.UpdateMongoDb = function( day, hour, data ){
  console.log( "[DataSensors.js] UpdateMongoDb()" );

  var jsonObj = (new Function( "return " + data ))();

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースの取得する
    var dbo = db.db( "sensors" );

    // コレクションの取得する
    var clo = dbo.collection( day );

    // 対象のドキュメント {date: "2018-mm-dd"}
    var myquery = { hour: hour };

    var dataSet = {};
    dataSet[ "sensors" ] = jsonObj;
    var newvalue = { $set: dataSet };

    // newvalue をデータベースに入れて更新する
    clo.updateOne( myquery, newvalue, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}


/**
 * 指定した日付の指定したセンサの 1 日の値を取得する
 * @param {string} day - 対象の日付。( MongoDB のコレクション名でも使用 )
 * @param {string} sensor - 対象のセンサ。
 * @param {obj} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * GetMongoDbOneDay( "2018-05-14", "si_bme280_temp" );
*/
DataSensors.prototype.GetMongoDbOneDay = function( day, sensor, callback ){
  console.log( "[DataSensors.js] GetMongoDbOneDay()" );
  console.log( "[DataSensors.js] day    = " + day );
  console.log( "[DataSensors.js] sensor = " + sensor );

  var cname = day;  // コレクション名

  var dataOneDay = { "00-00": 0, "01-00": 0, "02-00": 0, "03-00": 0, "04-00": 0, "05-00": 0,
                     "06-00": 0, "07-00": 0, "08-00": 0, "09-00": 0, "10-00": 0, "11-00": 0,
                     "12-00": 0, "13-00": 0, "14-00": 0, "15-00": 0, "16-00": 0, "17-00": 0,
                     "18-00": 0, "19-00": 0, "20-00": 0, "21-00": 0, "22-00": 0, "23-00": 0
                   };

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースの取得
    var dbo = db.db( "sensors" );

    // コレクションに含まれるドキュメントをすべて取得
    dbo.collection( cname ).find({}).toArray( function(err, documents){
      try{
        if (err) throw err;

        var i = 0;
        for( var key in dataOneDay ){
          dataOneDay[key] = documents[i].sensors[sensor];
          i++;
        }
        db.close();

//      console.log( dataOneDay );
        callback( true, dataOneDay );
      }
      catch( e ){
        console.log( "[DataSensors.js] e = " + e );
        callback( false, dataOneDay );
      }
    });
  });
}


module.exports = DataSensors;


