/**
 * @fileoverview API クラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
require( 'date-utils' );


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * var obj = new ApiCmn();
*/
var ApiCmn = function(){
};


/**
 * 現在の日付を YYYY-MM-DD 形式で取得する
 * @param {void}
 * @return {string} ret - 日付
 * @example
 * yyyymmdd();
*/
ApiCmn.prototype.yyyymmdd = function(){
  console.log( "[ApiCmn.js] yyyymmdd()" );
  var date = new Date();

  var yyyy = date.getFullYear();
  var mm   = ('0' + (date.getMonth() + 1)).slice(-2);
  var dd   = ('0' +  date.getDate()      ).slice(-2);

  var ret = yyyy + '-' + mm + '-' + dd;
  console.log( "[ApiCmn.js] ret = " + ret );
  return ret;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} ret - 時刻
 * @example
 * hhmmss();
*/
ApiCmn.prototype.hhmmss = function(){
  console.log( "[main.js] hhmmss()" );
  var date = new Date();

  var hour = ('0' + date.getHours()   ).slice(-2);  // 現在の時間を 2 桁表記で取得
  var min  = ('0' + date.getMinutes() ).slice(-2);  // 現在の  分を 2 桁表記で取得
  var sec  = ('0' + date.getSeconds() ).slice(-2);  // 現在の  秒を 2 桁表記で取得

  var ret = hour + ':' + min + ':' + sec;
  console.log( "[main.js] ret = " + ret );
  return ret;
};


module.exports = ApiCmn;


