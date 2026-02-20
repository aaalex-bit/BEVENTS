/**
* @param {string} title -title of the event
* @param {string} from - from which club
* @param {Date} date - The date object
* @param {string} linkToWebsite 
* @param {string} details
* @param {boolean} IsScraped
* @param {Time} timeStart - Time Object
* @param {Time} timeEnd -Time Object
* @param {string} image
*/
class Card{
    constructor(title,from,image, date,timeStart, timeEnd, linkToWebsite, details, IsScraped){
        this.title = title;
        this.from = from
        this.linkToWebsite = linkToWebsite;
        this.details = details;
        this.IsScraped = IsScraped;
        

        if(typeof image !== 'string'){
            this.image  = "../Assets/logo.png"//placeholder      
        }else{
      
            this.image = image;  
        }


        if(typeof date !== 'Date'){//ensuring Object
             throw console.error("variable date is type Date(day, month)");
        }else{
             this.date = date;
            
        }

        if(typeof timeStart  !== "Time" ){
            throw console.error("Variable time is type Time(hour, minute, standard)")
        }


    }

}



class Time{
    constructor( hour,minute, standard){
        this.hour = hour;
        this.minute = minute;
        this.standard = standard;
    }


}

class Date{
    constructor(day, month){
        this.day = day;
        this.month = month;

    }
}



