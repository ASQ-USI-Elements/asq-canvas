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

  },

  attached: function() {
    this.$.canvas.width = this.offsetWidth;
    this.$.canvas.height = this.offsetHeight;
    this.ctx = this.$.canvas.getContext('2d');
    this.emptyCanvasData = this.$.canvas.toDataURL();
    this.lastX = 0;
    this.lastY = 0;

    window.addEventListener('resize', this.resizeCanvas.bind(this), false);
  },

  resizeCanvas: function () {
    this.$.canvas.width = this.offsetWidth;
    this.$.canvas.height = this.offsetHeight;

    if (this.role == 'viewer') {
      this._loadImage(this.lastDrawing.drawing);
    }
    else {
      this._loadImage(this.lastStep);
    }
  },

  _drawLine: function(x1, y1, x2, y2, lineThickness) {
    this._drawOnCanvas("line", x1, y1, lineThickness, x2, y2);
  },

  _drawCircle: function(x, y, lineThickness) {
    this._drawOnCanvas("circle", x, y, lineThickness);
  },

  _drawOnCanvas: function(form, x1, y1, lineThickness, x2, y2) {
    var radius = lineThickness/2;

    for (var i = 0; i < lineThickness * lineThickness; ++i) {
      var currentX = i%lineThickness;
      var currentY = Math.floor(i/lineThickness);

      var canvasX1 = x1 - radius + currentX;
      var canvasY1 = y1 - radius + currentY;

      var canvasX2 = x2 - radius + currentX;
      var canvasY2 = y2 - radius + currentY;

      if (Math.pow(Math.abs(canvasX1 - x1), 2) + Math.pow(Math.abs(canvasY1 - y1), 2) < radius * radius) {
        switch (form) {
          case "circle":
            this.ctx.fillRect(canvasX1, canvasY1, 1, 1);
            break;

          case "line":
            this.ctx.beginPath();
            this.ctx.moveTo(canvasX1, canvasY1);
            this.ctx.lineTo(canvasX2, canvasY2);
            this.ctx.stroke();
            break;
        }
      }
    }
  },

  clearTo: function() {
    this.ctx.clearRect(0, 0, this.$.canvas.width, this.$.canvas.height);
  },

};

var asqCanvasElementBehavior = ASQ.asqElementBehavior.slice(0);
asqCanvasElementBehavior.push(canvasElementBehaviour);
ASQ.asqCanvasElementBehavior = [asqCanvasElementBehavior];
