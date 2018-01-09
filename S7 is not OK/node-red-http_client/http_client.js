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
	
  function client(config){ 
	RED.nodes.createNode(this, config);
    var node = this;
	
	node.on('input', function (msg){
		
  //TO DO 
  //var opcuaServerCfg = msg.payload.OPCUAServerCfg;
  //var servercfg = JSON.stringify(opcuaServerCfg);
  
  console.log("*config* : " + servercfg);
	
	var flowContext = this.context().flow;
	
	var res = request('POST', 'http://localhost:1001/START', {
					'headers': {
						'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
					},
          json:{"deviceInfo":[{"dsName":"Modbus Device","refreshCycle":2.5,"deviceType":"ModBus","nodelist":[{"name":"Temprature-m","unit":"C","address":"1","dataType":"Int","converter":"(value - 27315) / 100:value"},{"name":"Humidity-m","unit":"%","address":"0","dataType":"Int","converter":"value / 100:value"}],"parameters":{"deviceAddr":"192.168.0.18,502,4"}}]}
          //json:opcuaServerCfg
    });  
    var json = res.getBody().toString();
	console.log("***start reture is ***" + json);
	var nodeidlist = JSON.parse(json).OpcUaServerInfo;
				for (let a in msg.payload.aspects) {
					let ds_name = msg.payload.aspects[a].datasource.name;
				
					for (let b in msg.payload.aspects[a].datasource.datapoints) {
						let dp_name = msg.payload.aspects[a].datasource.datapoints[b].name;

						for (let i in nodeidlist) {
						
							if (nodeidlist[i].dsName == ds_name && nodeidlist[i].nodeName == dp_name) {

								console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + nodeidlist[i].dsName);
								console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + nodeidlist[i].nodeName);


								nodeidlist[i].dpId = msg.payload.aspects[a].datasource.datapoints[b].id;
								
								console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + nodeidlist[i].dpId);
								break;
							}
						}
					}
				}
				flowContext.set('nodeidlist', nodeidlist);
				manageStatus('online');
				delete msg.payload.OPCUAServerCfg; 
	            node.send(msg);
	});
    
    function manageStatus(newStatus) {
		var status;
			if (status == newStatus) return;
			status = newStatus;
			node.emit('__STATUS__', {
				status: status
			});
		};

		function onmclconStatus(s) {
			node.status(generateStatus(s.status));

		}

		node.on('__STATUS__', onmclconStatus);

		node.on('close', function (done) {
			console.log("***************close called for stop******************************");
	
			node.context().flow.set('storage', []);
			node.context().flow.set('nodeidlist', []);
			node.removeListener('__STATUS__', onmclconStatus);
			done();
			
		res = request('GET', 'http://localhost:1001/STOP', {
					'headers': {
						'Content-Type': 'application/x-www-form-urlendcoded; charset=utf-8'
					},
				})
			console.log(res.getBody());
				
		});
	};
RED.nodes.registerType("http_client",client);
}