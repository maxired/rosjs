var ROS = (function() {

  var socket = null;
  var handlers = {};

  var ros = function(url) {
    var that = this;
    socket = new WebSocket(url);

    socket.onopen = function(event) {
      that.emit('connection', event);
    };

    socket.onclose = function(event) {
      that.emit('close', event);
    };

    socket.onerror = function(event) {
      that.emit('error', event);
    };

    socket.onmessage = function(message) {
      var data = JSON.parse(message.data);
      if (handlers[data.receiver]) {
        handlers[data.receiver](data.msg);
      }
    };
  };
  ros.prototype.__proto__ = EventEmitter2.prototype;

  ros.prototype.getTopics = function(callback) {
    handlers['/rosjs/topics'] = function(data) {
      callback(data);
    };
    var call = {
      receiver : '/rosjs/topics'
    , msg      : []
    };
    socket.send(JSON.stringify(call));
  };

  ros.prototype.getServices = function (callback) {
    handlers['/rosjs/services'] = function(data) {
      callback(data);
    };
    var call = {
      receiver : '/rosjs/services'
    , msg      : []
    };
    socket.send(JSON.stringify(call));
  };

  ros.prototype.types = function(messageTypes, callback) {
    var that = this;

    function fetchMessageTypes() {
      var messages = [];
      messageTypes.forEach(function(messageType) {
        details = {
          messageType: messageType
        };
        var message = buildMessage(details);
        messages.push(message);
      });

      callback.apply(that, messages);
    }

    if (socket.readyState !== WebSocket.OPEN) {
      that.on('connection', fetchMessageTypes);
    }
    else {
      fetchMessageTypes();
    }
  };

  ros.prototype.topic = function(options) {
    var that = this;

    options = options || {};
    this.node        = options.node;
    this.topic       = options.topic;
    this.messageType = options.messageType

    this.subscribe = function(callback) {

      this.on('message', function(message) {
        callback(message);
      });

      handlers[this.topic] = function(data) {
        var message = new that.messageType(data);
        that.emit('message', message);
      };
      var call = {
        receiver : '/rosjs/subscribe'
      , msg      : [
          this.topic
        , -1
        ]
      };
      socket.send(JSON.stringify(call));
    };

    this.publish = function(message) {
      var call = {
        receiver : this.topic
      , msg      : message.toJSON()
      , type     : this.messageType.messageType
      }

      socket.send(JSON.stringify(call));
    };
  };
  ros.prototype.topic.prototype.__proto__ = EventEmitter2.prototype;

  ros.prototype.service = function(options) {
    options = options || {};
    this.node    = options.node;
    this.service = options.service;

    this.callService = function(args, callback) {

    };
  };
  ros.prototype.service.prototype.__proto__ = EventEmitter2.prototype;

  ros.prototype.param = function(options) {
    this.node  = options.node;
    this.param = options.param;
    this.value = options.value;

    this.on('update', function(value) {
      this.value = value;
    });

    this.get = function() {
      return this.value;
    };

    this.set = function(value) {

    };
  }
  ros.prototype.param.prototype.__proto__ = EventEmitter2.prototype;

  function buildMessage(details) {
    function message(values) {
      if (!(this instanceof message)) {
        return new message(values);
      }

      var that = this;
      if (values) {
        Object.keys(values).forEach(function(name) {
          that[name] = values[name];
        });
      }

      this.toJSON = function() {
        var object = {}
        Object.keys(that).forEach(function(name) {
          if (name !== 'messageType') {
            object[name] = that[name];
          }
        });
        return object;
      };
    }

    message.messageType = details.messageType;

    return message;
  }

  return ros;

}());

