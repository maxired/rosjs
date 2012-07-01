var ros = new ROS('ws://localhost:9090');

ros.on('error', function(error) {
  console.log(error);
});


// Topics
// ------

var cmdVel = new ros.Topic({
  node        : 'talker'
, name        : '/cmd_vel'
, messageType : 'geometry_msgs/Twist'
});
console.log('Created topic ' + cmdVel.name);

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
cmdVel.publish(twist);
console.log('Published message on ' + cmdVel.name);

// Subscribe to messages on the /listener topic
var listener = new ros.Topic({
  node        : 'talker'
, name        : '/listener'
, messageType : 'std_msgs/String'
});
console.log('Created topic ' + listener.name);

listener.subscribe(function(message) {
  console.log('Received message on ' + listener.name + ': ' + message.data);
  listener.unregisterSubscriber();
});

// Retrieve list of all active topics in ROS
ros.getTopicList(function(topics) {
  console.log('Current topics in ROS:' + topics);
});


// Services
// --------

// Create a new service client
var addTwoIntsClient = new ros.Service({
  name        : '/add_two_ints'
, serviceType : 'rospy_tutorials/AddTwoInts'
});

// Call the service with a callback for the results
var request = new ros.ServiceRequest({ A: 1, B: 2});
addTwoIntsClient.callService(request, function(result) {
  console.log('Result for service call on ' + addTwoIntsClient.name + ': ' + result.sum);
});

// Retrieve list of all active services in ROS
ros.getServiceList(function(services) {
  console.log('Current services in ROS: ' + services);
});


// Params
// ------

var maxVelX = new ros.Param({
  name: 'max_vel_x'
});

maxVelX.set('sup world');

maxVelX.get(function(value) {
  console.log('Value of ' + maxVelX.name + ' is ' + value);
});

ros.getParamList(function(params) {
  console.log('Current params in ROS: ' + params);
});

