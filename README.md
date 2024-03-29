Ros.js provides the core JavaScript API for interacting with
[ROS](http://ros.org) via the web. Ros.js supports publishing and subscribing to
topics, getting and setting parameters, and calling services in ROS.

Ros.js uses [rosbridge](http://rosbridge.org/) on the backend and connects to
the server with WebSockets.

## Table of Contents

 * [How To](#how-to)
   * [Connect to ROS](#connect-to-ros)
   * [Publish a topic](#publish-a-topic)
   * [Subscribe to a topic](#subscribe-to-a-topic)
   * [Call a service](#call-a-service)
   * [Set a param value](#set-a-param-value)
   * [Get a param value](#get-a-param-value)
   * [Get ROS system info](#get-ros-system-info)
 * [Understanding Events](#understanding-events)
 * [Handling Errors](#handling-errors)
 * [License](#license)

## How To

#### Connect to ROS

```javascript
// Connects to the rosbridge WebSocket server.
var ros = new ROS('ws://localhost:9090');
```

#### Publish a topic

```javascript
// ros.Topic provides publish and subscribe support for a ROS topic.
// Creates a geometry_msgs/Twist topic named /cmd_vel.
var cmdVel = new ros.Topic({
  node        : 'talker'
, name        : '/cmd_vel'
, messageType : 'geometry_msgs/Twist'
});

// ros.Message contains the data to publish.
var twist = new ros.Message({
  angular: {
    x: 1
  , y: 0
  , z: 0
  }
, linear: {
    x: 0
  , y: 0
  , z: 0
  }
});

// The geometry_msgs/Twist message will be published in ROS.
cmdVel.publish(twist);
```

#### Subscribe to a topic

```javascript
// Create a std_msgs/String topic named /listener.
var listener = new ros.Topic({
  node        : 'chat'
, name        : '/listener'
, messageType : 'std_msgs/String'
});

// Any time a message is published to the /listener topic, the callback will
// fire.
listener.subscribe(function(message) {
  // message is an instance of ros.Message.
  console.log('Received message ' + message.data);
});
```

#### Call a service

```javascript
// ros.Service provides an interface to calling ROS services.
// Creates a rospy_tutorials/AddTwoInts service client named /add_two_ints.
var addTwoIntsClient = new ros.Service({
  name        : '/add_two_ints'
, serviceType : 'rospy_tutorials/AddTwoInts'
});

// ros.ServiceRequest contains the data to send in the service call.
var request = new ros.ServiceRequest({ A: 1, B: 2});

// Calls the rospy_tutorials/AddTwoInts service with the result stored in the
// callback.
addTwoIntsClient.callService(request, function(result) {
  console.log('Result for service call on ' + addTwoIntsClient.name + ': ' + result.sum);
});
```

#### Set a param value

```javascript
// ros.Param interfaces with the ROS Parameter Server.
var maxVelX = new ros.Param({
  name: 'max_vel_x'
});

// Sets the ROS param value.
maxVelX.set(0.75);
```

#### Get a param value

```javascript
var maxVelX = new ros.Param({
  name: 'max_vel_x'
});

// Fetches and returns the param value in the callback.
maxVelX.get(function(value) {
  console.log('Value of ' + maxVelX.name + ' is ' + value);
});
```

#### Get ROS system info

```javascript
// Retrieves the current list of topics in ROS
ros.getTopicList(function(topics) {
  console.log('Current topics in ROS: ' + topics);
});
```

```javascript
// Fetches list of all active services in ROS
ros.getServiceList(function(services) {
  console.log('Current services in ROS: ' + services);
});
```

```javascript
// Gets param names stored in the ROS Parameter Server
ros.getParamList(function(params) {
  console.log('Current params in ROS: ' + params);
});
```


## Understanding Events

Ros.js follows the [Observer patter](http://answers.oreilly.com/topic/2190-two-examples-of-the-observer-pattern-in-javascript/), emitting (publishing) and listening (subscribing) to events.

[EventEmitter2](https://github.com/hij1nx/EventEmitter2) provides event support
to ros.js. The ROS, Topic, Service, and even Param objects all extend
EventEmitter2 and emits events. For example, when the ROS object connects to the
server, a 'connection' event is emitted. When a message is received for a topic,
the 'message' event is emitted on that topic object.

To listen for an event, use on() like in the examples below:

```javascript
var ros = new ROS('ws://localhost:9090');
ros.on('connection', function() {
  // This code will only be executed after ROS has connected to the server.
});

ros.on('close', function() {
  // This code will be executed when the connection to ROS disconnects.
});
```

## Handling Errors

As described in the Events section, every ros.js class emits events. Errors are
communicated as 'error' events. For example, the ros object will emit an 'error'
event whenever there's an issue with ROS and a topic object will emit an event
when there's an error publishing or subscribing to that topic.

It is highly recommended to at least listen for errors from the ros object, like so:

```javascript
var ros = new ROS('ws://localhost:9090');
ros.on('error', function(error) {
  console.log('There was an error with ROS: ' + error);
});
```

## License

The code is released under the BSD license. See the LICENSE file for details.

