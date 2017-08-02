var featuredProjectSite = "";

//News Section
function getMainNews(){
	var clientContext = new SP.ClientContext("/News");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');
    var camlQuery = new SP.CamlQuery();
	var camlQueryString = 	'<Query>'+
								'<Where>'+
									'<And><Eq><FieldRef Name="Top_x0020_Story" /><Value Type="Integer">1</Value></Eq>'+
									'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq></And>'+
								'</Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
                            '<RowLimit>1</RowLimit>';
    camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
    this.collMainNewsItem = oList.getItems(camlQuery);
    clientContext.load(collMainNewsItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showMainNews), Function.createDelegate(this, this.hideMainNews));
}

function showMainNews(sender, args) {
    var listItemEnumerator = collMainNewsItem.getEnumerator();
    var itemcount = 0;
    while (listItemEnumerator.moveNext()) {

        var oListItem = listItemEnumerator.get_current();
	
        var link = oListItem.get_item('FileRef');
        var title = oListItem.get_item('Title');
        var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
		//Add this if you want to display a textual summary (but you will need to add the field to the content type, too)
        //var summary = (oListItem.get_item('Comments') === null || oListItem.get_item('Comments') === undefined) ? '' : oListItem.get_item('Comments');
        //if (summary != null && summary != undefined && summary.length > 150) {
        //    summary = summary.substr(0, 150)
        //    summary = summary.substr(0, summary.lastIndexOf(" ")) + '...';
        //}
        var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
        var imagesrc = pic;
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        }
        var text = "";
		if (itemcount == 0) {
			//RenditionID=5 is 360x360px
			text = 	'<a href="'+link+'" class="main-news-thumb main-news-img cover-bg" style="background-image:url(\''+imagesrc+'?RenditionID=5\')"></a>'+
					'<div class="icr-top-news-block"><h2 class="top-news-text link-dg"><a class="line-clamp-3" href="'+link+'">'+title+'</a></h2>'+
					'<div class="icr-meta"><span>'+articleDate+'</span></div></div><div class="btn-top-padding hidden-xs">'+
					'<a class="icr-btn btn-red" href="/news">View all news<span class="glyphicon glyphicon-chevron-right"></span></a></div>';             
			$('#firstNews').append(text);
			$('.line-clamp-3').ellipsis({ lines: 3 });
        }
        itemcount++;
    }
}
function hideMainNews(sender, args) { }

function getResearchNews(){
	var clientContext = new SP.ClientContext("/News");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');
    var camlQuery = new SP.CamlQuery();
	var camlQueryString = 	'<Query>'+
								'<Where>'+
									'<And><Neq><FieldRef Name="Top_x0020_Story" /><Value Type="Integer">1</Value></Neq>'+
										'<And><In><FieldRef Name="NewsType" /><Values><Value Type="Choice">Research news</Value><Value Type="Choice">Around the ICR</Value></Values></In>'+
										'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq></And>'+
									'</And>'+	
								'</Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
                            '<RowLimit>2</RowLimit>';
    camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
    this.collResearchNewsItem = oList.getItems(camlQuery);
    clientContext.load(collResearchNewsItem);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showResearchNews), Function.createDelegate(this, this.hideResearchNews));	
}
function showResearchNews(sender, args) {

    var listItemEnumerator = collResearchNewsItem.getEnumerator();
    var itemcount = 0;
    while (listItemEnumerator.moveNext()) {

        var oListItem = listItemEnumerator.get_current();

        var link = oListItem.get_item('FileRef');
        var title = oListItem.get_item('Title');
        var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
		
		//use this if you want to add field of text to display on the homepage
        //var summary = (oListItem.get_item('Comments') === null || oListItem.get_item('Comments') === undefined) ? '' : oListItem.get_item('Comments');
        //if (summary != null && summary != undefined && summary.length > 150) {
        //    summary = summary.substr(0, 150)
        //    summary = summary.substr(0, summary.lastIndexOf(" ")) + '...';
        //}
		
        var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
        var imagesrc = pic;
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        }
        var text = "";
		//RenditionID=6 is 130x130px
        if (itemcount == 0) {
            text = '<a href="'+link+'"><div class="sub-news-thumb cover-bg"  style="background-image:url(\''+imagesrc+'?RenditionID=6\')"></div></a>'+
                   '<div class="text-table"><h4 class="link-dg"><a class="line-clamp-4" href="'+link+'">'+title+'</a></h4>'+
                   '<div class="icr-meta"><span>'+articleDate+'</span></div></div>';            
            $('#secondNews').append(text);
        }
        else if (itemcount == 1){
			text = '<a href="'+link+'"><div class="sub-news-thumb cover-bg"  style="background-image:url(\''+imagesrc+'?RenditionID=6\')"></div></a>'+
                   '<div class="text-table"><h4 class="link-dg"><a class="line-clamp-4" href="'+link+'">'+title+'</a></h4>'+
                   '<div class="icr-meta"><span>'+articleDate+'</span></div></div>';                
            $('#thirdNews').append(text);          
        }
		$('.line-clamp-4').ellipsis({ lines: 4 });
        itemcount++;
    }
}
function hideResearchNews(sender, args) { }



function getInProfileNews(){
   var clientContext = new SP.ClientContext("/Features");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
    var camlQueryString = 	'<Query>'+
								'<Where>'+
									'<Eq><FieldRef Name="NewsType" /><Value Type="Choice">In profile</Value></Eq>'+
									'<And><Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq></And>'+
								'</Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
							'<RowLimit>1</RowLimit>';
	camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
    this.inProfileItem = oList.getItems(camlQuery);

    clientContext.load(inProfileItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showInProfileNews), Function.createDelegate(this, this.hideInProfileNews));    
}
function showInProfileNews(sender, args) {

    var listItemEnumerator = inProfileItem.getEnumerator();    
    while (listItemEnumerator.moveNext()) {

        var oListItem = listItemEnumerator.get_current();

        var link = oListItem.get_item('FileRef');
        var title = oListItem.get_item('Title');
        var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
               
        var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
        var imagesrc = pic;
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        }
        var text = "";
		//?RenditionID=7 is 65x65px	
        text = '<div class="container-md">'+
					'<h4 class="text-red text-bold pb-10 mb-0">In profile</h4>'+
					'<a href="'+link+'" class="sm-thumb cover-bg img-border" style="background-image:url(\''+imagesrc+'?RenditionID=7\')"></a>'+
					'<div class="text-table"><p><a class="line-clamp-2 text-dark" href="'+link+'">'+title+'</a></p><div class="icr-meta"><span>'+articleDate+'</span></div></div>'+
				'</div>';
        $('#fourthNews').append(text);
        $('.line-clamp-2').ellipsis({ lines: 2 });      
    }
}
function hideInProfileNews(sender, args) { }

function getTeamFocusNews(){
   var clientContext = new SP.ClientContext("/Features");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
    camlQueryString = 	'<Query>'+
							'<Where>'+
								'<Eq><FieldRef Name="NewsType" /><Value Type="Choice">In focus</Value></Eq>'+
								'<And><Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq></And>'+
							'</Where>'+
							'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
						'</Query>'+
						'<RowLimit>1</RowLimit>';
    camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
	this.teamFocusItem = oList.getItems(camlQuery);

    clientContext.load(teamFocusItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showTeamFocusNews), Function.createDelegate(this, this.hideTeamFocusNews));    
}
function showTeamFocusNews(sender, args) {

    var teamFocusItemEnumerator = teamFocusItem.getEnumerator();    
    while (teamFocusItemEnumerator.moveNext()) {

        var oListItem = teamFocusItemEnumerator.get_current();

        var link = oListItem.get_item('FileRef');
        var title = oListItem.get_item('Title');
        var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
               
        var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
        var imagesrc = pic;
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        }
        var text = "";
		//?RenditionID=7 is 65x65px	
        text = '<div class="container-md">'+
					'<h4 class="text-red text-bold pb-10 mb-0">In focus</h4>'+
					'<a href="'+link+'" class="sm-thumb cover-bg img-border" style="background-image:url(\''+imagesrc+'?RenditionID=7\')"></a>'+
					'<div class="text-table"><p><a class="line-clamp-2 text-dark" href="'+link+'">'+title+'</a></p><div class="icr-meta"><span>'+articleDate+'</span></div></div>'+
				'</div>';
                      
        $('#fifthNews').append(text);
        $('.line-clamp-2').ellipsis({ lines: 2 });      
    }
}
function hideTeamFocusNews(sender, args) { }

//Get Conversations
function getConversations(){
    var conversationsRestSource = _spPageContextInfo.siteAbsoluteUrl +"/_api/search/query?querytext='path:https://nexus.icr.ac.uk/teams ContentTypeId:0x012002*'"+
                                "&sourceid='459dd1b7-216f-4386-9709-287d5d22f568'"+
                                "&rowlimit=5"+
                                "&sortlist='DiscussionLastUpdatedOWSDATE:descending'"+                                "&selectproperties='Title,Path,DiscussionPost,FullPostBody,LastModifiedTime,Author,AuthorOWSUSER,PostAuthor,Author/FirstName,Author/LastName,Author/EMail,DiscussionLastUpdatedOWSDATE,'&$expand=Author" ;

	$.ajax({
        url: conversationsRestSource,
        headers:{"accept":"application/json;odata=verbose"},
        success: showConversations,
        error: hideConversations
    });

}
function showConversations(data){
    //var jsonObject = JSON.parse(data.body);
    var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;    
    if(results.length==0){
        //$('#conversationsSection').hide();
    }
    else{
        var resultsHtml='';
        $.each(results, function(index, result){
            //var date = moment(result.Cells.results[6].Value).format('DD MMM'); //"LastModifiedTime" for the post (does not count the time of the latest reply)
			var date = moment(result.Cells.results[10].Value).format('DD MMM'); //"DiscussionLastUpdatedOWSDATE" - uses latest comment
            var email = result.Cells.results[8].Value.split('|')[0].trim();
			var authorAccountName = result.Cells.results[8].Value.split('|').pop().trim();
			var numReplies = result.Cells.results[18].Value;
			numReplies == 1 ? numReplies = '1 Reply' : numReplies = numReplies + ' Replies';
			// var numLikes = result.Cells.results[19].Value; //Not currently in use
            var imagesrc = (email !=null && email !=undefined && email.length >0) ? '/_layouts/userphoto.aspx?size=S&accountName=' + email : '/_layouts/userphoto.aspx?size=S'
			//you cannot use image renditions on images from my.nexus
            resultsHtml += '<div class="container-md">' +
								'<div class="sm-thumb cover-bg img-border" style="background-image:url(\'' + imagesrc + '\')"></div>' +
								'<div class="text-table">' +
									'<p><a class="line-clamp-2" href="' + result.Cells.results[3].Value+'">'+result.Cells.results[2].Value + '</a></p>' +
									'<div class="icr-meta">' +
										'<span>' + date + '</span>' +
										'<span class="icr-meta-space"></span>' +
										'<span>' + numReplies + '</span>' +
										'<span class="icr-meta-space"></span>' +
										'<span><a href="https://my.nexus.icr.ac.uk/Person.aspx?accountname=' + authorAccountName + '">' + result.Cells.results[7].Value + '</a></span>' +
									'</div>' +
								'</div>' +
							'</div>';
        });
        $('#conversations').html(resultsHtml);
		$('.line-clamp-2').ellipsis({ lines: 2 });
    }

}
function hideConversations(){
    $('#conversationsSection').hide();
}
//End of Conversations



function getNoticesNews(){
   var clientContext = new SP.ClientContext("/Notices");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
    var camlQueryString = 	'<Query>'+
								'<Where>'+
									'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq>'+
									'</Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
							'<RowLimit>4</RowLimit>';
	camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
    this.noticeItem = oList.getItems(camlQuery);

    clientContext.load(noticeItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showNoticesNews), Function.createDelegate(this, this.hideNoticesNews));    
}
function showNoticesNews(sender, args) {

    var noticeItemEnumerator = noticeItem.getEnumerator();    
    while (noticeItemEnumerator.moveNext()) {

        var oListItem = noticeItemEnumerator.get_current();

        var link = oListItem.get_item('FileRef');
        var title = oListItem.get_item('Title');
        var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
               
        var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
        var imagesrc = pic;
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        }
        var text = "";        
        text = '<div class="icr-container-wrapper"><div class="container-md bg-white"><a href="'+link+'"><div class="sm-thumb cover-bg img-border" style="background-image:url(\''+imagesrc+'?RenditionID=8\')"></div></a>'+
        '<div class="text-table"><p class="link-dg"><a class="line-clamp-2" href="'+link+'">'+title+'</a></p><div class="icr-meta"><span>'+articleDate+'</span></div></div></div></div>';                
        $('#notices').append(text);
        $('.line-clamp-2').ellipsis({ lines: 2 });      
    }
}
function hideNocticesNews(sender, args) { }
//End News Section


//Events section
function getUpcomingEvents(){
	var userType = nexusUser.PromoteContentFor;
    switch(userType.toLowerCase()){
	 	case "researcher":
			getFilteredEvents1("Scientific");
			getFilteredEvents2("Organisational");
		break;
		
		case "corporate":
			getFilteredEvents1("Organisational");
			getFilteredEvents2("Scientific");
		break;
		
		case "student":
			getFilteredEvents1("Student");
			getFilteredEvents2("Scientific");
		break;
		
		default:
			getFilteredEvents1("Scientific");
			getFilteredEvents2("Organisational");		
    }
}
function getFilteredEvents1(categoryFilter1){
	var clientContext1 = new SP.ClientContext("/Events");
	var oList = clientContext1.get_web().get_lists().getByTitle('Events');
	//run two separate queries, or else you cannot set the correct row limit
	var camlQuery1 = new SP.CamlQuery();
	camlQueryString1 = 	'<Query>'+
							'<Where><And>'+
								'<Gt><FieldRef Name="EventDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today /></Value></Gt>'+
								'<Eq><FieldRef Name="Category" /><Value Type="Choice">' + categoryFilter1 + '</Value></Eq>'+
							'</And></Where>'+
							'<OrderBy><FieldRef Name="EventDate" Ascending="True" /></OrderBy>'+
						'</Query>'+
						'<RowLimit>5</RowLimit>';					
	camlQuery1.set_viewXml('<View>'+camlQueryString1+'</View>');			
	this.filteredEventsItem1 = oList.getItems(camlQuery1);
	this.category1 = categoryFilter1;
	clientContext1.load(filteredEventsItem1);
	clientContext1.executeQueryAsync(Function.createDelegate(this, this.showFilteredEvents1), Function.createDelegate(this, this.hideFilteredEvents1));    
}
function showFilteredEvents1(sender, args){
    var filteredEventsItemEnumerator1 = filteredEventsItem1.getEnumerator();	
	//set color
	//var catColor = eventCategoryColor(category1);
	var catColor = category1;
	//Add event category titles
	$('#eventNav1').append(category1);
	$('#eventNav1').addClass('tab-border-'+catColor);
	
    while (filteredEventsItemEnumerator1.moveNext()) {
		
        var oListItem = filteredEventsItemEnumerator1.get_current();
        var id = oListItem.get_item('ID');
		var link = "/events/Lists/events/event.aspx?ID="+id;
		//get the Title, and trim it if it too long
		var title = oListItem.get_item('Title');
		if(title.length>150){
            title = title.substring(0,150) + '..';
        }
		
		//get the Description
        //var description = oListItem.get_item('Description');
		
        var eventStartDate = moment(oListItem.get_item('EventDate')).format("DD MMM");
        var day = eventStartDate.split(' ')[0];
        var month = eventStartDate.split(' ')[1];
		
        var text = "";        
        text = '<div class="eventItem dis-tr pb-20"><div class="cal-wrapper dis-tc"><div class="cal-month bg-' + catColor + '"><h6 class="text-white">'+month+'</h6></div>'+
                '<div class="cal-day"><h6 class="text-grey">'+day+'</h6></div></div><div class="text-table dis-tc"><h5 class="text-bold link-dg">'+
                '<a class="line-clamp-2" href="'+link+'" title="'+title+'">'+title+'</a></h5>'+
				//'<h5 class="line-clamp-2 icr-meta">'+description+'</h5>'+
				'</div></div>';		
		//append the text to the calendar
		$('#eventsTab1').append(text);
		$('.line-clamp-2').ellipsis({ lines: 2 });	
    }
	
	//add buttons
	var htmlButton = '<div class="btn-no-padding"><a class="icr-btn btn-' + catColor + '" href="/Events/Lists/Events/' + category1 + ' events.aspx">View all ' + category1 + ' events<span class="glyphicon glyphicon-chevron-right"></span></a></div>';
	$('#eventsTab1').append(htmlButton);
	
	//remove button under the "More" tab
	$('#moreEvents-' + category1).addClass('hideDefault');
	
}
function hideFilteredEvents1(sender, args){}

function getFilteredEvents2(categoryFilter2){
	var clientContext2 = new SP.ClientContext("/Events");
	var oList = clientContext2.get_web().get_lists().getByTitle('Events');
	//run two separate queries, or else you cannot set the correct row limit
	var camlQuery2 = new SP.CamlQuery();
	camlQueryString2 = 	'<Query>'+
							'<Where><And>'+
								'<Gt><FieldRef Name="EventDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today /></Value></Gt>'+
								'<Eq><FieldRef Name="Category" /><Value Type="Choice">' + categoryFilter2 + '</Value></Eq>'+
							'</And></Where>'+
							'<OrderBy><FieldRef Name="EventDate" Ascending="True" /></OrderBy>'+
						'</Query>'+
						'<RowLimit>5</RowLimit>';						
	camlQuery2.set_viewXml('<View>'+camlQueryString2+'</View>');			
	this.filteredEventsItem2 = oList.getItems(camlQuery2);
	this.category2 = categoryFilter2;
	clientContext2.load(filteredEventsItem2);
	clientContext2.executeQueryAsync(Function.createDelegate(this, this.showFilteredEvents2), Function.createDelegate(this, this.hideFilteredEvents2));    
}
function showFilteredEvents2(sender, args){
    var filteredEventsItemEnumerator2 = filteredEventsItem2.getEnumerator();	
	//set color
	//var catColor = eventCategoryColor(category2);
	var catColor = category2;
	//Add event category titles
	$('#eventNav2').append(category2);
	$('#eventNav2').addClass('tab-border-'+catColor);
	
    while (filteredEventsItemEnumerator2.moveNext()) {
		
        var oListItem = filteredEventsItemEnumerator2.get_current();
        var id = oListItem.get_item('ID');
		var link = "/events/Lists/events/event.aspx?ID="+id;
		//get the Title, and trim it if it too long
		var title = oListItem.get_item('Title');
		if(title.length>150){
            title = title.substring(0,150) + '..';
        }
		
		//get the Description
        //var description = oListItem.get_item('Description');
		
        var eventStartDate = moment(oListItem.get_item('EventDate')).format("DD MMM");
        var day = eventStartDate.split(' ')[0];
        var month = eventStartDate.split(' ')[1];
		
        var text = "";        
        text = '<div class="eventItem dis-tr pb-20"><div class="cal-wrapper dis-tc"><div class="cal-month bg-' + catColor + '"><h6 class="text-white">'+month+'</h6></div>'+
                '<div class="cal-day"><h6 class="text-grey">'+day+'</h6></div></div><div class="text-table dis-tc"><h5 class="text-bold link-dg">'+
                '<a class="line-clamp-2" href="'+link+'" title="'+title+'">'+title+'</a></h5>'+
				//'<h5 class="line-clamp-2 icr-meta">'+description+'</h5>'+
				'</div></div>';	
		//append the text to the calendar
		$('#eventsTab2').append(text);
		$('.line-clamp-2').ellipsis({ lines: 2 });
    }
	
	//add buttons
	
	var htmlButton = '<div class="btn-no-padding"><a class="icr-btn btn-' + catColor + '" href="/Events/Lists/Events/' + category2 + ' events.aspx">View all ' + category2 + ' events<span class="glyphicon glyphicon-chevron-right"></span></a></div>';
	$('#eventsTab2').append(htmlButton);
	
	//remove button under the "More" tab
	$('#moreEvents-' + category2).addClass('hideDefault');	
	
}
function hideFilteredEvents2(sender, args){}
//End of Events section


//Tools and System section
function getToolsAndSystems(numberofItems){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Tools and Systems');
    var camlQuery = new SP.CamlQuery();
    camlQueryString = 	'<Query>'+
							//'<Where><Contains><FieldRef Name="icr_UserType" /><Value Type="LookupMulti">'+userType+'</Value></Contains></Where>'+
							'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
						'</Query>'+
						'<RowLimit>'+numberofItems+'</RowLimit>';
	camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');							
    this.toolsItem = oList.getItems(camlQuery);
    this.numberofItems = numberofItems;
    clientContext.load(toolsItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showToolsAndSystems), Function.createDelegate(this, this.hideToolsAndSystems)); 
}

function showToolsAndSystems(sender, args){
    var toolsItemEnumerator = toolsItem.getEnumerator();
    var count = toolsItem.get_count();
    if(count>0){
        if (count < 8) {
            $('#loadMoreTools').hide();
        }
        else {
            $('#loadMoreTools').show();
        }
        $('#toolandsystems').empty();    
        while (toolsItemEnumerator.moveNext()) {

            var item = toolsItemEnumerator.get_current();
            
            var promoImage = item.get_item('PublishingRollupImage');
            var imsSrc = promoImage;
			if (promoImage) {				
				if(promoImage.indexOf("<a")!=-1){
                imgSrc = $(promoImage).find("img:first").attr("src");
				}
				else{
					imgSrc = $(promoImage).attr("src");
				}
			}
			else {
				imgSrc = '';
			}
            
            var title= item.get_item('Title');
            var description = item.get_item('Description');
            var link = item.get_item('Link').get_url();
			var additional = item.get_item('Additional_x0020_information');
			if (additional) {additional = '<a class="tools-instructions" title="' + additional.get_description().trim() + '" href="' + additional.get_url() +'"></a>'; } else { additional = ''; }
            var html = '<div class="col-md-3 col-sm-6 col-xs-12">' + 
							'<div class="content-wrapper">'+
								'<a href="' + link + '" ' + 'class="tools-thumb cover-bg" style="background-image: url(\'' + imgSrc + '?RenditionID=10\')"></a>'+
								'<div class="text-table">' +
									'<h4 class="line-clamp-1"><a title="' + title + '" href="' + link + '">' + title + '</a></h4>' +
									'<h5 class="line-clamp-2 icr-meta">' + description + '</h5>' +
									additional +
								'</div>' +
							'</div>' +
						'</div>';
            $('#toolandsystems').append(html); 
            $('.line-clamp-2').ellipsis({ lines: 2 });     
        }
    }
    else{
        $('#toolandsystemsSection').hide();
		console.log('Success in loading the tools, but found 0 of them');
    }
}
function hideToolsAndSystems(sender, args){
    $('#toolandsystemsSection').hide();
	console.log("Error in fetching the list of Tools\n" + xhr.status + "\n" + thrownError);
}
//End of Tools and System section

//Get User followed sites
function getUserFollowedSites(){
    var followedSitesRestSource = _spPageContextInfo.siteAbsoluteUrl +'/_api/social.following/my/followed(types=4)' ;
    $.ajax({
        url: followedSitesRestSource,
        headers:{"accept":"application/json;odata=verbose"},
        success: showFollowed,
        error: hideFollowed
    });

}
function showFollowed(data){
    var stringData = JSON.stringify(data);
    var jsonObject = JSON.parse(stringData);
    var followed = jsonObject.d.Followed.results;
    var count=0;
	var groupNamesArray = [];
    if(followed.length>0){
        for(var i=0;i<followed.length;i++){
			var name = followed[i].Name;
			groupNamesArray.push(name);
			var link = followed[i].Uri;
			if(link.indexOf('/teams')>0){
			   if(count<5){
                    var html = '<div class="icr-container-wrapper"><div class="container-md"><h4><a href="'+link+'">'+name+'</a></h4>';
						html += '</div></div>';
                    count++;
                    $('#myGroups').append(html);
				}
			}
        }		
    }
    else{
        $('#myGroupsSection').hide();
    }
	getRecommendedGroups(groupNamesArray)
}
function hideFollowed(sender,args){
     $('#myGroupsSection').hide();
}   
//End of User followed sites


//Recommended Groups
function getRecommendedGroups(excludeGroupsArray){
	
    var clientContext = new SP.ClientContext("/");
	var userType = nexusUser.PromoteContentFor;
    var oList = clientContext.get_web().get_lists().getByTitle('Collaboration Groups Promo Links');
	var camlQuery = new SP.CamlQuery();
	var camlQueryString;
	if (excludeGroupsArray.length) {
		var excludeThis = '';
		for (var i = 0; i < excludeGroupsArray.length; i++) {
			if (i == 0 ) {
				excludeThis += '<Neq><FieldRef Name="Title" /><Value Type="Text">' + excludeGroupsArray[i] + '</Value></Neq>';	
			} else {
				excludeThis = 	'<And>' + 
									excludeThis + 
									'<Neq><FieldRef Name="Title" /><Value Type="Text">' + excludeGroupsArray[i] + '</Value></Neq>' + 
								'</And>';
			}		
		}	
		camlQueryString = '<View><Query>'+
								'<Where><And>'+
									excludeThis +	
									'<And>'+
										'<Contains><FieldRef Name="icr_UserType" /><Value Type="LookupMulti">'+userType+'</Value></Contains>'+
										'<IsNotNull><FieldRef Name="icr_TeamSiteLink" /></IsNotNull>'+
									'</And>'+
								'</And></Where>'+
								'<OrderBy><FieldRef Name="Created" Ascending="False" /></OrderBy></Query>'+
								'<RowLimit>3</RowLimit></View>';
		
	} else {
		camlQueryString = '<View>'+
							'<Query>'+
								'<Where><And>'+
									'<Contains><FieldRef Name="icr_UserType" /><Value Type="LookupMulti">'+userType+'</Value></Contains>'+
									'<IsNotNull><FieldRef Name="icr_TeamSiteLink" /></IsNotNull>'+
								'</And></Where>'+
								'<OrderBy><FieldRef Name="Created" Ascending="False" /></OrderBy>'+
							'</Query>'+
							'<RowLimit>3</RowLimit>'+
						   '</View>';	
	}
	
	camlQuery.set_viewXml(camlQueryString)
    this.recommendedGroups = oList.getItems(camlQuery);
    clientContext.load(recommendedGroups);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showRecommendedGroups), Function.createDelegate(this, this.hideRecommendedGroups));
}

function showRecommendedGroups(sender,args){
    var recommendedGroupsEnumerator = recommendedGroups.getEnumerator();
    var count = recommendedGroups.get_count();
    var type= '';
    if(count>0){ 
        while (recommendedGroupsEnumerator.moveNext()) {

            var oListItem = recommendedGroupsEnumerator.get_current();

            var link = oListItem.get_item('icr_TeamSiteLink');
            
            var title = oListItem.get_item('Title');            
            var id = oListItem.get_item('ID');       
                              
            var resultsHtml = '<div class="icr-container-wrapper"><div class="container-md"><h4><a href="'+link+'">'+title+'</a></h4></div></div>';
            $('#recommendedGroups').append(resultsHtml); 
        }
    }
    else{
        $('#recommendedGroupsSection').hide();
    }
}
function hideRecommendedGroups(sender, args){
    $('#recommendedGroupsSection').hide();
}


//Get Featured Project Details
function getFeaturedProject(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Featured Project');

    var camlQuery = new SP.CamlQuery();
	camlQueryString = 	'<Query>'+
							'<OrderBy><FieldRef Name="Created" Ascending="False" /></OrderBy>'+
						'</Query>'+
						'<RowLimit>1</RowLimit>';
	camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
    this.featuredProjectItem = oList.getItems(camlQuery);

    clientContext.load(featuredProjectItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showFeaturedproject), Function.createDelegate(this, this.hideFeaturedproject)); 
}
function showFeaturedproject(sender,args){
    var featuredProjectItemEnumerator = featuredProjectItem.getEnumerator();    
    while (featuredProjectItemEnumerator.moveNext()) {

        var oListItem = featuredProjectItemEnumerator.get_current();        
        var title = oListItem.get_item('Title');
        var link = oListItem.get_item('Link');
		var display_text = oListItem.get_item('Display_x0020_text');
		var date = moment(oListItem.get_item('Modified')).format('DD MMM'); 
		var linkChop = link.indexOf('/SitePages/');
		if ( linkChop > 0 ){ link = link.substr(0,linkChop); } //the link needs to point to the group root
        
		featuredProjectSite = link;
		var buttonText = oListItem.get_item('Text_x0020_in_x0020_button');
		if(!buttonText) {buttonText = 'View site'; }	
        var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : '<img src="/style%20library/ICR/Images/featuredp.jpg"'
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        }                    
        var text = "";        
        text = '<div class="container-md"><h2 class="line-clamp-3">'+title+'</h2><div class="img-responsive pb-20 fl"><a href="'+link+'"><img src="'+imagesrc+'?RenditionID=5" /></a></div>'+
               '<div class="fl"><p><a href="'+link+'">'+display_text+'</a></p><h6>' + date + '</h6></div></div>';
                      
        $('#featuredProject').append(text);
		$('.line-clamp-3').ellipsis({ lines: 3 }); 
        $('#featuredProjectLink').prop('href',link);
		$('#featuredProjectLink').html(buttonText + ' <span class="glyphicon glyphicon-chevron-right"></span>');
        try {getLatestDocument(link); } catch(e) { console.log(e); }
        try {getLatestCoversation(link); } catch(e) { console.log(e); }       
    }
}
function hideFeaturedproject(sender, args){}

function getLatestDocument(link){
    if(link.substring(-1,1) =='/'){
        link = link.slice(0,-1);
    }
    var clientContext = new SP.ClientContext(link);
    var oList = clientContext.get_web().get_lists().getByTitle('Documents');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View Scope="RecursiveAll"><Query><Where><Neq><FieldRef Name="ContentType" /><Value Type="Computed">Folder</Value></Neq></Where><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query><RowLimit>1</RowLimit></View>');

    this.featuredDocumentItem = oList.getItems(camlQuery);
    this.link = link;

    clientContext.load(featuredDocumentItem, 'Include(Title,ContentType,File,Editor)');

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showFeaturedDocument), Function.createDelegate(this, this.hideFeaturedDocument)); 
}
function showFeaturedDocument(){
    var featuredDocumentItemEnumerator = featuredDocumentItem.getEnumerator();
    //var link = link;    
    while (featuredDocumentItemEnumerator.moveNext()) {

        var oListItem = featuredDocumentItemEnumerator.get_current();
        var ct = oListItem.get_contentType();
        if(ct.get_name() !="Folder"){
            var file = oListItem.get_file();
            var editorID  = oListItem.get_item('Editor').get_lookupId();
            var editorValue  = oListItem.get_item('Editor').get_lookupValue();
            var title = file.get_title();
            var name = file.get_name();
           
            var imgSrc ='';
            var ext = name.split('.').pop().toLowerCase();
            if(ext.indexOf('doc')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_doc.png"
            }
            else if(ext.indexOf('ppt')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_ppt.png"
            }
            else if(ext.indexOf('xls')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_xls.png"
            }
            else if(ext.indexOf('pdf')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_pdf.png"
            }
            else if(ext.indexOf('jpg')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_image.png"
            }
            else if(ext.indexOf('png')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_image.png"
            }
            else if(ext.indexOf('txt')!=-1){
                imgSrc ="/style library/ICr/Images/Icons/icon_txt.png"
            }
            else{ 
                imgSrc ="/style library/ICr/Images/Icons/icon_blank.png"
            }
            var path = file.get_serverRelativeUrl();
            var date = moment(file.get_timeLastModified()).format('DD MMM'); 
            var userdetails = link +"/_layouts/15/userdisp.aspx?ID="+editorID;          
            var text = '<div class="container-md"><h4 class="pb-20 text-bold">Latest document</h4>'+
                        '<div class="attachments-wrapper"><div class="doctype_thumb"><a href="'+path+'"><img src="'+imgSrc+'"></a></div><div class="text-table"><p>'+
                        '<a href="'+path+'">'+name+'</a></p><div class="icr-meta"><span>'+date+'</span>'+
                        '<span class="icr-meta-space"></span><span><a href="'+userdetails+'">'+editorValue+'</a></span></div></div></div></div>';
                    
            $('#featuredDocument').append(text);            
        }      
    }
}
function hideFeaturedDocument(sender,args){
    $('#featuredDocument').hide(); 
}

function getLatestCoversation(link){
    if(link.substring(-1,1) =='/'){
        link = link.slice(0,-1);
    }
    var latestDocument = link+"/_api/web/lists/getByTitle('Discussion Board')/items?$filter=ContentType eq 'Discussion'&$select=*,ParentItemID,EncodedAbsUrl,Author/FirstName,Author/LastName,Author/EMail&$expand=Author&$top=1&$orderby=Modified desc";
    $.ajax({
        url: latestDocument,
        headers:{"accept":"application/json;odata=verbose"},
        success: showFeaturedCoversationApi,
        error: hideFeaturedConversation
    });
}
function showFeaturedCoversationApi(data){
    var results = data.d.results;    
    if(results.length==0){
        $('#featuredConversation').hide();
    }
    else{
        var resultsHtml='';
        $.each(results, function(index, result){
            var date = moment(result.Modified).format('DD MMM');
            var title = result.Title; 
            var editorID = result.AuthorId;
            var editorValue = result.Author.FirstName +' '+ result.Author.LastName;
            var email = result.Author.EMail;
            var imagesrc = (email !=null && email !=undefined && email.length >0) ? '/_layouts/userphoto.aspx?size=S&accountName='+email : '/_layouts/userphoto.aspx?size=S'
            var userdetails = featuredProjectSite+"/_layouts/15/userdisp.aspx?ID="+editorID;
            var itemLink = result.EncodedAbsUrl;
            resultsHtml += ' <div class="container-md"><h4 class="pb-20 text-bold">Latest conversation</h4><div class="sm-thumb cover-bg img-border" style="background-image:url(\''+imagesrc+'\')"></div>'+
                    '<div class="text-table"><p><a href="'+itemLink+'">'+title+'</a></p><div class="icr-meta"><span>'+date+'</span>'+
                    '<span class="icr-meta-space"></span><span><a href="'+userdetails+'">'+editorValue+'</a></span></div></div></div>';
        
        });
        $('#featuredConversation').append(resultsHtml); 
    }

}
function showFeaturedCoversation(sender, args){
    var featuredConversationItemEnumerator = featuredConversationItem.getEnumerator();
    while (featuredConversationItemEnumerator.moveNext()) {

        var oListItem = featuredConversationItemEnumerator.get_current();
        
        var editorID  = oListItem.get_item('Author').get_lookupId();
        var editorValue  = oListItem.get_item('Author').get_lookupValue();
        //var path = file.get_serverRelativeUrl();
        var date = moment(oListItem.get_item('Modified')).format('DD MMM'); 
        var title = oListItem.get_item('Title');
        
        var imgSrc ='';
       
       
        var userdetails = link +"/_layouts/15/userdisp.aspx?ID="+editorID;          
        var text = ' <div class="container-md"><h4 class="pb-20 text-bold">Latest conversation</h4><div class="sm-thumb cover-bg img-border" style="background-image:url('+imgSrc+')"></div>'+
                    '<div class="text-table"><p><a href="#">'+title+'</a></p><div class="icr-meta"><span>'+date+'</span>'+
                    '<span class="icr-meta-space"></span><span><a href="'+userdetails+'">'+editorValue+'</a></span></div></div></div>';
        $('#featuredConversation').append(text);    
    }
}
function hideFeaturedConversation(sender,args){}
//End of Featured Project

// My feed
function getMyFeed() {
    $.ajax( {
        url: _spPageContextInfo.siteAbsoluteUrl  + "/_api/social.feed/my/news(MaxThreadCount=8)",
        headers: { 
            "accept": "application/json;odata=verbose"
        },
        success: feedRetrieved,
        error: function (xhr, ajaxOptions, thrownError) { 
            console.log("GET error:\n" + xhr.status + "\n" + thrownError);
        }
    });    
}

function feedRetrieved(data) {
    var stringData = JSON.stringify(data);
    var jsonObject = JSON.parse(stringData); 
 
    var feed = jsonObject.d.SocialFeed.Threads; 
    var threads = feed.results;
    var feedContent = "";
    for (var i = 0; i < threads.length; i++) {
        var thread = threads[i];
        var participants = thread.Actors;
        var owner = participants.results[thread.OwnerIndex].Name;
        var linkIndex = thread.RootPost.Overlays.results.length;
        var link = ''
        if(linkIndex ==1){
            link = thread.RootPost.Overlays.results[0].LinkUri;
        }
        else if(linkIndex ==2){
            link = thread.RootPost.Overlays.results[1].LinkUri;
        }
        else{
            link='';
        }
        
        if(link !=null && link !=undefined && link.length>0){
            feedContent += '<div class="icr-container-wrapper"><div class="container-md"><h5><a class="line-clamp-2" href="'+link+'">'+ thread.RootPost.Text + '</a></h5></div></div>';
        }
        else {
            feedContent += '<div class="icr-container-wrapper"><div class="container-md"><h5>'+thread.RootPost.Text + '</h5></div></div>';
        }
    }  
    $("#myFeed").html(feedContent); 
	$('.line-clamp-2').ellipsis({ lines: 2 });
}

function getINeedTo(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('I need to Promo Links');
    var camlQuery = new SP.CamlQuery();
	var userType = nexusUser.PromoteContentFor;
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="UserType" /><Value Type="Choice">'+userType+'</Value></Eq></Where>'+
                            '<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query><RowLimit>5</RowLimt></View>');
                            
    this.tasks = oList.getItems(camlQuery);
    clientContext.load(tasks);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showINeedTo), Function.createDelegate(this, this.hideINeedTo));
}
function showINeedTo(){
    var taskEnumerator = tasks.getEnumerator();
    var count = tasks.get_count();
    var type= '';
    if(count>0){  
        
		while (taskEnumerator.moveNext()) {

            var oListItem = taskEnumerator.get_current();
            var title = oListItem.get_item('Title');            
            var id = oListItem.get_item('ID');
			var URL_Item = oListItem.get_item('Link');
			var INeedToURL = '';
			if (URL_Item) {
				INeedToURL = URL_Item.get_url()
			} 			
           
            var resultsHtml = '<div class="icr-container-wrapper" class="iNeedTo-' + id + '""><a href="' + INeedToURL + '"><div class="container-md"><h4 class="line-clamp-1 text-bold mb-0">' + title + '<span class="glyphicon glyphicon-chevron-right-alt"></span></h4></div></a></div>';
            $('#taskLinks').append(resultsHtml); 
        }
    }
    else{
         console.log("No items found in the list of I Need To");
    }
        
}
function hideINeedTo(sender,args){
    console.log("Error in fetching the list of I Need To\n" + xhr.status + "\n" + thrownError);
}

function getWiFiPwd(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('WiFi passwords');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="Modified" Type="DateTime" IncludeTimeValue="TRUE" Ascending="False"/></OrderBy></Query><RowLimit>1</RowLimt></View>');                 
    this.wifi = oList.getItems(camlQuery);
    clientContext.load(wifi);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showWifiPwd), Function.createDelegate(this, this.hideWifiPwd));
}

function showWifiPwd(){
    var wifiEnumerator = wifi.getEnumerator();
    var count = wifi.get_count();

    if(count>0){  
        
		while (wifiEnumerator.moveNext()) {

            var oListItem = wifiEnumerator.get_current();

            var guest = oListItem.get_item('Guest_x0020_WiFi_x0020_password');            
            var staff = oListItem.get_item('Staff_x0020_WiFi_x0020_password');

	           
            var resultsHtml = 	'<div class="icr-container-wrapper" class="wifipwd">' +
									'<div class="container-md"><h4 class="text-bold mb-0">Wifi passwords :</h4>' +
										'<div class="mt-10"><span>Staff:</span>' + staff + '</div>' +
										'<div class="mt-10"><span>Guest:</span>' + guest + '</div>' +
									'</div>'+
								'</div>';
            $('#wifipwdbox').append(resultsHtml); 
        }
    }
    else{
         console.log("No items found in the list of wifi passwords");
    }
        
}
function hideWifiPwd(sender,args){
    console.log("Error in fetching the wifi passwords");
}

