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
};


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する
 * @param {string} day - 日付。( MongoDB のコレクション名でも使用 )
 * @return {void}
 * @example
 * CreateMongoDb();
*/
DataSensors.prototype.CreateMongoDb = function( day ){
  console.log( "[DataSensors.js] CreateMongoDb()" );

  var cname = day;  // コレクション名

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースの取得
    var dbo = db.db( "sensors" );

    // {date: "2018-mm-dd"} を持つドキュメントを作る
    var obj = { date: day };
    dbo.collection( cname ).insertOne( obj, function(err, res) {
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
 * UpdateMongoDb();
*/
DataSensors.prototype.UpdateMongoDb = function( day, hour, data ){
  console.log( "[DataSensors.js] UpdateMongoDb()" );

  var cname = day;  // コレクション名
  var jsonObj = (new Function( "return " + data ))();

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースの取得
    var dbo = db.db( "sensors" );

    // 対象のドキュメント {date: "2018-mm-dd"}
    var myquery = { date: day };

    var dataSet = {};
    dataSet[ hour ] = jsonObj;
    var newvalue = { $set: dataSet };

    dbo.collection( cname ).updateOne( myquery, newvalue, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}


module.exports = DataSensors;


