var Application = $.inherit({

  /** @type {SVGElement} */
  paper: {},
  panels: {},
  connections: [],
  
  /** @type {jQueryObject} */
  $elems: [],

  __constructor: function (selector) {
    // indicator for the css
    $('html').addClass('js');
    this.$elems = $('ul li');
    
    var $window = $(window),
    paper = (this.paper = Raphael(selector || 'canvas', $window.width(), $window.height()));
    this.getData(this.serialize);
    
    // resizing    
    $window.resize(function () {
      paper.setSize($window.width(), $window.height())
    });
    $window.trigger('resize');
  },
  
  /**
   * Manage the mouse events of the panels.
   * @param {string} id The identifier of the panel.
   */
  initEvents: function (id) {
    var scope = this,
    panel = scope.panels[id],
    bar = panel.bar,
    padding = 2,
    rect = 'rect',
    fillOpacity = 'fill-opacity',
    bounds = panel.getBoxBounds();
    
    bar.drag(
      /* onMouseMove */
      function move (dx, dy) {
        var att = this.type == rect ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
        panel.position(att.x, att.y);
        bounds = panel.getBoxBounds();
        for (var i = scope.connections.length; i--;) {
          scope.paper.connection(scope.connections[i]);
        }
        scope.paper.safari();
      },
      /* onMouseDrag */
      function () {
        // define the relative coordinates
        this.ox = this.type == rect ? this.attr("x") : this.attr("cx");
        this.oy = this.type == rect ? this.attr("y") : this.attr("cy");
        
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
  },
  
  /**
   * Create and positioned the panels.
   */
  serialize: function () {
    var scope = this,
    panelBefore = false,
    absolutePosition = 0,
    $elems = this.$elems;
    
    // create SVG elements
    $.map(this.datas, function (data, index) {
      var $elem = $elems.eq(index),
      panel = scope.panels[data.id] = new jSvg.Box(scope.paper, data, $elem),
      margin = panel.box.style.margin,
      x = spaceX = margin.horizontal,
      y = spaceY = margin.vertical;
      
      // position
      if (index > 0 && panelBefore) {
        var boundsBefore = panelBefore.getBoxBounds();
        x = (panelBefore.data.bindings.length == data.bindings.length ? boundsBefore.right + spaceX : boundsBefore.left);
        y = spaceY + (data.bindings.length > 0 ? boundsBefore.bottom : 0);
      }
      
      panel.position(x, y);
      panelBefore = panel;
    });
    
    scope.serializeConnection();
  },
  
  /**
   * Connects the panel with each other.
   */
  serializeConnection: function () {
    var scope = this;
    // add connections an events
    $.map(this.datas, function (data, index) {
      var panels = scope.panels,
      panel = panels[data.id];
      
      panel.activeBinds = [];
      // connections
      $.map(data.bindings, function (id) {
        var hasAlreadyConnection = $.grep($(panels[id].activeBinds), function (activeBind) {
          return activeBind == data.id;
        }).length > 0;

        if (!hasAlreadyConnection) {
          var connection = new jSvg.Connection(scope.paper, panel.box, panels[id].box);
          scope.connections.push(connection.connection);
          panel.activeBinds.push(id); 
        }
      });
      scope.initEvents(data.id);
    });
  },
  
  /**
   * Collect data in an JSON object and call an callback after that.
   * @param {function} callback
   */
  getData: function (callback) {
    var datas = [];
    this.$elems.each(function () {
      var $elem = $(this),
      binds = $elem.attr('data-binds');
      binds = typeof binds != 'undefined' ? binds.split(/ /) : [];
      datas.push({
        id: this.id, 
        bindings: binds, 
        status: $elem.hasClass('active')
      });
    });
    this.datas = datas;
    callback.apply(this);
  }
  
});