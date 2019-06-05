var counterStart = document.getElementById('counterStart');
var counterStop = document.getElementById('counterStop');
var counterSkip = document.getElementById('counterSkip');
var buttonBlacklist = document.getElementById('buttonBlacklist');
var buttonDeleteBlacklist = document.getElementById('buttonDeleteBlacklist');

counterStart.onclick = function () {
    chrome.runtime.sendMessage({
        action: 'start_session'
    });
};
counterStop.onclick = function () {
    chrome.runtime.sendMessage({
        action: 'stop_session'
    })
};
counterSkip.onclick = function () {
    chrome.runtime.sendMessage({
        action: 'skip_session'	
    })
};
buttonBlacklist.onclick = function () {
    chrome.runtime.sendMessage({
        action: 'send_to_blacklist'
    })
};
buttonDeleteBlacklist.onclick = function () {
    chrome.runtime.sendMessage({
        action: 'delete_from_blacklist'
    })
};