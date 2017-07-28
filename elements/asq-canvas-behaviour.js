var ASQ = window.ASQ || {};

/**
 * This mixin object shares canvas functionalities.
 */
 var canvasElementBehaviour = ASQ.canvasElementBehaviour = {

  properties: {

    activeTool: {
      type: String,
      value: "pen",
    },

    drawingColor: {
      type: String,
      value: "#000000",
    },

    lineWidth: {
      type: Number,
      value: 6,
    },

  }

};

var asqCanvasElementBehavior = ASQ.asqElementBehavior;
asqCanvasElementBehavior.push(canvasElementBehaviour);
ASQ.asqCanvasElementBehavior = [asqCanvasElementBehavior];
