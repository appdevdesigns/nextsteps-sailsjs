/**
 * NSServerController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {


  /**
   * Action blueprints:
   *    `/nsserver/ping`
   */
  ping: function (req, res) {

    // Send a JSON response
    return res.json({
      status: 'pong'
    });
  },


  /**
   * Action blueprints:
   *    `/nsserver/auth`
   */
  auth: function (req, res) {
    // Send a JSON response
    return res.json({
      status: 'success'
    });
  },


  /**
   * Action blueprints:
   *    `/nsserver/sync`
   */
  sync: function (req, res) {

console.log('===========');
console.log('Actually in controller.sync()');

      var log = req.appdev.transactionLog;
      ADCore.comm.success(res, {
          "lastSyncTimestamp": Date.now(),
          "transactionLog":log
        });

/*
    NSServerSync.synchronize(req, res)
    .done(function(data) {
      ADCore.comm.success(res, data);
    })
    .fail(function(err){
      ADCore.comm.error(res, err);
    });
*/
  },


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to NSServerController)
   */
  _config: {}


};
