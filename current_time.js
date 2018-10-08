var display = document.getElementById('display');

chrome.runtime.onConnect.addListener(function(port_countdown_monitor){
    port_countdown_monitor.onMessage.addListener(function(currentTime){
        display.innerHTML = currentTime.data.toString();
    })
});
