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

  onPlugin: coroutine(function *onPluginGen(evt) {
    if(evt.type !== 'asq-canvas') return;
    var newEvt = _.omit(evt, 'socketId', 'sessionId');

    switch (evt.data.command) {
      case 'saveDrawings':
        var pluginCustomData = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);
        if (pluginCustomData) {
          yield this.asq.db.savePluginSessionData('asq-canvas', evt.sessionId, {
            extraSlides: pluginCustomData.extraSlides,
            drawings: evt.data.drawings });
        }
        break;

      case 'getDrawings':
        newEvt.data.command = 'storeDrawingsLocally';
        newEvt.data.pluginCustomData = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);
        this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'ctrl');
        break;

      case 'getSlides':
        var that = this;
        var pluginCustomData = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);
        if (pluginCustomData && pluginCustomData.extraSlides) {
          pluginCustomData.extraSlides.forEach(function(slide) {
            evt.data = slide;
            that.asq.socket.emitToRoles('asq:addSlide', evt, evt.sessionId, 'ctrl', 'folo');
          });
        }
        break;

      case 'addSlide':
        evt.data = _.omit(evt.data, 'command');
        this.asq.socket.emitToRoles('asq:addSlide', evt, evt.sessionId, 'ctrl', 'folo');
        var pluginCustomData = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);
        var slides = (pluginCustomData)? pluginCustomData.extraSlides || [] : [];
        var savedDrawings = (pluginCustomData)? pluginCustomData.drawings || {} : {};
        slides.push(evt.data);

        yield this.asq.db.savePluginSessionData('asq-canvas', evt.sessionId, {
          drawings: savedDrawings,
          extraSlides: slides });
        break;

      default:
        this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'folo');
    }

  }),

});
