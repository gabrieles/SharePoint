$(document).ready(function(){    
$('.eventsCalendar').css("visibility", "hidden");
$('.eventsCalendar').first().css("visibility", "visible");
});


function filterEvents(el) {
$('.eventsCalendar').css("visibility", "visible");
	//hide all filters but this one, and display "Show all"	
	$('#tabCalendar .eventsFilter').addClass('hideThis');
	$('#tabCalendar #eventsFilterAll').removeClass('hideThis');
	$(el).removeClass('hideThis');
	$(el).addClass('selected');
	//hide all calendars, and display the one linked to the selected element
	$('.eventsCalendar').addClass('hideThis');
	var calID = $(el).data('zone');
	$("#" + calID ).removeClass('hideThis');
	if(calID == 'eventsf')
	{
	$('.eventsCalendar').first().removeClass('hideThis');
	}
}       

function resetFilterEvents() {
	//display all filters, but hide "Show All"	
   $('.eventsFilter').removeClass('hideThis');
   $('#tabCalendar .selected').removeClass('selected');
   $('#eventsFilterAll').addClass('hideThis');
   //hide all calendars, and display the global one
   $('.eventsCalendar').addClass('hideThis');
$('.eventsCalendar').first().removeClass('hideThis');
   $('#allEvents').removeClass('hideThis');
   

}

function ApplyRefiner(){
/*	if (e.target.id == 'Container') {
	   ApplyRefinerBranding();
	}
	if(e.target.class='histogram_container'){
		if($("[refinername='Created'").length>0){
			$('div[id*="SliderLoadContainer"]').children('span[class^="ms-ref-unselSec"]').show();
			$("[refinername='Created'").children('div[id^="Container"]').addClass('actives');       
		}
		if($("[refinername='LastModifiedTime'").length>0){
			$('div[id*="SliderLoadContainer"]').children('span[class^="ms-ref-unselSec"]').show();
			$("[refinername='LastModifiedTime'").children('div[id^="Container"]').addClass('actives'); 
		}
	} */
}
function ApplyRefinerBranding(){
	var i=0;
	$(".ms-ref-ctrl").addClass("panel-group").removeClass("ms-ref-ctrl");
	$(".ms-ref-refiner").addClass("panel panel-default").removeClass("ms-ref-refiner");
	$('div[id^="UnselectedSection"]').hide();

	$(".ms-ref-refinername").css('display','block');

	$( 'div[id^="Container"]' ).each(function() {


		$(this).addClass("panel panel-default");
		if(i==0){
			
			$(this).children('div[id^="UnselectedSection"]').show();
			$(this).find('.ms-ref-refinername').addClass("panel-heading actives panel-title ").removeClass("ms-ref-refinername");
			i++;
		} 
		else{
			$(this).find('.ms-ref-refinername').addClass("panel-heading actives panel-title collapsed").removeClass("ms-ref-refinername");
		}                  
		
		$(this).children('div[id^="UnselectedSection"]').children('div[id^="unselShortList"]').children('div[id^="OtherValue"]').hide()
		$(this).children('div[id^="UnselectedSection"]').addClass('panel-body');
		$(this).children('div[id^="UnselectedSection"]').children('div[id^="unselShortList"]').children('div[id^="Value"]').css('padding','0 0 10px 0');
	});

	
	//$(".ms-ref-refinername").addClass("panel-heading actives panel-title ").removeClass("ms-ref-refinername");



	$(".panel-heading").unbind().on("click", function(){
	$(this).toggleClass('collapsed');    
	//$('div[id^="UnselectedSection"]').hide();
	//$(this).parent().children('div[id^="UnselectedSection"]').show();
	//$(".actives").removeClass("actives");    
	//$(this).addClass("panel-heading actives panel-title");
	//$('div[id*="SliderLoadContainer"]').parent().addClass('actives');

	});

	/*$('.panel-title').each(function(e){
		$(this).removeAttr('onclick');
	});*/
	
} 