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

  ros.prototype.services = function(serviceTypes, callback) {
    var that = this;

    function fetchServiceTypes() {
      var services = [];
      serviceTypes.forEach(function(serviceType) {
        details = {
          serviceType: serviceType
        };
        var service = buildService(details);
        services.push(service);
      });

      callback.apply(that, services);
    }

    if (socket.readyState !== WebSocket.OPEN) {
      that.on('connection', fetchServiceTypes);
    }
    else {
      fetchServiceTypes();
    }
  };

  ros.prototype.service = function(options) {
    var that = this;
    options = options || {};
    this.name        = options.name;
    this.serviceType = options.serviceType;

    this.callService = function(service, callback) {
      handlers[that.name] = function(data) {
        var response = new that.serviceType.response(data);
        callback(response);
      };
      var call = {
        receiver : that.name
      , msg      : service.toJSON()
      };
      socket.send(JSON.stringify(call));
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

  function buildService(details) {

    function request(values) {
      if (!(this instanceof request)) {
        return new request(values);
      }

      var that = this;
      if (values) {
        Object.keys(values).forEach(function(name) {
          that[name] = values[name];
        });
      }

      this.toJSON = function() {
        var values = []
        Object.keys(that).forEach(function(name) {
          if (typeof that[name] !== 'function') {
            values.push(that[name]);
          }
        });
        return values;
      };
    }

    function response(values) {
      if (!(this instanceof response)) {
        return new response(values);
      }

      var that = this;
      if (values) {
        Object.keys(values).forEach(function(name) {
          that[name] = values[name];
        });
      }

      this.toJSON = function() {
        var values = []
        Object.keys(that).forEach(function(name) {
          if (typeof that[name] !== 'function') {
            values.push(that[name]);
          }
        });
      };
    }

    return {
      request  : request
    , response : response
    , name     : details.serviceType
    };
  }

  return ros;

}());

