(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['eventemitter2'], factory);
  }
  else {
    root.ROS = factory(root.EventEmitter2);
  }
}(this, function (EventEmitter2) {

  var ROS = function(url) {
    var ros = this;


    // Socket Handler
    // --------------

    var socket = new WebSocket(url);
    socket.onopen = function(event) {
      ros.emit('connection', event);
    };
    socket.onclose = function(event) {
      ros.emit('close', event);
    };
    socket.onerror = function(event) {
      ros.emit('error', event);
    };
    socket.onmessage = function(message) {
      var data = JSON.parse(message.data);
      if (data.receiver) {
        ros.emit(data.receiver, data.msg);
      }
    };

    function callOnConnection(message) {
      var messageJson = JSON.stringify(message);
      if (socket.readyState !== WebSocket.OPEN) {
        ros.once('connection', function() {
          socket.send(messageJson);
        });
      }
      else {
        socket.send(messageJson);
      }
    };


    // Topics
    // ------

    ros.getTopicList = function(callback) {
      ros.once('/rosjs/topics', function(data) {
        callback(data);
      });
      var call = {
        receiver : '/rosjs/topics'
      , msg      : []
      };
      callOnConnection(call);
    };

    ros.Message = function(values) {
      var message = this;
      if (values) {
        Object.keys(values).forEach(function(name) {
          message[name] = values[name];
        });
      }
    }

    ros.Topic = function(options) {
      var topic         = this;
      options           = options || {};
      topic.node        = options.node;
      topic.name        = options.name;
      topic.messageType = options.messageType

      topic.subscribe = function(callback) {
        topic.on('message', function(message) {
          callback(message);
        });

        ros.on(topic.name, function(data) {
          var message = new ros.Message(data);
          topic.emit('message', message);
        });
        var call = {
          receiver : '/rosjs/subscribe'
        , msg      : [topic.name, -1]
        };
        callOnConnection(call);
      };

      topic.unregisterSubscriber = function() {
        ros.removeAllListeners([topic.name]);
        var call = {
          receiver : '/rosjs/unsubscribe'
        , msg      : [topic.name]
        };
        callOnConnection(call);
      };

      topic.publish = function(message) {
        var call = {
          receiver : topic.name
        , msg      : message
        , type     : topic.messageType
        };
        callOnConnection(call);
      };
    };
    ros.Topic.prototype.__proto__ = EventEmitter2.prototype;


    // Services
    // --------

    ros.getServiceList = function(callback) {
      ros.once('/rosjs/services', function(data) {
        callback(data);
      });
      var call = {
        receiver : '/rosjs/services'
      , msg      : []
      };
      callOnConnection(call);
    };

    ros.ServiceRequest = function(values) {
      var serviceRequest = this;
      if (values) {
        Object.keys(values).forEach(function(name) {
          serviceRequest[name] = values[name];
        });
      }
    }

    ros.ServiceResponse = function(values) {
      var serviceResponse = this;
      if (values) {
        Object.keys(values).forEach(function(name) {
          serviceResponse[name] = values[name];
        });
      }
    }

    ros.Service = function(options) {
      var service         = this;
      options             = options || {};
      service.name        = options.name;
      service.serviceType = options.serviceType;

      service.callService = function(request, callback) {
        ros.once(service.name, function(data) {
          var response = new ros.ServiceResponse(data);
          callback(response);
        });
        var requestValues = [];
        Object.keys(request).forEach(function(name) {
          requestValues.push(request[name]);
        });
        var call = {
          receiver : service.name
        , msg      : requestValues
        };
        callOnConnection(call);
      };
    };
    ros.Service.prototype.__proto__ = EventEmitter2.prototype;


    // Params
    // ------

    ros.getParamList = function(callback) {
      ros.once('/rosjs/get_param_names', function(data) {
        callback(data);
      });
      var call = {
        receiver : '/rosjs/get_param_names'
      , msg      : []
      };
      callOnConnection(call);
    };

    ros.Param = function(options) {
      var param  = this;
      options    = options || {};
      param.name = options.name;

      param.get = function(callback) {
        ros.once('/rosjs/get_param', function(value) {
          callback(value);
        });
        var call = {
          receiver : '/rosjs/get_param'
        , msg      : [param.name]
        };
        callOnConnection(call);
      };

      param.set = function(value) {
        var call = {
          receiver : '/rosjs/set_param'
        , msg      : [param.name, value]
        };
        callOnConnection(call);
      };
    }
    ros.Param.prototype.__proto__ = EventEmitter2.prototype;

  };
  ROS.prototype.__proto__ = EventEmitter2.prototype;

  return ROS;

}));

