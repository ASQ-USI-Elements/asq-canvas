var ASQPlugin = require('asq-plugin');
var ObjectId = require("bson-objectid");
var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var _ = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = ASQPlugin.extend({
  tagName : 'asq-text-input-q',
  events: {
    "plugin": "onPlugin"
  },

  // hooks:{
  //   "presenter_connected" : "presenterConnected", // connect, reconnect with drawings and slides
  // },

  onPlugin: coroutine(function *onPluginGen(evt) {
    if(evt.type !== 'asq-canvas') return;
    var newEvt = _.omit(evt, 'socketId', 'sessionId');

    switch (evt.data.command) {
      case 'saveDrawings':
        yield this.asq.db.savePluginSessionData('asq-canvas', evt.sessionId, {
          drawings: evt.data.drawings });
        break;

      case 'getDrawings':
        newEvt.data.command = 'storeDrawingsLocally';
        newEvt.data.pluginInfo = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);
        this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'ctrl');
        break;

      default:
        // this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'folo');
    }

  }),

});
