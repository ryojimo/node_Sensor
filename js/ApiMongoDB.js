/**
 * @fileoverview API クラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
let MongoClient  = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * let obj = new ApiFileSystem();
*/
class ApiMongoDB {

  constructor(dbname) {
    this.data = {
      nameDatabase: '',                       // @type {string} : データベース名
      mongo_url: 'mongodb://localhost:27017/' // @type {string} : MongoDB の URL
    };

    this.data.nameDatabase = dbname;
  }


  /**
   * 対象のコレクションにドキュメントを作成する。
   * @param {string} collection - 対象の MongoDB コレクション
   * @param {string} jsonObj - 作成するドキュメント
   * @return {void}
   * @example
   * createDoc("2018-08-10", {});
  */
  createDoc(collection, jsonObj) {
    console.log("[ApiMongoDB.js] createDoc()");

    MongoClient.connect(this.data.mongo_url, function(err, db){
      if(err) throw err;

      let dbo = db.db(this.data.nameDatabase);  // データベースを取得する
      let clo = dbo.collection(collection);     // コレクションを取得する

      // jsonObj をデータベースに insert する
      clo.insertOne(jsonObj, function(err, res) {
        try{
          if(err) throw err;
          db.close();
          console.log("[ApiMongoDB.js] res = " + res);
        }
        catch(err) {
          console.log("[ApiMongoDB.js] err = " + err + " : " + err.message);
          db.close();
        }
      });
    });
  }


  /**
   * 対象の collection の id で指定したドキュメントを jsonObj で更新する。
   * @param {string} collection - 対象の MongoDB コレクション
   * @param {string} id - 対象の MongoDB ドキュメントの ID
   * @param {Object} jsonObj - 新しいデータ
   * @return {void}
   * @example
   * updateDoc('one_2018_09', '', {});
  */
  updateDoc(collection, id, jsonObj) {
    console.log("[ApiMongoDB.js] updateDoc()");
    console.log("[ApiMongoDB.js] collection = " + collection);
    console.log("[ApiMongoDB.js] id = " + id);
    console.log("[ApiMongoDB.js] jsonObj = " + JSON.stringify(jsonObj));

    MongoClient.connect(this.data.mongo_url, function(err, db) {
      if(err) throw err;

      let dbo = db.db(this.data.nameDatabase);  // データベースを取得する
      let clo = dbo.collection(collection);     // コレクションを取得する

      let query = {'_id':ObjectID(id)};
      let newdata = {$set: jsonObj};

      console.log("[ApiMongoDB.js] newdata = " + JSON.stringify(newdata));

      // query のドキュメントを newdata に更新する
      clo.updateOne(query, newdata, function(err, res) {
        try{
          if(err) throw err;
          db.close();
          console.log("[ApiMongoDB.js] res = " + res);
        }
        catch(err) {
          console.log("[ApiMongoDB.js] err = " + err + " : " + err.message);
          db.close();
        }
      });
    });
  }


  /**
   * 対象の collection の全ドキュメントに対して query に一致するドキュメントを問い合わせる。
   * @param {string} collection - 対象の MongoDB コレクション
   * @param {Object} query - 問い合わせの情報
   * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
   * @return {void}
   * @example
   * query('one_2018_09', {'gid': 0000114347}, function(err, doc){});
  */
  query(collection, query, callback) {
    console.log("[ApiMongoDB.js] query()");
    console.log("[ApiMongoDB.js] collection = " + collection);
    console.log("[ApiMongoDB.js] query      = " + JSON.stringify(query));

    MongoClient.connect(this.data.mongo_url, function(err, db) {
      if(err) throw err;

      let dbo = db.db(this.data.nameDatabase);  // データベースを取得する
      let clo = dbo.collection(collection);     // コレクションを取得する

      clo.find(query).toArray(function(err, docs) {
        try{
          if(err) throw err;
          db.close();
          console.log("[ApiMongoDB.js] docs.length = " + docs.length);
//        console.log("[ApiMongoDB.js] docs = " + JSON.stringify(docs));
          callback(true, docs);
        }
        catch(err) {
          console.log("[ApiMongoDB.js] err = " + err + " : " + err.message);
          db.close();
          callback(false, docs);
        }
      });
    });
  }


  /**
   * Top 50 を取得する
   * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
   * @return {void}
   * @example
   * getRankingTop50(function(err, doc){});
  */
  queryRankingTop50(callback) {
    console.log("[ApiMongoDB.js] getRankingTop50()");

    MongoClient.connect(this.data.mongo_url, function(err, db) {
      if(err) throw err;

      let dbo = db.db(this.data.nameDatabase);  // データベースを取得する
      let clo = dbo.collection(collection);     // コレクションを取得する

      // ドキュメントを取得する
      clo.find({}, {sort:{cnt: -1}, limit:50}).toArray(function(err, docs) {
        try{
          if(err) throw err;
          db.close();
          console.log("[ApiMongoDB.js] docs.length = " + docs.length);
//        console.log("[ApiMongoDB.js] docs = " + JSON.stringify(docs));
          callback(true, docs);
        }
        catch(err) {
          console.log("[ApiMongoDB.js] err = " + err + " : " + err.message);
          db.close();
          callback(false, docs);
        }
      });
    });
  }


  /**
   * 対象の collection の全ドキュメントを取得する。
   * @param {string} collection - 対象の MongoDB コレクション
   * @param {function(boolean, Object)} callback - データを取得するためのコールバック関数
   * @return {void}
   * @example
   * getAllDocs('one_2018_09', callback);
  */
  getAllDocs(collection, callback) {
    console.log("[ApiMongoDB.js] getAllDocs()");
    console.log("[ApiMongoDB.js] collection = " + collection);

    MongoClient.connect(this.data.mongo_url, function(err, db) {
      if(err) throw err;

      let dbo = db.db(this.data.nameDatabase);  // データベースを取得する
      let clo = dbo.collection(collection);     // コレクションを取得する

      let query = {};

      // コレクションに含まれるすべてのドキュメントを取得する
      clo.find(query).toArray(function(err, docs) {
        try{
          if(err) throw err;
          db.close();
          console.log("[ApiMongoDB.js] docs.length = " + docs.length);
//        console.log("[ApiMongoDB.js] docs = " + JSON.stringify(docs));
          callback(true, docs);
        }
        catch(err) {
          console.log("[ApiMongoDB.js] err = " + err + " : " + err.message);
          db.close();
          callback(false, docs);
        }
      });
    });
  }


};


module.exports = ApiMongoDB;


