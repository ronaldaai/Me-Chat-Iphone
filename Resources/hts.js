var TiHTS = {
config: {
host: null,
port: null,
user: null,
tcpData: null
},
init: function(_host, _port, _user, _tcpData) {
if(!_host || !_port || !_user) {
Ti.API.warn("TiHTS: Missing required instantiation property");
return;
}

TiHTS.config.host = _host;
TiHTS.config.port = _port;
TiHTS.config.user = _user;
},
connect: function() {
if(Ti.Network.networkType == Ti.Network.NETWORK_NONE) {
PopUp("No network connection available");
return;
}

TiHTS.socket = Ti.Network.createTCPSocket({
hostName: TiHTS.config.host,
port: TiHTS.config.port,
stripTerminator: true,
mode: Ti.Network.READ_WRITE_MODE
});

TiHTS.socket.addEventListener("read", TiHTS.handle);
TiHTS.socket.addEventListener("readError", TiHTS.errorRead);
TiHTS.socket.addEventListener("writeError", TiHTS.errorWrite);

try {
Ti.API.info("TiHTS: Connecting to " + TiHTS.socket.hostName + ":" + TiHTS.socket.port);
TiHTS.socket.connect();
StatusBar('Connecting...',1);
} catch(_error) {
Ti.API.info("TiHTS: Could not connect to the socket");
}
},
disconnect: function() {
if(TiHTS.socket.isValid) {
TiHTS.socket.close();
}
},
errorRead: function(_event) {
Ti.API.warn("TiHTS: Socket read error");
PopUp("Connection to server lost!...");
//TiHTS.socket.close();
},
errorWrite: function(_event) {
Ti.API.warn("TiHTS: Socket write error");
},
login: function(_user) {
	Ti.API.info("TiHTS: Logging in " + _user);
	TiHTS.socket.write("LAPP\r\nLOGIN "+_user+"\r\n\r\n");
},
write: function(_tcpData) {
				Ti.API.info("TiHTS: Writing " + _tcpData.length + "/["+_tcpData+"]bytes...");
				TiHTS.socket.write(_tcpData+"\r\n");
},
handle: function(_event) {
var responseCode = _event.data.toString().substr(0,8);
var rspCodeStr = "";

if (responseCode == 'OK LOGIN') {
	rspCodeStr = responseCode;
} else {
	
	var HTSdata = _event.data.toString();
	var HTSdataArr = HTSdata.split("\r\n");		
	
	if (HTSdataArr.length >= 5) {
		rspCodeStr = Ti.Utils.base64decode(HTSdataArr[5]).toString();
		var CMDdataArr = rspCodeStr.split("|");
	} else {
		rspCodeStr = responseCode;
	}
}

//LA^PHB,801,05,12,TWITTER^apanlag0,[http://kplg.co/QtL1 Dewi Perssik Operasi Keperawanan! #KLC],,|725,,,894090843,9460005294217739,ronaldaai,TWITTER^apanlag0,twitter/kapanlagicom,0,[http://kplg.co/QtL1 Dewi Perssik Operasi Keperawanan! #KLC]|730,,,1

Ti.API.info("TiHTS: Receive " + responseCode + "\r\n["+rspCodeStr+"]");

switch(rspCodeStr) {
case "OK LOGIN":
StatusBar('Logged in as ['+imsi+']',1);
Ti.API.info("TiHTS: Logging in");
TiHTS.socket.write("OK\r\n");
break;
case "801,05,12":
StatusBar('Status Change!',1);
TiHTS.socket.write("OK\r\n");
break;
case "725,,,,":
Ti.API.info("TiHTS: Passive mode entered");
break;
case "230":
Ti.API.info("TiHTS: Log in successful");
TiHTS.socket.write("CWD " + TiHTS.config.path + "\n", _event.from);
break;
case "250":
Ti.API.info("TiHTS: Changed active directory to " + TiHTS.config.path);
TiHTS.socket.write("PASV\n");
break;
case "331":
Ti.API.info("TiHTS: Sending credentials");
TiHTS.socket.write("PASS " + TiHTS.config.password + "\n", _event.from);
break;
case "530":
Ti.API.warn("TiHTS: Login failed, disconnecting");
TiHTS.socket.close();
break;
default:
Ti.API.debug("TiHTS: [SERVER] " + rspCodeStr);
TiHTS.socket.write("OK\r\n");
StatusBar('Recevied:'+rspCodeStr,1);
break;
}
}
};