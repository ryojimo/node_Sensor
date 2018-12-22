/**
 * @fileoverview API クラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * var obj = new ApiFileSystem();
*/
var ApiFileSystem = function(){
};


/**
 * 引数の file からデータを読み出して JSON オブジェクトにして返す。
 * @note ファイルの中に書かれている文字が JSON 形式である必要があります。
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {Object} ret - file から読み出した JSON 形式のデータ
 * @example
 * var obj = read( '/media/pi/USBDATA/2018-01-23_sensor.txt' );
*/
ApiFileSystem.prototype.read = function( file ){
  console.log( "[ApiFileSystem.js] read()" );
  console.log( "[ApiFileSystem.js] file = " + file );

  var ret = NULL;
  try{
    fs.statSync( file );
    var ret = fs.readFileSync( file, 'utf8');
    var jsonObj = (new Function("return " + ret))();
    console.log( "[ApiFileSystem.js] jsonObj = " + JSON.stringify(jsonObj) );
    ret = jsonObj;
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[ApiFileSystem.js] file does not exist." );
      ret = NULL;
    }
  }
  return ret;
};


/**
 * 引数の file の中身に jsonObj を付け加える。
 * @note ファイルの中に書かれている文字が JSON 形式である必要があります。
 * @param {string} file - 対象のファイル ( フルパス )
 * @param {object} jsonObj - 付け加える json 形式のデータ
 * @return {void}
 * @example
 * append( "/media/pi/USBDATA/2018-01-23_sensor.txt", {} );
*/
ApiFileSystem.prototype.append = function( file, jsonObj ){
  console.log( "[ApiFileSystem.js] append()" );
  console.log( "[ApiFileSystem.js] file = " + file );
  console.log( "[ApiFileSystem.js] jsonObj = " + JSON.stringify(jsonObj) );

  var str = JSON.stringify(jsonObj);

  try{
    fs.statSync( file );
    fs.appendFileSync( file, str, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[ApiFileSystem.js] file does not exist." );
    }
  }

  this.cnt = 0;
}


/**
 * 引数の file の中身に jsonObj を書き込む。
 * @param {string} file - 対象のファイル ( フルパス )
 * @param {object} jsonObj - 書き込む json 形式のデータ
 * @return {void}
 * @example
 * write( "/media/pi/USBDATA/2018-01-23_sensor.txt", {} );
*/
ApiFileSystem.prototype.write = function( file, jsonObj ){
  console.log( "[ApiFileSystem.js] write()" );
  console.log( "[ApiFileSystem.js] file = " + file );
  console.log( "[ApiFileSystem.js] jsonObj = " + JSON.stringify(jsonObj) );

  var str = JSON.stringify(jsonObj);

  try{
    fs.writeFileSync( file, str, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[ApiFileSystem.js] file does not exist." );
    }
  }

  this.cnt = 0;
}


module.exports = ApiFileSystem;


