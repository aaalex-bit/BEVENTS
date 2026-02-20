import Time from '../Model/Card';

/*

<script src="https://cdn.jsdelivr.net/npm/add-to-calendar-button@2" async defer></script>
*/ 

const eventButton = document.createElement("add-to-calendar-button")
eventButton.className(".event-Btn")
document.querySelector(".event-Btn").replaceWith(eventButton)

eventButton.addEventListener('click',()=>{

});

function addInfo(){
    eventButton.name="Conference 2025"
    eventButton.startDate="2025-03-15"
    eventButton.startTime="09:00"
    eventButton.endTime="17:00"
    eventButton.location="Convention Center"
    eventButton.description="Annual Tech Conference"
    eventButton.options='["Apple","Google","iCal","Outlook.com","Yahoo"]'
    eventButton.icsFile="Event_.ics"
    
}

addInfo()