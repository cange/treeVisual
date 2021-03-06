/*!
 * @author <a href="dev@psykmedia.de">Christian Angermann</a>
 * @link Copyright (c) 2010 <a href="http://github.com/cange/treeVisual">treeVisual</a>.
 */
/**
 * @lends Application
 */
var Application = $.inherit({

  /** @type {SVGElement} */
  paper: {},
  panels: {},
  connections: [],
  papers: [],
  
  /** @type {jQueryObject} */
  $lists: [],

  /**
   * @constructor
   * @class
   * @param {string} [canvasSelector]
   * @param {string} [listSelector]
   * @param {string} [direction]
   */
  __constructor: function (canvasSelector, listSelector, direction) {
    var scope = this,
    $window = $(window);
    // indicator for the css
    $('html').addClass('js');
    this.$lists = $(listSelector || 'ul');
    this.direction = direction || 'h';
    
    this.container = $(canvasSelector || '#canvas');
    this.evalData();
    this.createPanels()
  },
    
  /**
   * Collect data in an JSON object and call an callback after that.
   */
  evalData: function () {
    var datas = [];
    
    this.$lists.each(function (index) {
      var data = datas[index] = [];
      $(this).find('li').each(function () {
        var $listItem = $(this),
        binds = $.trim($listItem.attr('data-binds'));
        
        binds = typeof binds != 'undefined' ? binds.split(/ /) : [];
        data.push({
          id: this.id, 
          bindings: binds[0] == '' ? [] : binds, 
          status: $listItem.hasClass('active')
        });
      });
    });
    this.datas = datas;
  },
  
  /**
   * Create and positioned the panels.
   */
  createPanels: function () {
    var scope = this,
    panelBefore = false,
    absolutePosition = 0,
    direction = this.direction,
    minWidth = 500,
    minHeight = 200,
    boxMargin = {};

    this.$lists.each(function (index) {
      var id = 'svg-container_' + index,
      $listItems = $(this).find('li'),
      paperWidth = minWidth,
      paperHeight = minHeight;
      
      scope.container.append('<div id="' + id + '"></div>');
      paper = (scope.papers[index] = Raphael(id, minWidth, minHeight));
      paper.panels = {};
      
      // create SVG elements
      $.map(scope.datas[index], function (data, dataIndex) {
        var $listItem = $listItems.eq(dataIndex),
        panel = (paper.panels[data.id] = new jSvg.Box(scope.papers[index], data, $listItem)),
        margin = panel.box.style.margin,
        x = spaceX = margin.horizontal,
        y = spaceY = margin.vertical,
        bindingCounts = data.bindings.length;
        
        boxMargin = margin;
        // position
        if (dataIndex > 0 && panelBefore) {
          var boundsBefore = panelBefore.getBoxBounds(),
          bindingCountsBefore = panelBefore.data.bindings.length;
          if (direction == 'h') {
            x = (bindingCountsBefore == bindingCounts ? boundsBefore.right + spaceX : boundsBefore.left);
            y = spaceY + (bindingCounts > 0 ? boundsBefore.bottom : 0);
          } else {
            x = spaceX + (bindingCounts > 0 ? boundsBefore.right : 0);
            y = (bindingCountsBefore == bindingCounts ? boundsBefore.bottom + spaceY : boundsBefore.top);
          }
        }
        
        panel.position(Math.round(x), Math.round(y));
        panelBefore = panel;
      });
      
      $.each(paper.panels, function (){
        var bounds = this.getBoxBounds();
        paperWidth = bounds.right > paperWidth ? bounds.right + boxMargin.horizontal : paperWidth;
        paperHeight = bounds.bottom > paperHeight ? bounds.bottom + boxMargin.vertical : paperHeight;
      });
      paper.setSize(paperWidth, paperHeight);    
      
      scope.initConnection(index);
    });
  },

  /**
   * @param {int} index
   * Connects the panel with each other.
   */
  initConnection: function (index) {
    var scope = this;
    
    // add connections an events
    $.map(scope.datas[index], function (data) {
      var panels = scope.papers[index].panels,
      panel = panels[data.id];

      panel.activeBinds = [];
      // connections
      $.map(data.bindings, function (id) {
        if (panels[id]) {
          var hasAlreadyConnection = $.grep($(panels[id].activeBinds), function (activeBind) {
            return activeBind == data.id;
          }).length > 0;
  
          if (!hasAlreadyConnection && data.id != id) {
            var connection = new jSvg.Connection(scope.papers[index], panel.box, panels[id].box);
            scope.connections.push(connection.connection);
            panel.activeBinds.push(id); 
          }
        }
      });
      scope.initEvents(index, data.id);
    });

  },
  
  /**
   * @param {int} index
   * @param {string} id
   * Manage the mouse events of the panels.
   * @param {string} id The identifier of the panel.
   */
  initEvents: function (index, id) {
    var scope = this,
    paper = scope.papers[index],
    panel = paper.panels[id],
    containerPosition = $('#svg-container_' + index).position(),
    bar = panel.bar,
    padding = 2,
    rect = 'rect',
    fillOpacity = 'fill-opacity',
    bounds = panel.getBoxBounds(),
    paperBounds = {x:containerPosition.left, y:containerPosition.top, w:paper.width, h:paper.height};
    
    bar.drag(
      /* onMouseMove */
      function (dx, dy) {
        var beginBounds = this.beginBounds,
        diffX = dx - beginBounds.x * -1,
        diffY = dy - beginBounds.y * -1;
        
        // set box range for draggable element
        if (diffY < 0) {
          dy = -beginBounds.y;
        } else if (diffY + beginBounds.h - paperBounds.h > 0){
          dy = paperBounds.h - (beginBounds.h + beginBounds.y);
        }
        if (diffX < 0) {
          dx = -beginBounds.x;
        } else if (diffX + beginBounds.w - paperBounds.w > 0){
          dx = paperBounds.w - (beginBounds.w + beginBounds.x);
        }

        var attr = this.type == rect ? {x: beginBounds.x + dx, y: beginBounds.y + dy} : {cx: beginBounds.x + dx, cy: beginBounds.y + dy};
        panel.position(isNaN(attr.x) ? 0 : attr.x, isNaN(attr.y) ? 0 : attr.y);
        bounds = panel.getBoxBounds();
        for (var i = scope.connections.length; i--;) {
          paper.connection(scope.connections[i]);
        }
        paper.safari();
      },
      /* onMouseDrag */
      function () {
        // define the relative coordinates
        this.beginBounds = {
          x: this.type == rect ? this.attr("x") : this.attr("cx"),
          y: this.type == rect ? this.attr("y") : this.attr("cy"),
          w: this.attr('width'),
          h: panel.box.attr('height')
        };
                
        panel.box.animate({
          fillOpacity: .9,
          x: bounds.x - padding/2,
          y: bounds.y - padding/2,
          width: bounds.width + padding,
          height: bounds.height + padding
        }, 150);
      }, 
      /* onMouseUp */
      function () {
        panel.box.animate({
          fillOpacity: 1,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        }, 300);
      }
    );
  }
  
});