import Time from '../Model/Card';

/*
<script src="https://cdn.jsdelivr.net/npm/add-to-calendar-button@2" async defer></script>
*/ 

const eventButton = document.createElement("add-to-calendar-button")
eventButton.className(".event-Btn")
document.querySelector(".event-Btn").replaceWith(eventButton)


/**
 * 
 * @param {Card} card 
 */

function addInfo(card){// function handles adding the files to calendar
    eventButton.name= card.title
    eventButton.startDate= card.date
    eventButton.endDate = card.date
    eventButton.startTime= card.timeStart
    eventButton.endTime= card.endTime
    eventButton.location= card.location
    eventButton.description= card.details
    eventButton.options='["Apple","Google","iCal","Outlook.com","Yahoo"]'
    eventButton.icsFile="Event_.ics"
    
}

addInfo()