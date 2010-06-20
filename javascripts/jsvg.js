/*
#FFCC00 yellow
#7F0033 red
#1C2933 dark
#7F9933 green
#C3D96C green light
*/
/**
 * Contains the SVG box panel functionality.
 */
var jSvg = {};

jSvg.colors = {
  DARK: '#1C2933',
  LIGHT: 'rgb(176, 203, 192)',
  GREEN: '#C3D96C',
  RED: '#7F0033',
  BLUE: '#7F9933'
},

jSvg.config = {
  box: {
    border: {
      SIZE: '2'
    },
    background: {
      ALPHA: 0.8
    },    
  },
  font: {
    HEAD: {
      'font-style': 'bold',
      'text-anchor': 'left'
    },
    BODY: {
       'text-anchor': 'left'
    }
  },
  path: {
    fill: jSvg.colors.DARK+'|4',
    stroke: jSvg.colors.DARK,
	  strokeSize:'|3'
  }
};
/**
 * @param {SVGElement} paper SVG stage object.
 * @param {object} data
 * @param {jQueryObject} $content The content was displayed inside the box.
 */
jSvg.Box = $.inherit({

  radius: 5,
  
  __constructor: function (paper, data, $content) {
    this.create(paper, data, $content);
  },

  create: function (paper, data, $content) {
    this.paper = paper;
    this.box = paper.rect(0, 0, 0, 0, this.radius);
    this.$text = $content;
    this.box.node.id = data.id + '_box' + (data.status ? '_active' : '');
    this.bar = paper.path('');
    this.group = paper.set();
    this.group.push(this.box, this.panel);
    
    this.data = data;
    this.position(0, 0);
  },

  /**
   * @return {object} Returns the typical coordinats (x, y, width, height) and the 
   * bounds values (top, right, left, bottom) of the text HTMLElement.
   */
  getTextBounds: function () {
    var $text = this.$text,
    x = parseInt($text.css('left'), 10),
    y = parseInt($text.css('top'), 10),
    paddingHorizointal = $text.css('paddingLeft'),
    paddingVertical = $text.css('paddingTop'),
    paddingHorizointal = paddingHorizointal.length > 0 ? parseInt(paddingHorizointal, 10) * 2 : 0,
    paddingVertical = paddingVertical.length > 0 ? parseInt(paddingVertical, 10) * 2 : 0,
    width = $text.width() + paddingHorizointal,
    height = $text.height() + paddingVertical;
    return {
      x: x, y: y, width: width, height: height, 
      top: x, right: y + width, bottom: y + height, left: x
    };
  },

  /**
   * @return {object} Returns the typical coordinats (x, y, width, height) and the 
   * bounds values (top, right, left, bottom) of the box SVGElement.
   */
  getBoxBounds: function () {
    var bounds = this.box.getBBox();
    return $.extend({
      top: bounds.y, 
      right: bounds.x + bounds.width, 
      bottom: bounds.y + bounds.height, 
      left: bounds.x
    }, bounds);
  },
  
  /**
   * Positioned the box an the jQueryObject with the content.
   * @param {number} x The x-coordinate
   * @param {number} y The y-coordinate
   */
  position: function (x, y) {
    x = Math.round(x);
    y = Math.round(y);
    
    var bounds = this.getTextBounds(),
    w = bounds.width,
    r = this.radius, 
    pH = 10;
    
    // remove old bar 
    this.bar.remove();
    this.bar = this.paper.path(
      'M' + x + ',' + (y+pH) + 
      'V' + (y+pH-r) +
      'S' + x + ',' + y + ',' + (x+pH-r) + ',' + y + 
      'h' + (w-2*r) + 
      'S' + (x+w) + ',' + y + ',' + (x+w) + ',' + (y+r) + 
      'V' + (y+pH) + 
      'H' + x +
      'z'
    )
    this.bar.node.id = this.data.id + '_bar';
    this.bar.toBack();
    this.$text.css({left: x, top: y + pH/2});
    this.box.attr({x: x, y: y, width: bounds.width, height: bounds.height + pH/2});
  }

});


jSvg.Connection = $.inherit({

  __constructor: function (paper, from, to, id) {
    var config = jSvg.config.path;
    this.connection = paper.connection(from, to, Raphael.getColor() + config.strokeSize, config.fill);
    this.connection.line.toBack();
    this.connection.bg.toBack();
  }
});