var xhr2 = Titanium.Network.createHTTPClient();
var win = Titanium.UI.currentWindow;
var toolActInd = Titanium.UI.createActivityIndicator();

var tableView;
var data=[];
var retry = 0;
var imsi = win.imsi;
var keys = win.keys;
var LOG_username = win.username;
var HTSserver = "127.0.0.1"
win.barColor = '#385292';

function setTimer(timetowait,context) {
 
mt=0;
mtimer = setInterval(function() {
 
    	mt++;
	Ti.API.info(mt);
 
    if(mt==timetowait) {
        // do something;
	clearInterval(mtimer);
 	Ti.App.fireEvent(context);
        }
 
},1000);
};

function StatusBar(myMessage,Action){
	
	switch (Action) {
		case 1:
			toolActInd.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
			toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
			toolActInd.color = 'white';
			toolActInd.message = myMessage;
			toolActInd.align = 'left';
			win.setToolbar([toolActInd],{animated:true});
			toolActInd.show();
			setTimeout(function(){
				toolActInd.hide();
				win.setToolbar(null,{animated:true});
			},2500);
			break;
		case 2:
			toolActInd.hide();
			win.setToolbar(null,{animated:true});
			break;
		}
};

var a = Titanium.UI.createAlertDialog({
	title:'Alert Test',
	message:'Hello World'
});

function PopUp(messageStr)
{
	a.message = messageStr;
	a.show();	
}


//
// CREATE SEARCH BAR
//
var searchBar = Titanium.UI.createSearchBar({
	barColor:'#385292',
	showCancel:false
});

searchBar.addEventListener('return', function(e)
{
searchBar.blur();
});
searchBar.addEventListener('cancel', function(e)
{
searchBar.blur();
});

function insertContacts(con_imsi,username,status_msg,avatar,lastupdated) {  
  
	var db = Titanium.Database.install('db.sqlite','dbaccinfo');  
	var numfound = 0;
	var myquery = 'SELECT count(imsi) as numfound from contacts where imsi like "'+con_imsi+'"';
	var tmpData = db.execute(myquery);	
	numfound = tmpData.fieldByName('numfound');
	tmpData.close();
	
	//PopUp(myquery+'\nResult:['+numfound+']');
		
	if (numfound == "0") {
	 //PopUp('OK!');
     var theData = db.execute('INSERT INTO contacts (imsi, username, status_msg, avatar, lastupdated) VALUES ("'+con_imsi+'","'+username+'", "'+status_msg+'", "'+avatar+'", "'+lastupdated+'")');    
     theData;    
     StatusBar('Added '+username,1);
	}

};



// create first row
var row = Ti.UI.createTableViewRow();
row.backgroundColor = '#576996';
row.selectedBackgroundColor = '#385292';
row.height = 40;
var clickLabel = Titanium.UI.createLabel({
	text:'Click different parts of the row',
	color:'#fff',
	textAlign:'center',
	font:{fontSize:14},
	width:'auto',
	height:'auto'
});
row.className = 'header';
row.add(clickLabel);
data.push(row);

cachedImageView = function(imageDirectoryName, url, imageViewObject)
{
// Grab the filename
var filename = url.split('/');
filename = filename[filename.length - 1];
// Try and get the file that has been previously cached
var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName, filename);

if (file.exists()) {
// If it has been cached, assign the local asset path to the image view object.
imageViewObject.image = file.nativePath;
} else {
// If it hasn't been cached, grab the directory it will be stored in.
var g = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, imageDirectoryName);
if (!g.exists()) {
// If the directory doesn't exist, make it
g.createDirectory();
};

// Create the HTTP client to download the asset.
var xhr = Ti.Network.createHTTPClient();

xhr.onload = function() {
if (xhr.status == 200) {
// On successful load, take that image file we tried to grab before and
// save the remote image data to it.
file.write(xhr.responseData);
// Assign the local asset path to the image view object.
imageViewObject.image = file.nativePath;
};
};

// Issuing a GET request to the remote URL
xhr.open('GET', url);
// Finally, sending the request out.
xhr.send();
};
};


// create update row (used when the user clicks on the row)
function createUpdateRow(text)
{
	var updateRow = Ti.UI.createTableViewRow();
	updateRow.backgroundColor = '#13386c';
	updateRow.selectedBackgroundColor = '#13386c';

	// add custom property to identify this row
	updateRow.isUpdateRow = true;
	var updateRowText = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:20, fontWeight:'bold'},
		text:text,
		width:'auto',
		height:'auto'
	});
	updateRow.className = 'updated_row';
	updateRow.add(updateRowText);
	return updateRow;
}

function rtrim(str, chars) {
	chars = chars || "\\s";
	chars = str.replace(new RegExp("[" + chars + "]+$", "g"), "");
	chars = chars.substring(0,chars.length-1);
	return chars;
}


function pad(number) {
   
     return (number < 10 ? '0' : '') + number;
   
}

function getFriendList(url,imsi){

StatusBar('Loading friendlist...'+imsi,1);

xhr2.open("GET","http://" + url + "?action=BBFRIENDLIST&imsi="+imsi);
xhr2.send();

}

xhr2.onload = function()
{
	
    var http_resp = "";
	var http_resp_arr=[];
	var pos = 0;
	http_resp = this.responseText;
	//http_resp_arr = http_resp.split(",");
	
	//PopUp(http_resp);
	
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	
	
	var myTime = year+''+pad(month)+''+pad(day)+''+pad(hours)+''+pad(minutes);
	
	for (pos = 0; pos < http_resp.length; pos+=252) {
	 user_status = http_resp.substring(pos,pos+1);
	 username = rtrim(http_resp.substring(pos+1,pos+22));
	 con_imsi = rtrim(http_resp.substring(pos+22,pos+39));
	 comments = rtrim(http_resp.substring(pos+39,pos+120));
	 avatar_ext = rtrim(http_resp.substring(pos+120,pos+124));
	 avatar = rtrim(http_resp.substring(pos+124,pos+251));
	 //PopUp('['+pos+']\n'+'['+username+']\n'+'['+con_imsi+']\n'+'['+comments+']\n'+'['+avatar+']\n');
	 insertContacts(con_imsi,username,comments,avatar,myTime);
	};
		
	StatusBar('',2);
	
		
	//data.push(addRow(username,photos,comments));

};

xhr2.onerror = function(e)
{
	//retry++;
	//if (retry >= 3) {
	//	getFriendList('lapp-id.545k.com/livenote/chat_lite.asp',imsi);		
	//	StatusBar('Retrying ['+retry+']...',1);
	//} else {
	//	StatusBar(e.error,1);
	//}
	StatusBar('error loading...',1);
};

getFriendList('lapp-id.545k.com/livenote/chat_lite.asp',imsi);

var db = Titanium.Database.install('db.sqlite','dbaccinfo');
var rows = db.execute('select * from contacts order by username;');

var currentRow = null;
var currentRowIndex = null;

while (rows.isValidRow()) {
    username = rows.fieldByName('username');
    avatar = rows.fieldByName('avatar');	
    comments = rows.fieldByName('status_msg');
    lastseen = rows.fieldByName('lastupdated');
    lastseen_day = lastseen.substring(6,8);
	lastseen_hrmin = lastseen.substring(8,13);

	var row = Ti.UI.createTableViewRow();
	row.selectedBackgroundColor = '#fff';
	row.height = 100;
	row.className = 'datarow';
	row.clickName = 'row';
	
	var photo = Ti.UI.createImageView({
		image:avatar,
		defaultImage:'user.png',
		top:5,
		left:10,
		width:50,
		height:50,
		clickName:'photo'
	});
	
	cachedImageView('cache', avatar, photo);
	
	row.add(photo);
	
	var user = Ti.UI.createLabel({
		color:'#576996',
		font:{fontSize:16,fontWeight:'bold', fontFamily:'Arial'},
		left:70,
		top:2,
		height:30,
		width:200,
		clickName:'user',
		text:username
	});
	row.filter = user.text;
	row.add(user);	

	var fontSize = 16;
	if (Titanium.Platform.name == 'android') {
		fontSize = 14;
	}
	var comment = Ti.UI.createLabel({
		color:'#222',
		font:{fontSize:fontSize,fontWeight:'normal', fontFamily:'Arial'},
		left:70,
		top:21,
		height:50,
		width:200,
		clickName:'comment',
		text:comments
	});
	row.add(comment);

	var calendar = Ti.UI.createView({
		backgroundImage:'dates/'+lastseen_day+'.png',
		bottom:2,
		left:70,
		width:32,
		clickName:'calendar',
		height:32
	});
	row.add(calendar);

	var button = Ti.UI.createView({
		backgroundImage:'commentButton.png',
		top:35,
		right:5,
		width:36,
		clickName:'button',
		height:34
	});
	row.add(button);
	
	var date = Ti.UI.createLabel({
		color:'#999',
		font:{fontSize:13,fontWeight:'normal', fontFamily:'Arial'},
		left:105,
		bottom:5,
		height:20,
		width:100,
		clickName:'date',
		text:'lastseen '+ lastseen_hrmin
	});
	row.add(date);	
	
	data.push(row);

    rows.next();
}
rows.close();


tableView = Titanium.UI.createTableView({
	data:data,
	search:searchBar,
	filterAttribute:'filter',
	backgroundColor:'white'
});

tableView.addEventListener('click', function(e)
{
	Ti.API.info('table view row clicked - source ' + e.source);
	// use rowNum property on object to get row number
	var rowNum = e.index;
	var updateRow = createUpdateRow('You clicked on the '+e.source.clickName);
	tableView.updateRow(rowNum,updateRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.LEFT});
});

win.add(tableView);

Ti.include("hts.js");
TiHTS.init(HTSserver,8030,imsi+".1","");
TiHTS.connect();
setTimeout(function(){
	TiHTS.login(imsi+".1");

	var db = Titanium.Database.install('db.sqlite','dbaccinfo');  
	var myquery = 'SELECT * from account_info where imsi = "'+imsi+'"';
	var tmpData = db.execute(myquery);	
	LOG_username = tmpData.fieldByName('username');
	tmpData.close();


	clickLabel.text = 'Logged in as '+LOG_username;
},3000);

setTimer(300, 'loopTimer');
	Ti.App.addEventListener("loopTimer", function() {
	try {
	TiHTS.login("NOP");
	} catch(e) {
	Ti.API.info(e.description);	
	}
    StatusBar('NOP sent...',1);
	setTimer(300, 'loopTimer');
});



