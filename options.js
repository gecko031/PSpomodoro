//declaration of each parameter variables
var timeWork;
var timeBreak;
var timeBreakLong;
var timeWorkQuantity;

var selectIdHandler;
var arrayOptions = [];
var idSelected;
var submitHandler = document.getElementById("IdSave");
var selectedSettingsHandler = document.getElementById("selectedSettingsDisplay");

var arrayStoredSettings;
var JSONSettingsStored;
var areFieldsEmpty = 4;

buttonsDisabled();
displayArray(25,5,15,4);
document.getElementById("setSelect").addEventListener('change', function() {
    idSelected = document.getElementById("setSelect").value;

    if (localStorage.getItem("timeSettings")) {
        arrayStoredSettings = localStorage.getItem("timeSettings");
        JSONSettingsStored = JSON.parse(arrayStoredSettings);

        document.getElementById("IdTimeWork").value = JSONSettingsStored[idSelected][0];
        document.getElementById("IdTimeBreak").value = JSONSettingsStored[idSelected][1];
        document.getElementById("IdTimeBreakLong").value = JSONSettingsStored[idSelected][2];
        document.getElementById("IdTimeWorkQuantity").value = JSONSettingsStored[idSelected][3];
    }
    switch(idSelected){
        case "Domyslna":
            selectedSettingsHandler.innerHTML = idSelected;
            buttonsDisabled();
            break;
        case "Zestaw1":
            selectedSettingsHandler.innerHTML = idSelected;
            buttonsEnabled();
            break;
        case "Zestaw2":
            selectedSettingsHandler.innerHTML = idSelected;
            buttonsEnabled();
            break;
        case "Zestaw3":
            selectedSettingsHandler.innerHTML = idSelected;
            buttonsEnabled();
            break;
        case "Niestandardowa":
            selectedSettingsHandler.innerHTML = idSelected;
            buttonsDisabled();
            break;
        default:
            buttonsDisabled();
    }

    selectIdHandler = document.getElementById("setSelect").id.toString();
});

submitHandler.onclick = function setSessionParameters() {
    if(areParametersEmpty() === false) {
        timeWork = document.getElementById("IdTimeWork").value;
        timeBreak = document.getElementById("IdTimeBreak").value;
        timeBreakLong = document.getElementById("IdTimeBreakLong").value;
        timeWorkQuantity = document.getElementById("IdTimeWorkQuantity").value;

        arrayOptions[0] = timeWork;
        arrayOptions[1] = timeBreak;
        arrayOptions[2] = timeBreakLong;
        arrayOptions[3] = timeWorkQuantity;

        //message to background.js
        chrome.runtime.sendMessage({
            action: "option_params",
            data: arrayOptions
        });
    }else{
        console.log("There are no parameters");
    }
};

//save to localStorage
document.getElementById("saveSet").addEventListener('click', function() {
    idSelected = document.getElementById("setSelect").value;
    var arraySettingsToStore = [
        document.getElementById("IdTimeWork").value,
        document.getElementById("IdTimeBreak").value,
        document.getElementById("IdTimeBreakLong").value,
        document.getElementById("IdTimeWorkQuantity").value
    ];
    JSONSettingsStored = JSON.parse(localStorage.getItem("timeSettings"));
    console.log(JSONSettingsStored);
    JSONSettingsStored[idSelected] = arraySettingsToStore;
    localStorage.setItem("timeSettings", JSON.stringify(JSONSettingsStored));
});

//remove from the localStorage
document.getElementById("removeSet").addEventListener('click', function (){
    idSelected = document.getElementById("setSelect").value;
    var arraySettingsToStore = [0,0,0,0];

    JSONSettingsStored = JSON.parse(localStorage.getItem("timeSettings"));
    console.log(JSONSettingsStored);
    JSONSettingsStored[idSelected] = arraySettingsToStore;
    localStorage.setItem("timeSettings", JSON.stringify(JSONSettingsStored));
    displayArray(0,0,0,0);
});

function buttonsDisabled() {
    document.getElementById("removeSet").disabled = true;
    document.getElementById("saveSet").disabled = true;
}
function buttonsEnabled(){
    document.getElementById("removeSet").disabled = false;
    document.getElementById("saveSet").disabled = false;
}
function areParametersEmpty(){
    if(document.getElementById("IdTimeWork").value){
        areFieldsEmpty--;
    }else if(document.getElementById("IdTimeBreak").value){
        areFieldsEmpty--;
    }else if(document.getElementById("IdTimeBreakLong").value){
        areFieldsEmpty--;
    }else if(document.getElementById("IdTimeWorkQuantity").value){
        areFieldsEmpty--;
    }
    if(areFieldsEmpty === 4){
        areFieldsEmpty = 4;
        return true;
    }else{
        areFieldsEmpty = 4;
        return false;
    }
}
//makes 4 parameters displayed
function displayArray(item1, item2, item3, item4){
    document.getElementById("IdTimeWork").value = item1;
    document.getElementById("IdTimeBreak").value = item2;
    document.getElementById("IdTimeBreakLong").value = item3;
    document.getElementById("IdTimeWorkQuantity").value = item4;
}