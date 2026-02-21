
let profile = document.querySelector("#admin-btn")

if(document.cookie.split(";").includes("email")){

    profile.innerHTML = '<button id ="admin-btn" src="PostPg.html" >Post an Event<button>';

}