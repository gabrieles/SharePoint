function getTeamsList(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Research Teams Promo Links');

    var camlQuery = new SP.CamlQuery();
    var query = '<Query><OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy></Query>';

    camlQuery.set_viewXml('<View>'+query+'</View>');
    this.teams = oList.getItems(camlQuery);
    clientContext.load(teams);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showTeamsList), Function.createDelegate(this, this.hideTeams));
}

function showTeamsList(){
    var teamEnumerator = teams.getEnumerator();
    var count = teams.get_count();
    if(count>0){
		var teamsList = '<div id="team-0" class="dis-tr"> ' +
								'<span class="teamName dis-tc pr-20"><h2>Team name</h2></span>' +
								'<span class="teamLeader dis-tc"><h2>Team leader</h2></span>' +
								'</div>';
        $('#teamsList').append(teamsList);
			
        while (teamEnumerator.moveNext()) {

            var oListItem = teamEnumerator.get_current();
			var divArray = oListItem.get_item('Division');
            var title = oListItem.get_item('Title');
			var desc = oListItem.get_item('Description'); 
			if(!desc){ desc = ''; }	
            var id = oListItem.get_item('ID');
            var link = oListItem.get_item('Link').get_url();      
			var team_leader = oListItem.get_item('Team_x0020_Leader').get_lookupValue();
            var team_leaderId = oListItem.get_item('Team_x0020_Leader').get_lookupId();
			
			teamsList = '<div id="team-' + id + '" class="dis-tr"> ' +
							'<span class="teamName dis-tc pr-20 pb-20"><a href="'+link+'" title="' + desc + '">'+title+'</a></span>' +
							'<span class="teamLeader dis-tc pb-20"><a href="https://nexus.icr.ac.uk/_layouts/15/userdisp.aspx?ID=' + team_leaderId + '">'+team_leader+'</a></span>' +
						'</div>';
            $('#teamsList').append(teamsList); 
		}
    }  
}
function hideTeamsList(){}