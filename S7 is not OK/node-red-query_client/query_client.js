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
    
   var NodeID = msg.payload.NodeID;
   var Nodeid = JSON.stringify(NodeID);
   
   console.log('*NodeID*:' + Nodeid);
   
      // To do Modbus device
      if (NodeID[0].dsName == "Modbus Device"){
   
      /* @@Read Temprature @@*/

      var res = request('POST','http://localhost:1001/QUERY',{
				'headers': {
				'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
				},
			    json:{"NodeID": {"deviceAddr": NodeID[0].deviceAddr,"nodeAddr": NodeID[0].nodeAddr[1]}}
			});
			var json_tem =res.getBody().toString();
			console.log("****Device-Temprature***: " + json_tem);	
      
      /* @@Read Humidity @@*/
   
      var res = request('POST','http://localhost:1001/QUERY',{
				'headers': {
				'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
				},
			    json:{"NodeID": {"deviceAddr": NodeID[0].deviceAddr,"nodeAddr": NodeID[0].nodeAddr[0]}}
			});
			var json_hum =res.getBody().toString();
			console.log("****Device-Humidity***: " + json_hum);
      
         if (isNaN(json_tem) && isNaN(json_hum)){
          throw 'CfgInfo not recived';
         }
         else{
         msg.payload = "{Temprature: " + json_tem + ", Humidity: " + json_hum + "}";
         console.log("****data from device****" + msg.payload);
         }
      }
      //To do S7 device
      else if (NodeID[1].dsName == "S7 Device"){
         var res = request('POST','http://localhost:1001/QUERY',{
				      'headers': {
			      	'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
			       	},
		  // have to do json Cfg//
    	        json:{"NodeID": {"deviceAddr": NodeID[1].deviceAddr,"nodeAddr": NodeID[1].address[0]}}
         });
			var json = res.getBody().toString();
			console.log("****S7 Device***: " + json);	
          msg.payload = "{DB_VAR_INT:"+json+"}"
      }
      this.send(msg);	
      }
      );
	};
	RED.nodes.registerType("query_client",query_client);
}