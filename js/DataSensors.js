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
   * センサ
   * @type {string}
  */
  this.sensors = [ "sa_acc_x", "sa_acc_y", "sa_acc_z",
                   "sa_gyro_g1", "sa_gyro_g2",
                   "si_bme280_atmos", "si_bme280_humi", "si_bme280_temp",
                   "si_gp2y0e03",
                   "si_lps25h_atmos", "si_lps25h_temp",
                   "si_tsl2561_lux"
                 ];

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
};


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する
 * @param {string} mongo_url - MongoDB の URL
 * @param {void}
 * @return {void}
 * @example
 * CreateMongoDbDocument();
*/
DataSensors.prototype.CreateMongoDbDocument = function(){
  console.log( "[DataSensors.js] CreateMongoDbDocument()" );

  var dburl  = this.mongo_url;
  var dbname = this.nameDatabase;
  console.log( "[DataSensors.js] dburl  = " + dburl );
  console.log( "[DataSensors.js] dbname = " + dbname );

  MongoClient.connect( dburl, function(err, db) {
    if( err ) throw err;

    // データベースの取得
    var dbo = db.db( dbname );

    // コレクションの取得
    var clo = dbo.collection( yyyymmdd() );

    // ドキュメント
/*
    var doco;
    for( var i in this.sensors ){
      doco += { "sensor": this.sensors[i] };
    }
*/
    var doco = [
      { "sensor": "sa_acc_x" },
      { "sensor": "sa_acc_y" },
      { "sensor": "sa_acc_z" },
      { "sensor": "sa_gyro_g1" },
      { "sensor": "sa_gyro_g2" },
      { "sensor": "si_bme280_atmos" },
      { "sensor": "si_bme280_humi" },
      { "sensor": "si_bme280_temp" },
      { "sensor": "si_gp2y0e03" },
      { "sensor": "si_lps25h_atmos" },
      { "sensor": "si_lps25h_temp" },
      { "sensor": "si_tsl2561_lux" }
    ];

    clo.insertMany( doco, function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
      db.close();
    });
  });
}


/**
 * MongoDB にデータをセットする
 * @param {string} database - 対象のデータベース名
 * @param {string} data - セットするデータ
 * @param {void}
 * @return {void}
 * @example
 * SetMongoDbData( {"sa_acc_x": 2046, ....} );
*/
DataSensors.prototype.SetMongoDbData = function( data ){
  console.log( "[DataSensors.js] SetMongoDbData()" );

  var dbdata = (new Function( "return " + data ))();

  var dburl  = this.mongo_url;
  var dbname = this.nameDatabase;
  console.log( "[DataSensors.js] dburl  = " + dburl );
  console.log( "[DataSensors.js] dbname = " + dbname );

  MongoClient.connect( dburl, function(err, db) {
    if (err) throw err;

    // データベースの取得
    var dbo = db.db( dbname );

    // コレクションの取得
    var clo = dbo.collection( yyyymmdd() );

    // ドキュメント
    for( var key in dbdata ){
      var doco = { "sensor": key };
      var dataSet = {};
      dataSet[hh00()] = dbdata[key];

      clo.updateOne( doco, {$set: dataSet}, function(err, res) {
        if (err) throw err;
        console.log("Database closed!");
      });
    }
    db.close();
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
//  console.log( "[DataSensors.js] toDoubleDigits()" );
//  console.log( "[DataSensors.js] num = " + num );
  num += "";
  if( num.length === 1 ){
    num = "0" + num;
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
  console.log( "[DataSensors.js] yyyymmdd()" );
  var date = new Date();

  var yyyy = date.getFullYear();
  var mm   = toDoubleDigits( date.getMonth() + 1 );
  var dd   = toDoubleDigits( date.getDate() );

  var day = yyyy + '-' + mm + '-' + dd;
  console.log( "[DataSensors.js] day = " + day );
  return day;
};


/**
 * 現在の時刻を HH:00 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
var hh00 = function(){
  console.log( "[DataSensors.js] hh00()" );
  var date = new Date();

  var hour = toDoubleDigits( date.getHours() );
//  var min  = toDoubleDigits( date.getMinutes() );
//  var sec  = toDoubleDigits( date.getSeconds() );

  var time = hour + ":00";
//  var time = hour + ":" + min + ":" + sec;
  console.log( "[DataSensors.js] time = " + time );
  return time;
};


module.exports = DataSensors;


