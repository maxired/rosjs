var ros = new ROS('ws://localhost:9090');
ros.types([
  'std_msgs/String'
, 'geometry_msgs/Twist'
], function(String, Twist) {
  console.log('Created message types');

  // Pub / Sub
  // ---------

  // Create a new topic, /cmd_vel
  var cmdVel = new ros.topic({
    node        : 'talker'
  , topic       : 'cmd_vel'
  , messageType : Twist
  });
  console.log('Created topic ' + cmdVel.topic);

  // Listen for errors on /cmd_vel
  cmdVel.on('error', function(error) {
    console.log('cmdVel error: ' + error);
  });

  var twist = new Twist({
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
  console.log('Published message on ' + cmdVel.topic);

  // Subscribe to messages on the /cmd_vel topic
  var listener = new ros.topic({
    node        : 'talker'
  , topic       : '/listener'
  , messageType : String
  });
  console.log('Created topic ' + listener.topic);
  listener.subscribe(function(message) {
    console.log('Received message on ' + listener.topic + ': ' + message.data);
  });

  ros.getTopics(function(topics) {
    console.log('Current topics in ROS:' + topics);
  });


  // // Services
  // // --------

  // // Create a new service, add_two_ints
  // var addTwoInts = new ros.service({
  //   service : 'add_two_ints'
  // });

  // // Call the service and with a callback for the results
  // addTwoInts.callService(2, 3, function(results) {
  //   console.log('Result for service call on ' + addTwoInts.service + ': ' + results.sum);
  // });

  ros.getServices(function(services) {
    console.log('Current services in ROS:' + services);
  });


  // // Params
  // // ------

  // // Create a new param socket
  // var maxVelX = new ros.param({
  //   param: 'max_vel_x'
  // });

  // // Get the current value
  // var maxX = maxVelX.get();

  // // Receive notifications when the param is updated
  // maxVelX.on('update', function(value) {
  //   maxX = value;
  // });

  // // Set the param to a value.
  // maxVelX.set(1.0);

});

