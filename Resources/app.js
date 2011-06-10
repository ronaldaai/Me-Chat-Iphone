// create tab group
var imsi;
var keys;
var tf1;
var tf2;
var xhr2 = Titanium.Network.createHTTPClient();
var toolActInd = Titanium.UI.createActivityIndicator();
var username;
var password;

var tabGroup = Titanium.UI.createTabGroup();

var win1 = Titanium.UI.createWindow({  
    title:'Me-Chat',
    backgroundColor:'#fff',
	tabBarHidden: true  
});

var win2 = Titanium.UI.createWindow({  
    title:'Settings',
    backgroundColor:'#fff'
});

var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Me-Chat',
    window:win1
});

var tab2 = Titanium.UI.createTab({  
    icon:Titanium.UI.iPhone.SystemIcon.MORE,
    title:'Settings',
    window:win2
});

var a = Titanium.UI.createAlertDialog({
	title:'Alert Test',
	message:'Hello World'
});

//
// ACTIVITY INDICATOR (TOOLBAR)
//

function PopUp(messageStr)
{
	a.message = messageStr;
	a.show();	
}


function addRow(rowTitle,rowType,rowHeader,rowFooter)
{
	var row = Ti.UI.createTableViewRow({height:50});

	switch (rowType) {
		case 1:
		tf1 = Titanium.UI.createTextField({
			color:'#336699',
			height:35,
			top:7,
			left:100,
			width:190,
			hintText:'joe.cody@me-chat.com',
			clearButtonMode:true,
			keyboardType:Titanium.UI.KEYBOARD_ASCII,
			returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE,
			autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			clearOnEdit:false,
			autocorrect:false
		});
		row.add(tf1);
		break;
		case 2:
		tf2 = Titanium.UI.createTextField({
			color:'#336699',
			height:35,
			top:7,
			left:100,
			width:190,
			keyboardType:Titanium.UI.KEYBOARD_ASCII,
			returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
			clearButtonMode:true,
			borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE,
			autocapitalization:Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
			passwordMask:true,
			clearOnEdit:false,
			autocorrect:false
		});
		row.add(tf2);		
		break;
	}

	if (rowHeader != '') {
		row.header = rowHeader;
	}

	if (rowFooter != '') {
		row.footer = rowFooter;
	}
	row.title = rowTitle;
	row.selectionStyle = Ti.UI.iPhone.TableViewCellSelectionStyle.NONE;
	row.className = 'control';
	return row;
}

function StatusBar(myMessage,Action){
	
	switch (Action) {
		case 1:
			toolActInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
			toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
			toolActInd.color = 'white';
			toolActInd.message = myMessage;
			toolActInd.align = 'left';
			win1.setToolbar([toolActInd],{animated:true});
			toolActInd.show();
			break;
		case 2:
			toolActInd.hide();
			win1.setToolbar(null,{animated:true});
			break;
		}
}

function getAccountInfo()
{
	var db = Titanium.Database.install('db.sqlite','dbaccinfo');
	var rows = db.execute('select distinct username,password,imsi,keys from account_info order by lastupdated;');

	while (rows.isValidRow()) {
	    username = rows.fieldByName('username');
	    password = rows.fieldByName('password');	
	    imsi = rows.fieldByName('imsi');
	    keys = rows.fieldByName('keys');
	    rows.next();
	}
	rows.close();
		
	return username+','+password+','+imsi+','+keys;
		
}

function updateAccountInfo(username,password,imsi,keys) 
{  	
	StatusBar('Updating ...',1);
	
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var myTime = year+''+month+''+day+''+hours+''+minutes;

	 var db = Titanium.Database.install('db.sqlite','dbaccinfo');
	 var tryData = db.execute('DELETE from account_info');
	 tryData = db.execute('DELETE from contacts');
     var theData = db.execute('INSERT INTO account_info (lastupdated, username, password, imsi, keys) VALUES ("'+myTime+'","'+username+'","'+password+'", "'+imsi+'", "'+keys+'")');
     theData;

	StatusBar('Updated ...',1);
  
};

function Login(url,username,password)
{

var parameter = Ti.Utils.base64encode(username + ',' + password);	

//PopUp('Username:'+username+'\nPassword:'+password+'\n'+'Parameter:'+parameter);

xhr2.open("GET","http://" + url + "?action=DEVICE.LOGIN&parameter="+parameter);
xhr2.send();

};

xhr2.onload = function()
{
    var http_resp = "";
	var http_resp_arr=[];
    
	http_resp = this.responseText;
	//PopUp(http_resp);
	http_resp_arr = http_resp.split(",");
	imsi = http_resp_arr[3];
    keys = http_resp_arr[4];
	
	if (imsi == "0") {
		PopUp('Username/Password Invalid!');
		StatusBar('',2);
	} else {
		StatusBar('Updating Info...',1);
		var win = Titanium.UI.createWindow({
            imsi:imsi,
            keys:keys,
            username:username,
			url:'menu.js',
			title:'Friend-List'
		});
		updateAccountInfo(tf1.value,tf2.value,imsi,keys);
		tab1.open(win,{animated:true});
		StatusBar('',2);
	}
};

xhr2.onerror = function(e)
{
	StatusBar(e.error,1);

};

// create table view data object
var data = [];
var savedAccountInfo = getAccountInfo();
var savedAccountInfo_Arr = savedAccountInfo.split(",");

var savedUsername = savedAccountInfo_Arr[0];
var savedPassword = savedAccountInfo_Arr[1];
var savedImsi = savedAccountInfo_Arr[2];
var savedKeys = savedAccountInfo_Arr[3];

data[0] = addRow("Username ",1,"Sign-in with your account","release v0.0.1");
data[1] = addRow("Password ",2,"","");

tf1.addEventListener('focus', function(e)
{
	toolActInd.hide();
});

tf2.addEventListener('focus', function(e)
{
	toolActInd.hide();
});


tf1.addEventListener('return', function(e)
{
		if (e.value == '') {
			PopUp('username is required!');
			tf1.focus();
		} else {
			tf2.focus();
		}
});

tf2.addEventListener('return', function(e)
{
		if (e.value == '') {
			PopUp('password is required!');
			tf2.focus();
		} else {
				StatusBar('Signing-In...',1);
				Login('localhost/login.php',tf1.value,tf2.value);
		}
});

// create table view
var tableViewOptions = {
		data:data,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED
	};

var tableview = Titanium.UI.createTableView(tableViewOptions);

// create table view event listener
win1.addEventListener('focus', function()
{
	Ti.API.info('window focus fired');
});

// add table view to the window
win1.add(tableview);

if (savedUsername != 'undefined') {
	tf1.value = savedUsername;
	tf2.value = savedPassword;
	
	//alert(savedImsi+'\n'+savedKeys);

	var win = Titanium.UI.createWindow({
        imsi:savedImsi,
        keys:savedKeys,
		url:'menu.js',
		title:'Friend-List'
	});
	tab1.open(win,{animated:true});

}

//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();



