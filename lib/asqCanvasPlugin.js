var ASQPlugin = require('asq-plugin');
var _ = require('lodash');

module.exports = ASQPlugin.extend({
  tagName : 'asq-text-input-q',
  events: {
    "plugin": "onPlugin"
  },

  onPlugin: function onPlugin (evt){
    if(evt.type !== 'asq-canvas') return;
    var newEvt = _.omit(evt, 'socketId', 'sessionId');
    this.asq.socket.emitToRoles('asq-plugin', newEvt, evt.sessionId, 'folo');
  }
});