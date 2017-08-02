function getDivisions(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Divisions Promo Links');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.divisions = oList.getItems(camlQuery);
    
    clientContext.load(divisions);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showDivisions), Function.createDelegate(this, this.hideDivisions));
}

function showDivisions(sender, args){
    var listItemEnumerator = divisions.getEnumerator();
    var count = divisions.get_count();
    $('.division-wrapper').remove();
	var htmlTotal = '';
    if(count>0){    
        while (listItemEnumerator.moveNext()) {

            var oListItem = listItemEnumerator.get_current();

            var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
            var title = oListItem.get_item('Title'); 
            var description = oListItem.get_item('Description');            
            var id = oListItem.get_item('ID');
			var link = oListItem.get_item('Link').get_url(); 	
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : ""
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
            if(imagesrc !=null && imagesrc !=undefined && imagesrc.length>0 ){

            }
            else{
                imagesrc = "'/style library/icr/Images/icr-logo-thumbnail.jpg'"
            }

            
            var html = '<div id="division'+id+'" class="col-md-4 col-xs-12 col-element division-wrapper" style="display:none;">'+
						'<div class="container-md bg-white taskCategory-'+color+'">'+
						'<a href="'+link+'" class="md-thumb cover-bg img-border" style="background-image: url(\''+imagesrc+'?RenditionID=9\')"></a>'+                        
						'<div class="text-table"><div><h4 class="text-bold"><a class="promo-title" ';	
			if( description ) { html += 'title="'+description+'" '; }
			html += 'href="'+link+'">'+title+'</a></h4></div><div>';
            html += '<h5 class="toggle-btn text-red">View teams<span class="glyphicon glyphicon-show"></span></h5>'+
                    '<div class="toggle-this icr-hidden pt-0"><ul id="'+id+'list" class="content-list teamsListByDivision"></ul></div>'+
                    '</div></div></div></div>';
			htmlTotal = htmlTotal + html;		
        }
		document.getElementById('divisionsList').innerHTML = htmlTotal + document.getElementById('divisionsList').innerHTML;				
    }
    else{
        $('#divisionsList').hide();
    }
    getTeams();
}
function hideDivisions(){

}

function getTeams(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Research Teams Promo Links');

    var camlQuery = new SP.CamlQuery();
    var query = '<Query><GroupBy Collapse="FALSE"><FieldRef Name="Division"/></GroupBy></Query>';
    if(userFilter.length>0){
        query='<Query><Where><Eq><FieldRef Name="Team_x0020_Leader" LookupId="TRUE" /><Value Type="User">'+userFilter+'</Value></Eq></Where>'+
        '<GroupBy Collapse="FALSE"><FieldRef Name="Division"/></GroupBy></Query></Query>';
    }
    camlQuery.set_viewXml('<View>'+query+'</View>');
    this.teams = oList.getItems(camlQuery);
    clientContext.load(teams);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showTeams), Function.createDelegate(this, this.hideTeams));
}

function showTeams(){
    var teamEnumerator = teams.getEnumerator();
    var count = teams.get_count();
    if(count>0){
		
        $('#teamsDropdown').find('option:gt(0)').remove();    
        while (teamEnumerator.moveNext()) {

            var oListItem = teamEnumerator.get_current();
			var divArray = oListItem.get_item('Division');
            var title = oListItem.get_item('Title');            
            var id = oListItem.get_item('ID');
            var link = oListItem.get_item('Link').get_url();      

			var teamsDropdown = '<option value="'+link+'">'+title+'</option>';
            $('#teamsDropdown').append(teamsDropdown); 
			
            var team_leader = oListItem.get_item('Team_x0020_Leader').get_lookupValue();
            var team_leaderId = oListItem.get_item('Team_x0020_Leader').get_lookupId();
			
			if($("#teamLeadersDropdown option[value='"+team_leaderId+"']").length==0){
                var dropdownHtml = '<option value="'+team_leaderId+'">'+team_leader+'</option>';
                $('#teamLeadersDropdown').append(dropdownHtml);
            }
			
			for (var i = 0; i < divArray.length; i++) {
				var divisionID = divArray[i].get_lookupId();
				var divisionValue = divArray[i].get_lookupValue();
				var html =  '<li><a href="'+link+'">'+title+'</a></li>';
				$('#'+divisionID+'list').append(html);
			}			       
        }
		if(userFilter.length>0){
			$('.division-wrapper .toggle-btn').each(function() {
				$(this).next('.toggle-this').show();
                $(this).html("Hide teams<span class='glyphicon glyphicon-hide'>");            
            });
		}	
		$("#teamLeadersDropdown").html($("#teamLeadersDropdown option").sort(function (a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
		}))
		$("#teamsDropdown").html($("#teamsDropdown option").sort(function (a, b) {
			return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
		}))
	
    }
    else{
        $('#divisionsList').hide();
    }

    hideEmptyDivisions();
    bindToggleEvent();
}
function hideTeams(){}


function bindToggleEvent(){
     /* HIDE SHOW MORE CONTENT ON TEAMS PAGE */
        $('.toggle-btn').on('click', function(){                        
            $(this).next('.toggle-this').toggle();
            if ($(this).text() == "View teams") {
                $(this).html("Hide teams<span class='glyphicon glyphicon-hide'>");            
            }
            else {            
                $(this).html("View teams<span class='glyphicon glyphicon-show'>");
            }
        });
}

function hideEmptyDivisions(){
    $('.teamsListByDivision').each(function(){
        $(this).has("li").parent().parent().parent().parent().parent().css('display','inline-block');
        $(this).not(":has(li)").parent().parent().parent().parent().parent().remove();
    });
}

function getStrategicInitiatives(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Strategic initiatives Promo Links');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.initiatives = oList.getItems(camlQuery);
    
    clientContext.load(initiatives);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showInitiatives), Function.createDelegate(this, this.hideInitiatives));
}
function showInitiatives(sender, args){
    var initiativesEnumerator = initiatives.getEnumerator();
    var count = initiatives.get_count();
    if(count>0){    
        while (initiativesEnumerator.moveNext()) {

            var oListItem = initiativesEnumerator.get_current();

            var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
            var title = oListItem.get_item('Title'); 
            var description = oListItem.get_item('Description');            
            var id = oListItem.get_item('ID'); 
            var link = oListItem.get_item('Link').get_url();      
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : ""
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
            
            var html = '<div class="col-md-4 col-xs-12"><div class="container-md bg-white taskCategory-'+color+'">'+
                        '<a href="'+link+'" class="md-thumb cover-bg img-border" style="background-image: url(\''+imagesrc+'?RenditionID=9\')"></a>'+                        
                        '<div class="text-table"><div><h4 class="text-bold"><a class="promo-title" ';
			if( description ) { html += 'title="'+description+'" '; }
			html += 'href="'+link+'">'+title+'</a></h4></div>';			
			html += '</div></div></div>';

            $('#initiativesList').append(html);                
        }        
    }
    else{
        $('#initiativesList').hide();
    }
}
function hideInitiatives(sender, args){
     $('#initiativesList').hide();
}


function getDirectorates(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Directorates Promo Links');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.directorates = oList.getItems(camlQuery);
    
    clientContext.load(directorates);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showDirectorates), Function.createDelegate(this, this.hideDirectorates));
}
function showDirectorates(sender, args){
    var directorateEnumerator = directorates.getEnumerator();
    var count = directorates.get_count();
    if(count>0){    
        while (directorateEnumerator.moveNext()) {

            var oListItem = directorateEnumerator.get_current();

            var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
            var title = oListItem.get_item('Title'); 
            var description = oListItem.get_item('Description');            
            var id = oListItem.get_item('ID'); 
            var link = oListItem.get_item('Link').get_url();      
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : ""
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
            
            var html = '<div class="col-md-4 col-xs-12"><div class="container-md bg-white taskCategory-'+color+'">'+
                        '<a href="'+link+'" class="md-thumb cover-bg img-border" style="background-image: url(\''+imagesrc+'?RenditionID=9\')"></a>'+                        
                        '<div class="text-table"><div><h4 class="text-bold"><a class="promo-title" '; 
			if( description ) { html += 'title="'+description+'" '; }
			html += 'href="'+link+'">'+title+'</a></h4></div>';			

			html += '</div></div></div>';

            $('#directoratesList').append(html);                
        }        
    }
    else{
        $('#directoratesList').hide();
    }
}
function hideDirectorates(sender, args){
     $('#directoratesList').hide();
}

function getAssociations(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Associations Promo Links');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.associations = oList.getItems(camlQuery);
    
    clientContext.load(associations);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showAssociations), Function.createDelegate(this, this.hideAssociations));
}
function showAssociations(sender, args){
    var associationsEnumerator = associations.getEnumerator();
    var count = associations.get_count();
    if(count>0){    
        while (associationsEnumerator.moveNext()) {

            var oListItem = associationsEnumerator.get_current();

            var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
            var title = oListItem.get_item('Title'); 
            var description = oListItem.get_item('Description');            
            var id = oListItem.get_item('ID'); 
            var link = oListItem.get_item('Link').get_url();      
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : ""
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
            
            var html = '<div class="col-md-4 col-xs-12"><div class="container-md bg-white taskCategory-'+color+'">'+
                        '<a href="'+link+'" class="md-thumb cover-bg img-border" style="background-image: url(\''+imagesrc+'?RenditionID=9\')"></a>'+                        
                        '<div class="text-table"><div><h4 class="text-bold"><a class="promo-title" ';
			if( description ) { html += 'title="'+description+'" '; }
			html += 'href="'+link+'">'+title+'</a></h4></div>';			
			html += '</div></div></div>';

            $('#associationsList').append(html);                
        }        
    }
    else{
        $('#associationsList').hide();
    }
}
function hideAssociations(sender, args){
     $('#associationsList').hide();
}

function getCollaborationGroups(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Collaboration Groups Promo Links');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query><RowLimit>6</RowLimit></View>');
    this.collaborationgroups = oList.getItems(camlQuery);
    
    clientContext.load(collaborationgroups);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showCollaborationGroups), Function.createDelegate(this, this.hideCollaborationGroups));
}

function showCollaborationGroups(sender, args){
    var cgEnumerator = collaborationgroups.getEnumerator();
    var count = collaborationgroups.get_count();
    if(count>0){    
        while (cgEnumerator.moveNext()) {

            var oListItem = cgEnumerator.get_current();
           
            var title = oListItem.get_item('Title'); 
            var description = oListItem.get_item('icr_TeamSiteDescription');            
            if (!description) {description= '';}
			var id = oListItem.get_item('ID'); 
            var link = oListItem.get_item('icr_TeamSiteLink');      
            
			
            var html = '<div class="col-md-4"><div class="container-md"><h4><a href="'+link+'">'+title+'</a></h4>'+
                        '<h5>'+description+'</h5></div></div>';

            $('#collaborationGroups').append(html);                
        }        
    }
    else{
        $('#collaborationGroups').hide();
    }
}
function hideCollaborationGroups(sender, args){
    $('#collaborationGroups').hide();
}
     