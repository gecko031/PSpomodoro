var currentURL = "";
var arrayAlreadyBlocled = [];
var urlNotificationHtml = "file:///E:/PawelSlepaczuk/pspomodoro/notification.html";
var JSONArrayBlacklist = [];
localStorage.setItem("blacklist", JSON.stringify(JSONArrayBlacklist));

//detect url hostname if url was changed on current tab
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab){
        var domainUrl = new URL(tab.url);
        currentURL = domainUrl.hostname;
        console.log("onUpdatedMonitor",currentURL);
    }
);
//detect url hostname if focus on tab was changed
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectionInfo){
    chrome.tabs.get(tabId, function(tab) {
        var domainUrl = new URL(tab.url);
        currentURL = domainUrl.hostname;
        console.log("onSelectionChangedMonitor",currentURL);
    });
});
//add hostname to blacklist
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.action === "send_to_blacklist"){
            console.log("BLACKLIST button pressed");
            if(isBlacklistMatch(currentURL.toString()) === false) {
                var JSONArrayBlacklist = JSON.parse(localStorage.getItem("blacklist"));
                JSONArrayBlacklist.splice(0, 0, currentURL);
                localStorage.setItem("blacklist", JSON.stringify(JSONArrayBlacklist));
            }
        }
    });
//remove hosntame from blacklist
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.action === "delete_from_blacklist"){
            console.log("DEL button pressed");
            if(isBlacklistMatch(currentURL)) {
                var JSONArrayBlacklist = JSON.parse(localStorage.getItem("blacklist"));
                for(var i=0;i<JSONArrayBlacklist.length; i++){
                    if(JSONArrayBlacklist[i] === currentURL){
                        JSONArrayBlacklist.splice(i,1);
                        localStorage.setItem("blacklist", JSON.stringify(JSONArrayBlacklist));
                    }
                }
            }
        }
    });

chrome.runtime.onInstalled.addListener(function() {
    var timeWork = 25;
    var timeBreak = 5;
    var timeBreakLong = 15;
    var timeWorkQuantity = 4;

    function defaultSettings(){
        console.log("defaultSettings() START");
        var arraySettingsToStore = {
            "Domyslna": [25,5,15,4],
            "Zestaw1": [0,0,0,0],
            "Zestaw2": [0,0,0,0],
            "Zestaw3": [0,0,0,0],
            "Niestandardowa": []//must be empty
        };
        localStorage.setItem("timeSettings", JSON.stringify(arraySettingsToStore));
        console.log("zapisanie do domyslna parametrów do localStorage", arraySettingsToStore);

        console.log("defaultSettings() END");
    }
    defaultSettings();

    var currentTime = "";
    var isStartPressed = false;
    var isBreak = false;
    var isBreakLong = false;
    var isCountdownStopped = false;
    var isCountdownSkipped = false;
    var index = 0;  //counts number of countdown() execution
    var hasEnded = false;

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

        if(request.action === "option_params"){
            console.log("option message reached");
            timeWork = request.data[0];
            timeBreak = request.data[1];
            timeBreakLong = request.data[2];
            timeWorkQuantity = request.data[3];
        }
    });
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            if(!request.action){
                console.log("No action");
            return;
            }
            if(isStartPressed === false) {
                if (request.action === 'start_session') {
                    console.log("start_session request received");
                    isStartPressed = true;
                    console.log("isStartPressed", isStartPressed);
                    if(areParametersValid() === true) {
                        session(timeWork, timeBreak, timeBreakLong, timeWorkQuantity);
                    }else{
                        console.log("Parameters are not valid");
                        console.log("return to default settings");
                        timeWork = 25;
                        timeBreak = 5;
                        timeBreakLong = 15;
                        timeWorkQuantity = 4;
                    }
                }
            }
            if(request.action === 'stop_session'){
                console.log("stop_session request received ");
                isCountdownStopped = true;
                isStartPressed = false;
                isBreak = false;
                isBreakLong = false;
                arrayAlreadyBlocled.splice(0,arrayAlreadyBlocled.length);

            }
            if(request.action === 'skip_session'){
                console.log("skip_session request received ");
                isCountdownSkipped = true;
            }

            function session(timeWork, timeBreak, timeBreakLong, timeWorkQuantity) {

                //Two listeners below are listening to tabs changes and erase them
                //when anything was updated on tab
                chrome.tabs.onUpdated.addListener(
                    function(tabId, changeInfo, tab){
                        var domainUrl = new URL(tab.url);
                        console.log("onUpdated", domainUrl.hostname);
                        if(isBlacklistMatch(domainUrl.hostname) &&
                            isBreak===false &&
                            isBreakLong === false &&
                            arrayAlreadyBlocled.indexOf(domainUrl.hostname) === -1
                        ){//condition with isBreak flag
                            arrayAlreadyBlocled.push(domainUrl.hostname);
                            chrome.tabs.update(tabId, {url: urlNotificationHtml});
                        }
                    }
                );
                //when focus on tab was changed
                chrome.tabs.onSelectionChanged.addListener(function(tabId, selectionInfo){
                    chrome.tabs.get(tabId, function(tab) {
                        var domainUrl = new URL(tab.url);
                        console.log("onSelectionChanged", domainUrl.hostname);
                        if(isBlacklistMatch(domainUrl.hostname) && isBreak===false && isBreakLong === false && arrayAlreadyBlocled.indexOf(domainUrl.hostname) === -1){//condition with isBreak flag
                            arrayAlreadyBlocled.push(domainUrl.hostname);
                            chrome.tabs.update(tabId, {url: urlNotificationHtml});
                        }
                    });
                });

                var arraySession = [];  //array in which following countdown arguments are stored
                //loop to save following setting to an sessionArray
                for(let i=0; i<timeWorkQuantity; i++ ){
                        arraySession.push(timeWork);
                    if(i!==(timeWorkQuantity-1)){
                        arraySession.push(timeBreak);
                    }else{
                        arraySession.push(timeBreakLong);
                    }
                }
                //displays console all the arraySession values
                for(let i=0; i<arraySession.length; i++){
                    console.log("parameter ",i," = ",arraySession[i]);
                }

                console.log("value of index = ",index);

                countdown(arraySession[index]); //initializes countdown()
                function countdown(setMinutes) {
                    var seconds = 60;
                    var minutes = setMinutes;
                    hasEnded = false;
                    index++;

                    function tick() {   //function that is self-executed
                        arrayAlreadyBlocled.splice(0,arrayAlreadyBlocled.length);   //erase entire temp array of domain blocking occurence


                        var port_countdown_monitor = chrome.runtime.connect({name: "currentTime"}); //opens port to long-lived connection
                        var current_minutes = minutes - 1;
                        seconds--;

                        if(isCountdownSkipped === true){    //IF Skip button pressed -> skip countdown()
                            seconds = 0;
                            minutes = 0;
                            isCountdownSkipped = false;
                        }
                        if(isCountdownStopped === true) {    //IF Stop button pressed -> stops entire session()
                            port_countdown_monitor.postMessage({
                                data: currentTime = "00:00"
                            });
                            isBreak = false;
                            isBreakLong = false;
                            isCountdownStopped = false;
                            isStartPressed = false;
                            index = 0;
                            arrayAlreadyBlocled.splice(0, arrayAlreadyBlocled.length);   //erase entire temp array of domain blocking occurence
                            return;
                        }

                        currentTime = (minutes <= 10 ? "0" : "") + current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds);
                        port_countdown_monitor.postMessage({
                            data: currentTime
                        });
                        console.log(currentTime);
                        if (seconds > 0) {
                            setTimeout(tick, 1000);
                        } else {
                            if (minutes > 1) {
                                minutes--;
                                seconds = 60;
                                setTimeout(tick, 1000);
                            } else {
                                if(isBreak !== true && isBreakLong !== true){
                                    console.log("Koniec czasu pracy");
                                    if(isCountdownSkipped === true) {
                                        isCountdownSkipped = false
                                    }else{
                                        alert("Koniec czasu pracy");
                                    }
                                    if(index ===  arraySession.length-1){
                                        isBreakLong = true
                                    }else{
                                        isBreak = true;
                                    }
                                }else if(isBreak === true){
                                    console.log("koniec czasu przerwy");
                                    if(isCountdownSkipped === true) {
                                        isCountdownSkipped = false
                                    }else{
                                        alert("Koniec czasu przerwy");
                                    }
                                    isBreak = false;
                                }else if(isBreakLong === true){
                                    console.log("koniec czasu długiej przerwy");
                                    if(isCountdownSkipped === true) {
                                        isCountdownSkipped = false
                                    }else{
                                        alert("Koniec czasu długiej przerwy");
                                    }
                                }

                                hasEnded = true;
                                if(index < arraySession.length) {
                                    console.log("value of index = ",index);
                                    countdown(arraySession[index]);
                                }else{
                                    alert("koniec sesji");
                                    index = 0;
                                    isStartPressed = false;
                                    arrayAlreadyBlocled.splice(0,arrayAlreadyBlocled.length);   //erase entire temp array of domain blocking occurence

                                    currentTime ="00:00";   //reset display
                                    port_countdown_monitor.postMessage({
                                        data: currentTime
                                    });
                                }
                            }
                        }
                    }
                    tick();
                }
            }
            function areParametersValid(){
                if(timeWork > 0 && timeWork <= 60 &&
                    timeBreak > 0 && timeBreak <= 60 &&
                    timeBreakLong > 0 && timeBreakLong <= 60 &&
                    timeWorkQuantity > 0 && timeWorkQuantity <= 10){//this condition assumes user will set no more than 10 cycles
                    console.log("areParametersValid() return true;");
                    return true;
                }else {
                    console.log("areParametersValid() return false;");
                    return false;
                }
            }
        });
});

function isBlacklistMatch(pattern){
    var currentBlacklist = JSON.parse(localStorage.getItem("blacklist"));
    for(var i=0; i<currentBlacklist.length; i++){
        if(currentBlacklist[i] === pattern){
            return true;
        }
    }
    return false;
}