var ICR = ICR || {};
ICR.Calendar = ICR.Calendar || {};
ICR.Calendar.Fields = ICR.Calendar.Fields || {};
ICR.Calendar.Fields.StartDateFieldName = "Start Time";
ICR.Calendar.Fields.EndDateFieldName =  "End Time";
ICR.Calendar.Fields.EquipmentFieldName = "";
ICR.Calendar.Overlaps = [];
ICR.Calendar.OverlappingTr = "trOverlapping";
ICR.Calendar.OverlappingTd = "tdOverlapping";
ICR.Calendar.ItemId = "";
ICR.Calendar.Fields.EquipmentFieldName = "";
ICR.Calendar.maxAllowedOverlaps = 0;
ICR.Calendar.Fields.defaultDurationHours = 1;
ICR.Calendar.Fields.defaultDurationMinutes = 0;
ICR.Calendar.Fields.removeStartHourOptions = [];

//
//
// ToDo: add ability to restrict the start time
//
//


//  to override the default field names for the dates, define the global vars StartDateFieldName and EndDateFieldName
if( typeof StartDateFieldName !== 'undefined' && StartDateFieldName ) {ICR.Calendar.Fields.StartDateFieldName = StartDateFieldName; }
if( typeof EndDateFieldName !== 'undefined'   && EndDateFieldName   ) {ICR.Calendar.Fields.EndDateFieldName   = EndDateFieldName;   }

//  if the booking calendar allows users to choose what equipment to book using a choice field, define "EquipmentFieldName" to pass the (internal) field name
//  the system will now check for double bookings only for items with the same value in that field
if( typeof EquipmentFieldName !== 'undefined' && EquipmentFieldName )  {ICR.Calendar.Fields.EquipmentFieldName = EquipmentFieldName;   }

//  some calendars allow double booking, but only up to a maximum nummber of overlaps. You can define this number as the global var "maxAllowedOverlaps"
if( typeof maxAllowedOverlaps !== 'undefined' && maxAllowedOverlaps )  {ICR.Calendar.maxAllowedOverlaps = maxAllowedOverlaps;   }

//  if you want to change the default event duration, define two new global vars
//  var defaultDurationHours = 2; //Default number of hours to add to the start time - it can be over 24
//  var defaultDurationMinutes = 30;  //Default number of hours to add to the start time - it must be 0 or div by 5, e.g. 0, 5, 10, 15 ...
//  set var disableEndTime = true; to disable the end time row (force the duration tio what has been pre-defined)
if( typeof defaultDurationHours !== 'undefined' )  {ICR.Calendar.Fields.defaultDurationHours = defaultDurationHours;   }
if( typeof defaultDurationMinutes !== 'undefined' && defaultDurationMinutes )  {ICR.Calendar.Fields.defaultDurationMinutes   = defaultDurationMinutes;   }

// check if there is an array with the list of hours to remove. 
// NB: each item needs to end with ":"
if( typeof removeStartHourOptions != 'undefined' && removeStartHourOptions.length > 0 )  { ICR.Calendar.Fields.removeStartHourOptions   = removeStartHourOptions; }



//Class Event
function Event(){
    this.Name ="";
    this.Url ="";
    this.StartDate ="";
    this.EndDate ="";
}

$( document ).ready(function() {
    //Get current item Id
    ICR.Calendar.ItemId = getParameterByName("ID");    

    //Add an HTML placeholder for the list of overlapping events (if you have any. By defualt it has display:none)
    addOverlappingHtml();
	
	//disable fields for setting the end time (usful to force a specific duration)
	if (typeof disableEndTime !== 'undefined' && disableEndTime) { disableEndTimeFunction(); }
	
	//remove start times as necessary
	if (ICR.Calendar.Fields.removeStartHourOptions.length > 0 ) {
		removeStartHours();
	}
	
	//modify duration of the event, if necessary, then check for overlaps. Trigger this after 1 sec to allow the form to be set properly
	setTimeout(function(){ 
		modifyDuration();
		checkDoubleBooking();
		}, 1000); 

    //after updating the START DATE check for double booking
    jQuery("input[title^='"+ ICR.Calendar.Fields.StartDateFieldName +"']").blur(function(){
		modifyDuration();
        checkDoubleBooking();
    }); 
	//after updating the START TIME check for double booking
	jQuery("input[title^='"+ ICR.Calendar.Fields.StartDateFieldName +"']").parent().parent().find('select').each(function () {
		$(this).change(function(){ 
			setTimeout(function(){ 
				modifyDuration(); 
				checkDoubleBooking(); 	
				}, 500); 
		});
    }); 
    //after updating the END DATE check for double booking
    jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").blur(function(){
        checkDoubleBooking();
    }); 
	//after updating the END TIME check for double booking
	jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").parent().parent().find('select').each(function () {
		$(this).change(function(){ checkDoubleBooking(); });
    }); 
	
	//if there is a dropdown to select what to book, filter by the value in that field after any change in the field
	if (ICR.Calendar.Fields.EquipmentFieldName) {
		jQuery("select[title^='"+ ICR.Calendar.Fields.EquipmentFieldName +"']").change(function(){ 
			checkDoubleBooking(); 
		});
	}

});
function addOverlappingHtml(){
    var trOverlapping = "<tr id='" + ICR.Calendar.OverlappingTr + "' style='display:none'>" + 
                            "<td>" + 
                                "<h3 class='ms-standardheader'><h3>"
                            "</td>" + 
                        "</tr>";

    jQuery("input[title^='" + ICR.Calendar.Fields.EndDateFieldName + "']").parents('tr:first').parents('tr:first').after(trOverlapping);
}


function PreSaveAction() {
	console.log(ICR.Calendar.Overlaps.length)
   	if(ICR.Calendar.Overlaps.length > ICR.Calendar.maxAllowedOverlaps ) {
            console.log('issue found');
			$('#contentBox').get(0).scrollIntoView();
            return false;
        }
        else
        {
            return true;
        }
}

function checkDoubleBooking() {
    ICR.Calendar.Overlaps = [];
    $('#' +ICR.Calendar.OverlappingTr).hide();
    $('#' +ICR.Calendar.OverlappingTd).remove();
    var itemStartTime = getDateTime(ICR.Calendar.Fields.StartDateFieldName); 
	var itemEndTime = getDateTime(ICR.Calendar.Fields.EndDateFieldName); 

	var context = SP.ClientContext.get_current();
	var web = context.get_web();
	this.currentList = web.get_lists().getById(_spPageContextInfo.pageListId);
    var camlQuery = new SP.CamlQuery();
	
	var categoryFilter = '';
	if (ICR.Calendar.Fields.EquipmentFieldName) {
		categoryFilter = jQuery("select[title^='"+ ICR.Calendar.Fields.EquipmentFieldName +"']").val();
	}
	if (categoryFilter ) {
		var camlQueryText = "<View>" + 
                            "<Query>" + 
                                "<Where>" +
									"<And>" +
										"<Eq>" +
											"<FieldRef Name='" + ICR.Calendar.Fields.EquipmentFieldName + "' />" +
											"<Value Type='Choice'>" + categoryFilter + "</Value>" +
										"</Eq>" +
										"<Or>" + 
											"<Or>" +
												"<And>" +
													"<Geq>" +
														 "<FieldRef Name='EventDate' />" +
														 "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemStartTime + "</Value>" + 
													"</Geq>" +
													"<Lt>" +
														"<FieldRef Name='EventDate' />" +
														"<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemEndTime + "</Value>" +
													"</Lt>" +
												"</And>" +
												"<And>" +
													"<Gt>" + 
														"<FieldRef Name='EndDate' />" + 
														"<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemStartTime +  "</Value>" + 
													"</Gt>" + 
													"<Leq>" + 
														"<FieldRef Name='EndDate' />" + 
														"<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemEndTime + "</Value>" + 
													"</Leq>" + 
												"</And>" + 
											"</Or>" + 
											"<And>" + 
												"<Leq>" + 
													"<FieldRef Name='EventDate' />" + 
													"<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemStartTime +  "</Value>" + 
												"</Leq>" + 
												"<Geq>" + 
													"<FieldRef Name='EndDate' />" + 
													"<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemEndTime + "</Value>" + 
												"</Geq>" + 
											"</And>" + 
										"</Or>" + 
									"</And>" + 	
                                "</Where>" + 
                            "</Query>" + 
                        "</View>";
	} else {
		var camlQueryText = "<View>" + 
                            "<Query>" + 
                                "<Where>" +
                                     "<Or>" + 
                                        "<Or>" +
                                            "<And>" +
                                                "<Geq>" +
                                                     "<FieldRef Name='EventDate' />" +
                                                     "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemStartTime +  "</Value>" + 
                                                "</Geq>" +
                                                "<Lt>" +
                                                    "<FieldRef Name='EventDate' />" +
                                                    "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemEndTime + "</Value>" +
                                                "</Lt>" +
                                            "</And>" +
                                            "<And>" +
                                                "<Gt>" + 
                                                    "<FieldRef Name='EndDate' />" + 
                                                    "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemStartTime +  "</Value>" + 
                                                "</Gt>" + 
                                                "<Leq>" + 
                                                    "<FieldRef Name='EndDate' />" + 
                                                    "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemEndTime + "</Value>" + 
                                                "</Leq>" + 
                                            "</And>" + 
                                        "</Or>" + 
                                        "<And>" + 
                                            "<Leq>" + 
                                                "<FieldRef Name='EventDate' />" + 
                                                "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemStartTime +  "</Value>" + 
                                            "</Leq>" + 
                                            "<Geq>" + 
                                                "<FieldRef Name='EndDate' />" + 
                                                "<Value IncludeTimeValue='TRUE' Type='DateTime'>" + itemEndTime + "</Value>" + 
                                            "</Geq>" + 
                                        "</And>" + 
                                    "</Or>" + 
                                "</Where>" + 
                            "</Query>" + 
                        "</View>";
	}
	
	
	
	camlQuery.set_viewXml(camlQueryText);	
    this.ovelappingEvents = currentList.getItems(camlQuery);
    context.load(ovelappingEvents, 'Include(Id,Title,EventDate,EndDate)');
    context.load(currentList,['DefaultDisplayFormUrl']);
    context.executeQueryAsync(Function.createDelegate(this, this.DoCountOverlaps), Function.createDelegate(this, this.errorInCountOverlaps));
}

function disableEndTimeFunction() {
	//disable date
	jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").attr("disabled","disabled");
	//disable hour and minutes dropdown
	jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").parent().parent().find('select').each(function () {
		$(this).attr("disabled","disabled");
    }); 
	//disable calendar pop-up
	jQuery("input[title^='End Time']").parent().parent().find( "td.ms-dtinput > a" ).attr('onclick','').unbind('click');
	jQuery("input[title^='End Time']").parent().parent().find( "td.ms-dtinput > a" ).addClass('opacity50');
	jQuery("input[title^='End Time']").parent().parent().find( "td.ms-dtinput > a" ).css("cursor","not-allowed");
}

function DoCountOverlaps() {
	var overlapEnumerator = ovelappingEvents.getEnumerator();
	var count = ovelappingEvents.get_count();
	var isOverlappingItems = false;
	if( count > 0 ){ 
		var numOverlaps = 0
		while(overlapEnumerator.moveNext()){
            var oListItem = overlapEnumerator.get_current();
            var tmpItemId = oListItem.get_id();

            //Skip the same element    
            if(tmpItemId != ICR.Calendar.ItemId){    
				numOverlaps = numOverlaps + 1;
				if (numOverlaps > ICR.Calendar.maxAllowedOverlaps -1 ) { isOverlappingItems = true; }
				var tmpEvent = new Event();
				tmpEvent.Name = oListItem.get_item('Title');
				tmpEvent.Url = _spPageContextInfo.siteAbsoluteUrl + currentList.get_defaultDisplayFormUrl() + "?ID=" + tmpItemId;
				tmpEvent.StartDate =oListItem.get_item('EventDate');
				tmpEvent.EndDate =oListItem.get_item('EndDate');
				ICR.Calendar.Overlaps.push(tmpEvent);
			}
        }
	}	
	
    if(isOverlappingItems){
		//highlight invalid fields
		jQuery("input[title^='"+ ICR.Calendar.Fields.StartDateFieldName +"']").parent().parent().addClass('invalidField');
		jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").parent().parent().addClass('invalidField');
		//display overlapping fields
		ShowOverlappingElements();
	} else {
		//there are no overlapping events, hence remove the highlighting on the fields
		jQuery("input[title^='"+ ICR.Calendar.Fields.StartDateFieldName +"']").parent().parent().removeClass('invalidField');
		jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").parent().parent().removeClass('invalidField');
	}
}

function ShowOverlappingElements(){
    var tdElement = '<td id="'+ ICR.Calendar.OverlappingTd +'"">' +
                        '<span class="invalidFieldWarning">Overlapping events:</span>' +
                        '<br>' +
                     '<table class="invalidFieldList">';

    var trEelements = "<tr>" +
                          //"<th>Title</th>" +
                          '<th class="invalidFieldHeader">Start Time</th>' +
                          '<th class="invalidFieldHeader">End Time</th>' +
                      "</tr>";
    for(var i=0;i<ICR.Calendar.Overlaps.length;i++){
        var currentElement = ICR.Calendar.Overlaps[i];
        trEelements += '<tr>' +
							'<td class="ovelappingTime ovelappingStart">' +  
								currentElement.StartDate.format('dd/MM/yyyy HH:mm') + 
							'</td>' +
							'<td class="ovelappingTime ovelappingEnd">' +
								currentElement.EndDate.format('dd/MM/yyyy HH:mm') + 
							'</td>' +
						'</tr>';
    }
    tdElement +=trEelements;
    tdElement +="</table></td>"; 
    $('#' +ICR.Calendar.OverlappingTr).append(tdElement);
    $('#' +ICR.Calendar.OverlappingTr).show();
}   

function errorInCountOverlaps() {
	console.log('Error in trying to fetch the number of overlapping events');
}
function getDateTime(fieldName) {
	//grab the date
	var outDate = jQuery("input[title^='" + fieldName + "']").val(); 
	if (outDate) {
		var dateArray = outDate.split("/");
		var rowEl = jQuery("input[title^='" + fieldName + "']").parent().parent();
		var outHours = rowEl.find(".ms-dttimeinput select[name$='DateTimeFieldDateHours']").val()
		var outMinutes = rowEl.find(".ms-dttimeinput select[name$='DateTimeFieldDateMinutes']").val()
		//the output needs to be in the form of 2012-03-14T00:00:00
		var outDateTime = dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0] + 'T' + outHours + outMinutes + ':00.000Z';
		return outDateTime;	
	}
	
}


Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}
Date.prototype.addMinutes = function(h) {    
   this.setTime(this.getTime() + (h*60*1000)); 
   return this;   
}


//change the default duration
function modifyDuration(){
	if( ICR.Calendar.Fields.defaultDurationHours != 1 || ICR.Calendar.Fields.defaultDurationMinutes != 0 ) {

		var startDateString = jQuery("input[title^='" + ICR.Calendar.Fields.StartDateFieldName + "']").val(); 
		
		if (startDateString) {
			var startDateArray = startDateString.split("/");
			var startEl = jQuery("input[title^='" + ICR.Calendar.Fields.StartDateFieldName + "']").parent().parent();
			var startHours = startEl.find(".ms-dttimeinput select[name$='DateTimeFieldDateHours']").val();
			var startMinutes = startEl.find(".ms-dttimeinput select[name$='DateTimeFieldDateMinutes']").val();
			//remove one from the month since javascript uses 0-11 for months
			var startTime = new Date(parseInt(startDateArray[2]) , parseInt(startDateArray[1])-1 , parseInt(startDateArray[0]), parseInt(startHours.slice(0, -1)) , parseInt(startMinutes) , 0);
			
			var endTime = startTime.addHours(ICR.Calendar.Fields.defaultDurationHours);
			if (ICR.Calendar.Fields.defaultDurationMinutes > 0 ) {endTime = startTime.addMinutes(ICR.Calendar.Fields.defaultDurationMinutes) }

			// Set End Date
			var monthNum = 0;
			monthNum = endTime.getMonth();
			monthNum = monthNum + 1;
			if (monthNum < 10 ) {
				var endTimeString = endTime.getDate() + "/0" + monthNum + "/" + endTime.getUTCFullYear();
			} else {
				var endTimeString = endTime.getDate() + "/" + monthNum + "/" + endTime.getUTCFullYear();
			}
			
			//set End Time - Date - but only if it is different from what is already there or else the process will stop (oddly)
			if( jQuery("input[title^='" + ICR.Calendar.Fields.EndDateFieldName + "']").val() != endTimeString ) { jQuery("input[title^='" + ICR.Calendar.Fields.EndDateFieldName + "']").val(endTimeString); }
			
			//Set End Time - Hours
			if ( endTime.getHours() < 10 ) {
				endTimeString = "0" + endTime.getHours() + ":";
			} else {
				endTimeString = endTime.getHours() + ":";	
			}
			var dropdown = jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").parent().parent().find('select[name$=DateTimeFieldDateHours]');
			dropdown.find('option:selected').removeAttr("selected");
			dropdown.val(endTimeString);
			dropdown.find('option[value="' + endTimeString + '"]').attr("selected","selected");
			
			//Set End Time - Minutes
			if ( endTime.getMinutes() < 10 ) {
				endTimeString = "0" + endTime.getMinutes();
			} else {
				endTimeString = endTime.getMinutes();	
			}
			var dropdown = jQuery("input[title^='"+ ICR.Calendar.Fields.EndDateFieldName +"']").parent().parent().find('select[name$=DateTimeFieldDateMinutes]');
			dropdown.find('option:selected').removeAttr("selected");
			dropdown.val(endTimeString);
			dropdown.find('option[value=' + endTimeString + ']').attr("selected","selected");		
		}		
	}
	
}

function removeStartHours() {

	//check each option and remove those in the removeStartHourOptions array
	jQuery("input[title^='"+ ICR.Calendar.Fields.StartDateFieldName +"']").parent().parent().find(".ms-dttimeinput select[name$='DateTimeFieldDateHours'] option").each( function(){ 
		if(  ICR.Calendar.Fields.removeStartHourOptions.indexOf($(this).val()) >-1 ) { 
			$(this).remove(); 
		} 
	});
	
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}