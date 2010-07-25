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
 * @param {jQueryObject} $elem The content was displayed inside the box.
 */
jSvg.Box = $.inherit({

  radius: 5,
  /** 
   * Contains the properties of the box HTMLElement content.
   * @type {object} 
   */
  _contentBounds: {},
  
  __constructor: function (paper, data, $elem) {
    this.create(paper, data, $elem);
  },

  create: function (paper, data, $elem) {
    this.paper = paper;
    this.box = paper.rect(0, 0, 0, 0, this.radius);
    this.addClass(this.box.node, 'box');    
    this.box.style = this.getStyles();
    this.bar = paper.rect(0, 0, 0, 0);
    this.addClass(this.bar.node, 'bar');
    this.bar.height = this._convertToInt($(this.bar.node).css('height'));
    this.$elem = $elem;
    this.data = data;
    this.paperPosition = $(this.paper.canvas).parent().position();
    this.position(0, 0);
  
    if (data.status) {
      this.addClass(this.box.node, 'active');
      this.addClass(this.bar.node, 'active');
    }
  },
  
  addClass: function (node, value) {
    var classKey = 'class',
    classValue = node.getAttribute(classKey);
    
    if (classValue != null) {
      value += ' ' + classValue;
    }

    node.setAttribute(classKey, value);
  },
  
  /**
   * @return {object} Returns an object with margin an padding box properties.
   */
  getStyles: function () {
    var $box = $(this.box.node);
    
    return {
      margin: {
        horizontal: this._convertToInt($box.css('marginLeft')),
        vertical: this._convertToInt($box.css('marginTop'))
      },
      padding: {
        horizontal: this._convertToInt($box.css('paddingLeft')),
        vertical: this._convertToInt($box.css('paddingTop'))
      }
    };
  },
  
  /**
   * Convert a string <code>"50px"</code> to a number <code>50</code>.
   * @param {string} property
   * @retutrn {int} Return a  number is styleProprerty a valid string, otherwise 
   *     return 0. 
   */
  _convertToInt: function (property) {
    return typeof property == 'string' && property.length > 0 ? parseInt(property, 10) : 0;
  },

  /**
   * @return {object} Returns the typical coordinats (x, y, width, height) and the 
   * bounds values (top, right, left, bottom) of the text HTMLElement.
   */
  getContentBounds: function () {
    if ('x' in this._contentBounds) {
      return this._contentBounds;
    } else {
      var $elem = this.$elem,
      x = this._convertToInt($elem.css('left')),
      y = this._convertToInt($elem.css('top')),
      paddingH = this._convertToInt($elem.css('paddingLeft')) * 2,
      paddingV = this._convertToInt($elem.css('paddingTop')) * 2,
      width = $elem.width() + paddingH,
      height = $elem.height() + paddingV;
      
      return this._contentBounds = {
        x: x, y: y, width: width, height: height, 
        top: x, right: y + width, bottom: y + height, left: x
      };
    }
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
    
    var bounds = this.getContentBounds(),
    w = bounds.width,
    r = this.radius, 
    paperPosition = this.paperPosition,
    padding = this.box.style.padding,
    margin = this.box.style.margin,
    pH = this.box.style.padding.horizontal;

    this.bar.attr({x: x, y: y, width: bounds.width, height: this.bar.height});
    this.$elem.css({left: x + paperPosition.left, top: y + paperPosition.top + pH});
    this.box.attr({x: x, y: y, width: bounds.width, height: bounds.height + pH});
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