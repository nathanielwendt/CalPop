//To-Do Make the div elements very uniquely identified so as not to conflict with many other page types
//To-Do Check the Unsafe Header Connection Error
//To-Do Make closing the box from pop-up also delete elements
//To-Do Add error checking and reporting

CALPOP_ERRORS = new Array();
CALPOP_ERROR_COUNT = 0;
EVENTS = new Array();
EVENT_COUNT = 0;


function addCalendarEvent(start_date,start_time,end_date,end_time,time_zone,name,description,color_code){
     var color = 1; //default value
     if(color_code == "blue")
          color = 1;
     else if(color_code == "cyan")
          color = 2;
     else if(color_code == "purple")
          color = 3;
     else if(color_code == "red")
          color = 4;
     else if(color_code == "yellow")
          color = 5;
     else if(color_code == "orange")
          color = 6;
     else if(color_code == "green")
          color = 10;
     var event_template = {
          "end": {
           //"date": "",
           //"dateTime": "",
           //"timeZone": ""
          },
          "start": {
           //"date": "",
           //"dateTime": "",
           //"timeZone": ""
          }
          //"summary": "",
          //"colorId": "",
          //"description": ""
    };
    if(start_date === "" || end_date === "" || time_zone === "")
         CALPOP_ERRORS[CALPOP_ERROR_COUNT++] = "undefined mandatory variables";
    if(start_time === "" && end_time === ""){
         event_template.end.date = end_date;
         event_template.start.date = start_date;
    }
    else{
         event_template.end.dateTime = end_date + "T" + end_time;
         event_template.start.dateTime = start_date + "T" + start_time;
         event_template.start.timeZone = time_zone;
         event_template.end.timeZone = time_zone;
    }
    if(name !== "")
         event_template.summary = name;
    if(description !== "")
         event_template.description = description;
    if(color !== "")
         event_template.colorId = color;
    
    EVENTS[EVENT_COUNT++] = event_template;
}

function SendInsertEvent(json_object,calendarID,access_key){
     var http = new XMLHttpRequest();
     var url = 'https://www.googleapis.com/calendar/v3/calendars/' + calendarID + '/events';

     var json_string = JSON.stringify(json_object);
     http.open("POST", url, true);
     http.setRequestHeader("Content-Type", "application/json");
     http.setRequestHeader("Authorization","Bearer " + access_key);
     http.setRequestHeader("Connection", "close");

     http.onreadystatechange = function() {//Call a function when the state changes.
             if(http.readyState == 4 && http.status == 200) {
                     //alert(http.responseText);
             }
     }
     http.send(json_string);
}

function showCalendarEvents(calendarID,access_key){
     $('#dialog').append("<br /><br /><br />");
     for(var i = 0; i < EVENTS.length; i++){
          
          $('#dialog').append("<button class='calsnap-calendar-event' data-calsnap-calendar-event-id='" + i + "'> " + EVENTS[i].summary + "</button>");
          $('#dialog').append("<input type='checkbox' data-calsnap-calendar-event-id='" + i + "' />");
          $('#dialog').append("<br />");
     } 
     $('#dialog').append("<button id='calsnap-calendar-grandmaster-submit'>Add Events </button>");
     $("#dialog").append("<br /><br />");
     
     $( ".calsnap-calendar-event" )
      .button()
      .click(function( event ) {
          event.preventDefault();
          //$(this).hide();
          //SendInsertEvent(EVENTS[ $(this).attr('data-calsnap-calendar-event-id') ],calendarID,access_key);
          var next_checkbox = $(this).next('[type=checkbox]');
          if(!next_checkbox.is(':checked'))
               next_checkbox.prop('checked', true);
          else
               next_checkbox.prop('checked', false);
     });
     
     $( "#calsnap-calendar-grandmaster-submit" )
      .button()
      .click(function( event ) {
          event.preventDefault();
          var elements_to_add = new Array();
          var checked_events = $(":checked");
          checked_events.each(function(){
               elements_to_add.push( $(this).attr('data-calsnap-calendar-event-id'));
          });
          for(var i = 0; i < elements_to_add.length; i++){
               SendInsertEvent(EVENTS[elements_to_add[i]],calendarID,access_key);
          }
          $('#dialog').empty();
          $('#dialog').append("Your events have been added.  Thank you for using CalSnap!");
          setTimeout(function(){$( 
               "#dialog" ).dialog( "close" );           
               $('.ui-dialog').remove();
               $('#dialog').remove();
          },3000);

     });
}

function extractCalendarNames(parsed_json,access_key){
     var calendarID2 = parsed_json.items[2].id;
     var calendar_summaries = new Array();
     var calendar_ids = new Array();

     $("body").append("<div id='dialog' title='CalSnap' style='width:400px; height:600px;'>Select the Events you would like to add:<br /><br /></div>");
     $( "#dialog" ).dialog({
          width: 600,
          top: "200px"
     });
     
     $("#dialog").dialog("widget").animate({
        top: "25%"
    }, 400);
     
     for(var i = 0; i < parsed_json.items.length; i++){
          calendar_summaries.push( parsed_json.items[i].summary );
          calendar_ids.push( parsed_json.items[i].id );
          $("#dialog").append("<button class='calsnap-calendar-option' data-calsnap-calendar-id='" + calendar_ids[i] + "'> " + calendar_summaries[i] + "</button>");
     }
     $("#dialog").append("</div>");
     
     $( ".calsnap-calendar-option" )
      .button()
      .click(function( event ) {
          event.preventDefault();
          $('#dialog').append("Adding to Calendar: " + $(this).text());
          $( ".calsnap-calendar-option" ).hide();
          showCalendarEvents( $(this).attr('data-calsnap-calendar-id'), access_key );
     });

}


$.getScript("http://www.nathanielwendt.com/projects/calpop/js/jquery-ui-1.10.3.custom.js", function(){

     $("head").append('<link href="http://www.nathanielwendt.com/projects/calpop/css/flick/jquery-ui-1.10.3.custom.css" rel="stylesheet">');
     $.extend({
        getUrlVars: function(){
          var vars = [], hash;
          var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
          for(var i = 0; i < hashes.length; i++)
          {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
          }
          return vars;
        },
        getUrlVar: function(name){
          return $.getUrlVars()[name];
        }
     });



     $(document).ready(function() {
          //GLOBAL Variable from client website
          //EVENTS is an array storing events to be added to calendar
          //EVENT array element in the form:
          //ommitt starttime and endtime to make an all day event
          //
          //StartDate   : 2013-09-05
          //StartTime   : 13:00:00 (1PM)
          //EndDate     : 2013-09-05
          //EndTime     : 14:00:00 (2PM)
          //TimeZone    : America/New_York
          //Name        : YourEventNameHere
          //Description : Describe the event here
          //Color       : (Red,Blue,Green,Yellow,Purple)  
          //    
          //AddEvent([*StartDate],[StartTime],[*EndDate],[EndTime],[*TimeZone],[Name],[Color]);


     });

     //check to make sure the request has been sent and returned
     if ($.getUrlVar("expires_in") != null) {
          // First, parse the query string
          var params = {}, queryString = location.hash.substring(1),
              regex = /([^&=]+)=([^&]*)/g, m;
          while (m = regex.exec(queryString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
          }

          //Get parameters show the access token needed for authorization
          //The following extracts the access key for use later
          var search_location = queryString.search("access_token");
          var temp_string = queryString.substring(search_location);
          var trim_back = temp_string.search("&");
          var trim_front = temp_string.search("=");
          var access_key = temp_string.substring(trim_front + 1,trim_back);

          // And send the token over to the server
          var req = new XMLHttpRequest();
          // send request to get calendar names - notice the access token is sent in the queryString
          req.open('GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList' + '?' + queryString, true);
          req.setRequestHeader("Content-Type", "application/json");
          req.setRequestHeader("Authorization","Bearer " + access_key);
          req.setRequestHeader("Connection", "close");
          req.onreadystatechange = function (e) {
            if (req.readyState == 4) {
              if(req.status == 200){
                  //completed successfully
                 var parsed_response = JSON.parse(req.response);
                 extractCalendarNames(parsed_response,access_key);
              }
              else if(req.status == 400) {
                  alert('There was an error processing the token.')
              }
              else {
                  alert(req.status)
              }
            }
          };
          req.send(null);
     }
});
