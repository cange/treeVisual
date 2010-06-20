var Application = $.inherit({

  /** @type {SVGElement} */
  paper: {},
  boxes: {},
  connections: [],

  __constructor: function (selector) {
    // indicator for the css
    $('html').addClass('js');
    
    var $window = $(window),
    paper = (this.paper = Raphael(selector || "canvas", $window.width(), $window.height()));
    this.getData(this.serialize);
    
    // resizing    
    $window.resize(function () {
      paper.setSize($window.width(), $window.height())
    });
    $window.trigger('resize');
  },
  
  /**
   * Manage the mouse events of the boxes.
   * @param {string} id The identifier of the box.
   */
  initEvents: function (id) {
    var box = this.boxes[id],
    padding = 2,
    scope = this,
    bounds = box.getBoxBounds();
    function dragger () {
      // define the relative coordinates
      this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
      this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
      this.animate({
        "fill-opacity": .9,
        x: bounds.x - padding/2,
        y: bounds.y - padding/2,
        width: bounds.width + padding,
        height: bounds.height + padding
      }, 150);
    };
    
    function move (dx, dy) {
      var att = this.type == "rect" ? {x: this.ox + dx, y: this.oy + dy} : {cx: this.ox + dx, cy: this.oy + dy};
      box.position(att.x, att.y);
      bounds = box.getBoxBounds();
      for (var i = scope.connections.length; i--;) {
        scope.paper.connection(scope.connections[i]);
      }
      scope.paper.safari();
    };
    
    function up () {
      this.animate({
        "fill-opacity": 1,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      }, 300);
    }
    
    box.box.attr({cursor: 'move'});
    box.box.drag(move, dragger, up);
  },
  
  /**
   * Create and positioned the boxes.
   */
  serialize: function () {
    var scope = this,
    boxBefore = false,
    absolutePosition = 0,
    $contents = $('#texts li');
    
    // create SVG elements
    $.map(this.datas, function (data, index) {
      var $content = $contents.eq(index).addClass(data.id),
      box = scope.boxes[data.id] = new jSvg.Box(scope.paper, data, $content),
      x = y = space = 50;
      
  	  // position
      if (index > 0 && boxBefore) {
  	    var boundsBefore = boxBefore.getBoxBounds();
  	    x = (boxBefore.data.bindings.length == data.bindings.length ? boundsBefore.right+ space : boundsBefore.left);
  	    y = space + (data.bindings.length > 0 ? boundsBefore.bottom : 0);
  	  }
  	  
  	  box.position(x, y);
    	boxBefore = box;
    });
    
    scope.serializeConnection();
  },
  
  /**
   * Connects the box with each other.
   */
  serializeConnection: function () {
    var scope = this;
    // add connections an events
    $.map(this.datas, function (data, index) {
      var boxes = scope.boxes,
      box = boxes[data.id];
      
      box.activeBinds = [];
  	  // connections
      $.map(data.bindings, function (id) {
    	  var hasAlreadyConnection = $.grep($(boxes[id].activeBinds), function (activeBind) {
      		return activeBind == data.id;
    	  }).length > 0;

        if (!hasAlreadyConnection) {
          var connection = new jSvg.Connection(scope.paper, box.box, boxes[id].box);
    		  scope.connections.push(connection.connection);
  	    	box.activeBinds.push(id); 
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
    $('#texts li').each(function () {
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