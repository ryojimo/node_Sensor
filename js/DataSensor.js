/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
require('date-utils');


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * let obj = new DataSensor();
*/
class DataSensor {

  constructor(name){
    /**
     * センサ名
     * @type {string}
    */
    this.name = name;

    /**
     * 30 秒前までのセンサ値が入った JSON 配列
     * @type {Object}
    */
    this.data30s = {'30秒前': 0, '20秒前': 0, '10秒前': 0, '今': 0};

    /**
     * 1 日の 1 時間ごとのセンサ値が入った JSON 配列
     * @type {Object}
    */
    this.data1day = {'00:00': 0, '01:00': 0, '02:00': 0, '03:00': 0, '04:00': 0, '05:00': 0,
                     '06:00': 0, '07:00': 0, '08:00': 0, '09:00': 0, '10:00': 0, '11:00': 0,
                     '12:00': 0, '13:00': 0, '14:00': 0, '15:00': 0, '16:00': 0, '17:00': 0,
                     '18:00': 0, '19:00': 0, '20:00': 0, '21:00': 0, '22:00': 0, '23:00': 0
                    };
  }


  /**
   * data30s プロパティを更新する。
   * @param {number} data - 現在のセンサ値
   * @example
   * updateData30s( 28.4 );
  */
  updateData30s(data) {
  //  console.log("[DataSensor.js] updateData30s()");

    this.data30s['30秒前'] = this.data30s['20秒前'];
    this.data30s['20秒前'] = this.data30s['10秒前'];
    this.data30s['10秒前'] = this.data30s['今'];
    this.data30s['今'    ] = data;
  }


  /**
   * data1day プロパティを更新する。
   * @param {number} data - 現在のセンサ値
   * @example
   * updateData1day('15:00', 28.4);
  */
  updateData1day(data) {
    console.log("[DataSensor.js] updateData30s()");

    let date = new Date();
    let hour = ('0' + date.getHours()).slice(-2); // 現在の時間を 2 桁表記で取得

    this.data1day[hour + ':00'] = data;
  }


  /**
   * this.data30s プロパティで "10秒前" と "今" の値に大きな差があるか？チェックする。
   * @return {bool} ret - 500 以上の差があれば true を返す
   * @example
   * isLarge();
  */
  isLarge() {
  //  console.log("[DataSensor.js] isLarge()");

    let diff = this.data30s['10秒前'] - this.data30s['今'];
    let ret = false;

    if(diff < -500 || 500 < diff) {
      ret = true;
      console.log("10秒前の値と今の値が 500 以上差があります。");
    } else {
      ret = false;
    }

    return ret;
  }


};


module.exports = DataSensor;


