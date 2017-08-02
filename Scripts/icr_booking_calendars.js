function getCalendarsList(){
    var clientContext = new SP.ClientContext("/Scientific%20support/");
    var oList = clientContext.get_web().get_lists().getByTitle('Booking Calendars Promo List');

    var camlQuery = new SP.CamlQuery();
    var query = '<Query><OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy></Query>';

    camlQuery.set_viewXml('<View>'+query+'</View>');
    this.calendars = oList.getItems(camlQuery);
    clientContext.load(calendars);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showCalendarsList), Function.createDelegate(this, this.hideCalendarsList));
}

function showCalendarsList(){
    var calendarEnumerator = calendars.getEnumerator();
    var count = calendars.get_count();
    if(count>0){
			
        while (calendarEnumerator.moveNext()) {

            var oListItem = calendarEnumerator.get_current();
			
			
            var title = oListItem.get_item('Title');
			var desc = oListItem.get_item('CategoryDescription'); 
			if(!desc){ desc = ''; }	
            var id = oListItem.get_item('ID');
            var link = oListItem.get_item('Link').get_url();      
			var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
			var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : ""
            var imageURL = pic;
            if (pic.indexOf("<a") != -1) {
                imageURL = $(pic).find("img:first").attr("src");
            }
            else {
                imageURL = $(pic).attr("src");
            }
			
			calendarsList = '<div id="calendar-' + id + '" class="taskCategory-' + color + ' mb-20"> ' +
								'<a href="'+link+'">' +
									'<div class="img-65 mr-20 mt-10 fl-l" style=" background-image: url(\'' + imageURL + '\')"></div>' + 
									'<div class="calendarName">'+title+'</div>' +
								'</a>' +	
								'<div class="calendarDesc">'+ desc +'</div>' +
							'</div>';
            $('#calendarsList').append(calendarsList); 
		}
    }  
}
function hideCalendarsList(){
	console.log('Could not retrieve the list of booking calendars')
}