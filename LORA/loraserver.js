var net = require('net');
var mysql = require('mysql');
var moment = require('moment');
var fs = require('fs');

var HOST = 'X.X.X.X';
var PORT = 5556;
var lastTS = 0;

/* DATABASE Connection */
var con = mysql.createConnection({
  host: "X.X.X.X",
  user: "root",
  password: "agustianto",
  database: "bt_gateway"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("[BTGATEWAY] Database Connected!");
});

net.createServer(function(sock) {
    
    console.log('[BTGATEWAY] CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    sock.on('data', function(data) {
		/* Formatting TimeStamp */
		var now = moment();
		var timeIn = now.format('YYYY-MM-DD HH:mm:ss');
        /* Data Attributes */
		var len = data.length;
		console.log('[INCOMING] '+timeIn+' RemotePort '+sock.remotePort+' EndPoint ' + sock.remoteAddress  + ' Length : ' + len + ' Data : ' + data );
        // sock.write('You said "' + data + '"'); // DATA ECHO *not suitable for BGAN Connection
		
		/* Data Processing */
		var msg = data.toString();
		var msgArray = msg.split("#");
		var data_header = msgArray[0];
		var data_device = msgArray[1].split(" ");
		console.log(msgArray);
		console.log(data_header);
		console.log(data_device);
		var pos = data_device[1] + ',' + data_device[2];
		var logFile = timeIn + ' ' + msgArray[1];
		/* write file */
		fs.writeFile('/var/www/html/vincloud/json/dataIn.txt', logFile, function(err) {
			if (err) throw err;
			console.log('log saved');
		});

		/* insert to database */
		var sql = "INSERT INTO lora_client_data (DEV_ID, USER_ID, LOG_TIME, POS, SOS, SPEED, RAW_DATA) VALUES ('"+data_device[0]+"','TOMMY','"+timeIn+"','"+pos+"','"+data_device[3]+"', '0','"+msgArray[3]+"')";
		
		if (timeIn != lastTS) {
			con.query(sql, function(err, result) {
			if (err) throw err;
				console.log("data inserted to database");	
				lastTS = timeIn;
			});
		}
		if (data_header == "tommy") {
			sock.write('yoih OK');
		}		

    });
    
    sock.on('close', function(data) {
        console.log('[BTGATEWAY] CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('[BTGATEWAY] Server Listening On ' + HOST +':'+ PORT);
