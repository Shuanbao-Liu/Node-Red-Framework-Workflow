module.exports = function (RED){
	var request = require('sync-request');
	function generateStatus(status) {
		var obj;
		switch (status) {
			case 'online':
				obj = {
					fill: 'green',
					shape: 'dot',
					text: ("ONLINE")
				};
				break;
			case 'badvalues':
				obj = {
					fill: 'red',
					shape: 'ring',
					text: ("OFFLINE")
				};
				break;

		}
		return obj;
	}	
	
	
	function query_client(config){ 
	RED.nodes.createNode(this, config);

        var node = this;
		
        this.on('input', function (msg) {
    
   /* @@Read Temprature @@*/
   
   var NodeID = msg.payload.NodeID;
   
   console.log('*NodeID*:' + NodeID)
  
   var deviceInfo = JSON.stringify(NodeID);
   
   console.log("*deviceInfo*: " + deviceInfo);

    var res = request('POST','http://localhost:1001/QUERY',{
				'headers': {
				'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
				},
			    json:{"NodeID": {"deviceAddr": NodeID.deviceAddr,"nodeAddr": NodeID.nodeAddr[1]}}
			});
			var json_tem =res.getBody().toString();
			console.log("****Device-Temprature***: " + json_tem);	
      
   /* @@Read Humidity @@*/
   
      var res = request('POST','http://localhost:1001/QUERY',{
				'headers': {
				'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
				},
			    json:{"NodeID": {"deviceAddr": NodeID.deviceAddr,"nodeAddr": NodeID.nodeAddr[0]}}
			});
			var json_hum =res.getBody().toString();
			console.log("****Device-Humidity***: " + json_hum);
      
      if (isNaN(json_tem) && isNaN(json_hum)){
          throw 'CfgInfo not recived';
      }
      else{
         msg.payload = "{1: " + json_tem + ", 0 : " + json_hum + " }";
         console.log("****data from device****" + msg.payload);
      }
      this.send(msg);	
      // }
      }
      );
	};
	RED.nodes.registerType("query_client",query_client);
}