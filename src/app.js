var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');
var Vibe = require('ui/vibe');
var username = localStorage["username"];
var platform = localStorage["platform"];
var memId = localStorage["memId"];
var highScore = localStorage["highScore"];
var score = 0;
var url;
var charData;
var globalTimer = 10;
var IntervalID = 0;
var glimmer = 0;
var newGlimmer = '-';

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

var UI = require('ui');

if(localStorage["highScore"] === null) {
    localStorage["highScore"] = 0;
    highScore = 0;
}

if(localStorage["username"] === ""){
	// Text element to inform user
	var text = new UI.Text({
		position: new Vector2(0, 60),
		size: new Vector2(144, 168),
		text:'Please load your \n character info \n via the config screen \n and restart the app',
		font:'GOTHIC_14_BOLD',
		color:'white',
		textOverflow:'wrap',
		textAlign:'center',
		backgroundColor:'black'
	});	
}else{
	// Text element to inform user
	var text = new UI.Text({
		position: new Vector2(0, 60),
		size: new Vector2(144, 168),
		text:'Your Characters \n are loading...',
		font:'GOTHIC_14_BOLD',
		color:'white',
		textOverflow:'wrap',
		textAlign:'center',
		backgroundColor:'black'
	});
}

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

// Create GlimmerText
var glimmerText = new UI.Text({
  position: new Vector2(0, 90),
  size: new Vector2(144, 30),
  text: 'Cur: '+ glimmer,
  font: 'gothic-24-bold',
  color: 'white',
  textAlign: 'center'
});

var glimmerText2 = new UI.Text({
  position: new Vector2(0, 110),
  size: new Vector2(144, 30),
  text: 'New: '+ newGlimmer,
  font: 'gothic-24-bold',
  color: 'white',
  textAlign: 'center'
});


var hashes = [
	{"hash": "3159615086", "name": "Glimmer"}
];

Pebble.addEventListener("showConfiguration", function() {
	console.log("showing configuration");
	Pebble.openURL('http://krisjhamilton.github.io/destiny.html');
});

Pebble.addEventListener("webviewclosed", function(e) {
	console.log("configuration closed");
	//http://forums.getpebble.com/discussion/15172/pebblejs-cloudpebble-unexpected-token-c-at-object-parse-json-error
	if(e.response !="CANCELLED") {
		var options = JSON.parse(decodeURIComponent(e.response));
		console.log(options.day);
		console.log("Options = " + JSON.stringify(options));
		var username = options.username;
		localStorage["username"] = username;
		var platform = options.platform;
		localStorage["platform"] = platform;
		//		var url = options.url;
		//		localStorage["url"] = url;
		console.log(username + platform);
	}
});

if(localStorage["username"] === "") {
	return;
}else{

	if(username){
		ajax(
			{ 
				url: "http://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/"+platform+"/"+username+"/",
				type: 'json'
			},
			function(data) {
				console.log(localStorage["username"]);
				// need to put if statement if memId is not available
				var memId = data.Response[0].membershipId;
				localStorage["memId"] = memId;
				//console.log(memId)
				processAllAjaxCalls();
			},
			function( error ) {
				console.log( 'The ajax request B failed: ' + error );
			});
	}

	function processAllAjaxCalls(data) {
		var username = localStorage["username"];
		var platform = localStorage["platform"];
		var memId = localStorage["memId"]; 
		url = "http://www.bungie.net/Platform/Destiny/"+platform+"/Account/"+memId+"/";
		ajax(
			{ 
				url: url, 
				type: 'json'
			}, function(data) {
				charData=data;
				//processAllAjaxCalls(charData);

				if(memId && charData){
						glimmer = data.Response.data.inventory.currencies[0].value;
            glimmerText.text('Cur: ' + glimmer);
            glimmerText2.text('New: ' + newGlimmer);
            console.log('Glimmer = ' + glimmer);
					//window.show();
					splashWindow.hide();
				}
			}
		);
	}
}

function getGlimmer() {
  var username = localStorage["username"];
  var platform = localStorage["platform"];
  var memId = localStorage["memId"]; 
  url = "http://www.bungie.net/Platform/Destiny/"+platform+"/Account/"+memId+"/";
  ajax(
    { 
      url: url, 
      async: false,
      type: 'json'
    }, function(data) {
      charData=data;
      
      if(memId && charData){
        newGlimmer = data.Response.data.inventory.currencies[0].value;
        console.log('New Glimmer = ' + newGlimmer);
      }
    }
  );
}

// Create the Main Window
var window = new UI.Window();

var card = new UI.Card({
  scrollable: true,
  body: 'Destiny Glimmer Farmer\nby Jordan Chin\n(GT: Drunkueid)'
});

// Create a background Rect
var bgRect = new UI.Rect({
  position: new Vector2(5, 20),
  size: new Vector2(134, 60),
  backgroundColor: 'red'
});

// Add Rect to Window
window.add(bgRect);

// Create TimeText
var timeText = new UI.Text({
  position: new Vector2(0, 25),
  size: new Vector2(144, 30),
  text: "Farm!",
  font: 'bitham-42-bold',
  color: 'black',
  textAlign: 'center'
});

function startTimer(duration, display) {
    display.font('bitham-42-bold');
    display.text('Farm!');
    var timer = duration, minutes, seconds;
    IntervalID = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);
        //console.log(minutes + ":" + seconds);

        if (--timer < 0) {
            //timer = duration;
            display.text('Done!');
            Vibe.vibrate('long');
            clearInterval(IntervalID);
            getGlimmer();
            glimmerText2.text('New: ' + newGlimmer);
            IntervalID = 0;
            bgRect.backgroundColor('red');
        }
    }, 1000);
}

// Add the TimeText
window.add(timeText);
window.add(glimmerText);
window.add(glimmerText2);

window.on('show', function() {
    var display = timeText;
        display.font('bitham-30-black');
        display.text('Waiting');
        bgRect.backgroundColor('red');
});

window.on('accelTap', function(){
    var useTime = 60 * globalTimer,
        display = timeText;
    if (IntervalID === 0) {
        getGlimmer();  
        glimmer = newGlimmer;
        glimmerText2.text('New: -');
        startTimer(useTime, display);
        bgRect.backgroundColor('green');
    }
});

window.on('click', 'select', function() {
    var useTime = 60 * globalTimer,
        display = timeText;
    if (IntervalID === 0) {
        getGlimmer();  
        glimmer = newGlimmer;
        glimmerText2.text('New: -');
        startTimer(useTime, display);
        bgRect.backgroundColor('green');
    }
      
    else {
        display.text('Stopped');
        display.font('bitham-30-black');
        clearInterval(IntervalID);
        getGlimmer();
        glimmerText2.text('New: ' + newGlimmer);
        IntervalID = 0;
        bgRect.backgroundColor('red');
    }     
});

window.on('click', 'up', function() {
    if (IntervalID === 0) {
        if (newGlimmer === "-")
          getGlimmer();  
    score = newGlimmer - glimmer;
    if (score > highScore) {
        highScore = score;
        localStorage["highScore"] = score;
      }
      card.title('Glimmer Score: ' + score);
      card.subtitle('High Score: ' + highScore);
    card.show();
    }      
});

// Show the Window
window.show();

