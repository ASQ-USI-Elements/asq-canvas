var ASQPlugin = require('asq-plugin');
var ObjectId = require("bson-objectid");
var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var _ = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = ASQPlugin.extend({
  tagName : 'asq-canvas',
  events: {
    "plugin": "onPlugin"
  },

  onPlugin: coroutine(function *onPluginGen(evt) {
    if (evt.type !== 'asq-canvas') return;
    var newEvt = _.omit(evt, 'socketId', 'sessionId');

    var pluginCustomData = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);

    switch (evt.data.command) {

      case 'saveDrawings':
        var extraSlides = (pluginCustomData)? pluginCustomData.extraSlides : {};
        yield this.asq.db.savePluginSessionData('asq-canvas', evt.sessionId, {
          extraSlides: extraSlides,
          drawings: evt.data.drawings });
        break;

      case 'getDrawings':
        newEvt.data.command = 'storeDrawingsLocally';
        newEvt.data.pluginCustomData = yield this.asq.db.getPluginSessionData('asq-canvas', evt.sessionId);
        this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'ctrl');
        break;

      case 'getSlides':
        if (pluginCustomData && pluginCustomData.extraSlides) {
          var printing = evt.data.printing;
          pluginCustomData.extraSlides.forEach(function(slide) {
            evt.data = slide;
            evt.data.getSlides = true;
            evt.data.printing = printing;
            this.asq.socket.emitToRoles('asq:addSlide', evt, evt.sessionId, 'ctrl', 'folo');
          }.bind(this));
        }
        break;

      case 'addSlide':
        evt.data = _.omit(evt.data, 'command');
        this.asq.socket.emitToRoles('asq:addSlide', evt, evt.sessionId, 'ctrl', 'folo');
        var slides = (pluginCustomData)? pluginCustomData.extraSlides || [] : [];
        var savedDrawings = (pluginCustomData)? pluginCustomData.drawings || {} : {};
        slides.push(evt.data);

        yield this.asq.db.savePluginSessionData('asq-canvas', evt.sessionId, {
          drawings: savedDrawings,
          extraSlides: slides });
        break;

      case 'removeSlide':
        var drawings = evt.data.drawings;
        evt.data = _.omit(evt.data, 'command');
        this.asq.socket.emitToRoles('asq:removeSlide', evt, evt.sessionId, 'ctrl', 'folo');
        var slides = (pluginCustomData)? pluginCustomData.extraSlides || [] : [];
        var savedDrawings = (pluginCustomData)? pluginCustomData.drawings || {} : {};
        slides.forEach(function(slide) {
          if (slide.id == evt.data.id) slides.splice(slides.indexOf(slide), 1);
        });

        yield this.asq.db.savePluginSessionData('asq-canvas', evt.sessionId, {
          drawings: drawings,
          extraSlides: slides });
        break;

      default:
        this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'folo');
    }

  }),

});
