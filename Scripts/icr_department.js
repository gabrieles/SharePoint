function getListItems(listTitle,success,error)
{
   var ctx = SP.ClientContext.get_current();
   var list = ctx.get_web().get_lists().getByTitle(listTitle);
   var items = list.getItems(SP.CamlQuery.createAllItemsQuery());
   ctx.load(items);
   ctx.executeQueryAsync(function() {
       success(items);
   },error);
}

function hideBackgroundImage(){

}

function addBackgroundImage(pageItems){
	var pageItem = pageItems.getItemAtIndex(0);
	var pic = pageItem.get_fieldValues()['PublishingRollupImage'];
    if (pic !== null) {
		var imagesrc = '';
        if (pic.indexOf("<a") != -1) {
            imagesrc = $(pic).find("img:first").attr("src");
        }
        else {
            imagesrc = $(pic).attr("src");
        } 
		$('#deptBkg').css("background-image", "url('" + imagesrc + "')"); 	
	}
	
}


//NB: department needs to be defined as global var for this to work
function getDepartmentNews(numberOfItems){
    var clientContext = new SP.ClientContext("/News");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
		camlQuery.set_viewXml('<View><Query>'+
								'<Where><And>'+
									'<Contains><FieldRef Name="icr_Departments" /><Value Type="LookupMulti">'+department+'</Value></Contains>'+
									'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq>'+
								'</And></Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
                            '<RowLimit>'+numberOfItems+'</RowLimit></View>');
    this.newsListItem = oList.getItems(camlQuery);
    clientContext.load(newsListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showDepartmentNews), Function.createDelegate(this, this.hideDepartmentNews));
}

function showDepartmentNews(){
    var listItemEnumerator = newsListItem.getEnumerator();
    var count = newsListItem.get_count();
    if(count>0){    
        while (listItemEnumerator.moveNext()) {

            var oListItem = listItemEnumerator.get_current();

            var link = oListItem.get_item('FileRef');
            var title = oListItem.get_item('Title');
            var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
            
			/* Not needed - we just want the text		
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
			*/
            var text = "";        
            text = '<div class="col-sm-6 col-xs-12"><h4><a href="'+link+'">'+title+'</a></h4><h6>'+articleDate+'</h6></div>';
            $('#departmentNews').append(text);
                  
        }
        var html = '<div class="btn-top-padding"><a class="icr-btn btn-red" href="/News?dept='+department+'">View all news<span class="glyphicon glyphicon-chevron-right"></span></a></div>';
        $('#departmentNews').append(html);
		$('#departmentNewsSection').addClass('showThis');
    }
    else{
        console.log('No news found');
    }
}
function hideDepartmentNews(){
 console.log('Error in fetching news');
}

//NB: department needs to be defined as global var for this to work
function getDepartmentNotices(numberOfItems){
    var clientContext = new SP.ClientContext("/Notices");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query>'+
								'<Where><And>'+
									'<Contains><FieldRef Name="icr_Departments" /><Value Type="LookupMulti">'+department+'</Value></Contains>'+
									'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq>'+
								'</And></Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
                            '<RowLimit>'+numberOfItems+'</RowLimit></View>');
    this.noticesListItem = oList.getItems(camlQuery);
    clientContext.load(noticesListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showDepartmentNotices), Function.createDelegate(this, this.hideDepartmentNotices));
}

function showDepartmentNotices(){
    var listItemEnumerator = noticesListItem.getEnumerator();
    var count = noticesListItem.get_count();
    if(count>0){    
        while (listItemEnumerator.moveNext()) {

            var oListItem = listItemEnumerator.get_current();

            var link = oListItem.get_item('FileRef');
            var title = oListItem.get_item('Title');
            var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
            
			/* Not needed - we just want the text		
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
			*/
            var text = "";        
            text = '<div class="col-sm-6 col-xs-12"><h4><a href="'+link+'">'+title+'</a></h4><h6>'+articleDate+'</h6></div>';
            $('#departmentNews').append(text);
                  
        }
        var html = '<div class="btn-top-padding"><a class="icr-btn btn-red" href="/Notices?dept='+department+'">View all notices<span class="glyphicon glyphicon-chevron-right"></span></a></div>';
        $('#departmentNoticesSection').append(html);
		$('#departmentNoticesSection').addClass('showThis');
    }
    else{
        console.log('No notices found');
    }
}
function hideDepartmentNotices(){
 console.log('Error in fetching notices');
}

//NB: department needs to be defined as global var for this to work
function getDepartmentFeatures(numberOfItems){
    var clientContext = new SP.ClientContext("/Features");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query>'+
								'<Where><And>'+
									'<Contains><FieldRef Name="icr_Departments" /><Value Type="LookupMulti">'+department+'</Value></Contains>'+
									'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq>'+
								'</And></Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
                            '<RowLimit>'+numberOfItems+'</RowLimit></View>');
    this.featuresListItem = oList.getItems(camlQuery);
    clientContext.load(featuresListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showDepartmentFeatures), Function.createDelegate(this, this.hideDepartmentFeatures));
}

function showDepartmentNotices(){
    var listItemEnumerator = featuresListItem.getEnumerator();
    var count = featuresListItem.get_count();
    if(count>0){    
        while (listItemEnumerator.moveNext()) {

            var oListItem = listItemEnumerator.get_current();

            var link = oListItem.get_item('FileRef');
            var title = oListItem.get_item('Title');
            var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM");
            
			/* Not needed - we just want the text		
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style%20library/ICR/Images/icr-logo-thumbnail.jpg'/>");
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
			*/
            var text = "";        
            text = '<div class="col-sm-6 col-xs-12"><h4><a href="'+link+'">'+title+'</a></h4><h6>'+articleDate+'</h6></div>';
            $('#departmentNews').append(text);
                  
        }
        var html = '<div class="btn-top-padding"><a class="icr-btn btn-red" href="/Notices?dept='+department+'">View all notices<span class="glyphicon glyphicon-chevron-right"></span></a></div>';
        $('#departmentFeaturesSection').append(html);
		$('#departmentFeaturesSection').addClass('showThis');
    }
    else{
        console.log('No features found');
    }
}
function hideDepartmentNotices(){
 console.log('Error in fetching features');
}

//NB: department needs to be defined as global var for this to work
function getDepartmentTasks(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('ICR Tasks');
	//show only top level pages, hence ask for "Parent" being null
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query>' + 
								'<Where><And>'+
									'<Contains><FieldRef Name="icr_Departments" /><Value Type="LookupMulti">'+department+'</Value></Contains>'+
									'<IsNull><FieldRef Name="Parent" /></IsNull>'+
									'</And></Where>'+
								'<OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy>'+
							'</Query></View>');
    this.departmentTasks = oList.getItems(camlQuery);
    clientContext.load(departmentTasks);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showDepartmentTasks), Function.createDelegate(this, this.hideDepartemntTasks));
}

function showDepartmentTasks(sender, args){
    var departmentTasksEnumerator = departmentTasks.getEnumerator();
	
	var htmlTitle = '';
	var show1 = false;
	var show2 = false;
	var show3 = false;
	var show4 = false;

    var count = departmentTasks.get_count();
    if(count>0){ 
        var prevCategory = '';   
        while (departmentTasksEnumerator.moveNext()) {

            var oListItem = departmentTasksEnumerator.get_current();
			
            var id = oListItem.get_item('ID');
            var title = oListItem.get_item('Title');
            
			//use the following two lines if instead of arranging the items by main menu area, you want to go down one level (For example, if instead of having the items under "Scientific support" you want them to be displayed under "Services", etc.
			//var category = oListItem.get_item('icr_TaskCategory');
            //var categoryValue = category.get_lookupValue();
			
			var categoryValue = oListItem.get_item('icr_TaskType');
            var task_link = "https://nexus.icr.ac.uk/Lists/ICR%20Tasks/DispForm.aspx?ID="+id;
            
            var categoryid = categoryValue.split(' ').join('');
            
                
            //ToDo This needs tyding up. Better to set the systemn to generate new areaa as they are needed
            var html='';
			
			switch(categoryValue){
				case "Scientific support":
					categoryid = "list1Items";
					if (show1 == false) {
						htmlTitle =  '<h4 class="text-bold ptb-20 container-md">Scientific support</h4><ul id="list1Items" class="content-list"></ul>';
						$('#list1').append(htmlTitle);
						$('#list1').addClass('showThis');
						show1 = true;
					}					
				break;
				
				case "Business support":
					categoryid = "list2Items";
					if (show2  == false) {
						htmlTitle =  '<h4 class="text-bold ptb-20 container-md">Business support</h4><ul id="list2Items" class="content-list"></ul>';
						$('#list2').append(htmlTitle);
						$('#list2').addClass('showThis');
						show2 = true;
					}
				break;
				
				case "Staff essentials":
					categoryid = "list3Items";
					if (show3 == false) {
						htmlTitle =  '<h4 class="text-bold ptb-20 container-md">Staff essentials</h4><ul id="list3Items" class="content-list"></ul>';
						$('#list3').append(htmlTitle);
						$('#list3').addClass('showThis');
						show3 = true;
					}
				break;
				
				case "Learning and education":
					categoryid = "list4Items";
					if (show4 == false) {
						htmlTitle =  '<h4 class="text-bold ptb-20 container-md">Learning and education</h4><ul id="list4Items" class="content-list"></ul>';
						$('#list4').append(htmlTitle);
						$('#list4').addClass('showThis');
						show4 = true;
					}
				break;
			}
            
            html = '<li><a href="'+task_link+'">'+title+'</a></li>';
            $('#'+categoryid).append(html);
            
            
                  
        }  
		$('#departmentTasksSection').addClass('showThis');	
    }
    else{
        console.log('No tasks found');
    }
}
function hideDepartemntTasks(sender, args){
	console.log('Error fetching tasks');
}

function fetchKeyContacts(number,columnNumber,hideKeyContacts){       
    //ProcessImn();

    var keyPeopleRestSource = "../_api/web/lists/getbytitle('Key People')/items?$select="
      + "Person/Name,Person/Id,Person/Name,Person/FirstName,Person/LastName,Person/EMail,Person/WorkPhone,Person/JobTitle&$expand=Person/Id"
      + "&$orderby=DisplayOrder"
      + "&$top="+number;

    $.ajax(
    {
        url: keyPeopleRestSource,
        headers: { "accept": "application/json; odata=verbose" },
        cache: false,
        success: function (items) {            
            displayKeyContacts(items.d.results,number,columnNumber,hideKeyContacts);
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
}

function displayKeyContacts(queryResults,number,columnNumber,hideKeyContacts){
    var totalItems = queryResults.length;
    if(totalItems<number){
        $('#loadMoreContacts').hide();
    }       
    var columnsDiv ='';
    switch(columnNumber){
		case 2:
			columnsDiv = '<div class="col-lg-6 col-sm-6 col-xs-12 col-no-padding">';
			break;
		case 3:
			columnsDiv = '<div class="col-lg-4 col-sm-6 col-xs-12 col-no-padding">';
			break;
		case 4:
			columnsDiv = '<div class="col-lg-3 col-sm-6 col-xs-12 col-no-padding">';
	}	
	
    if(totalItems > 0){
        for (var i = 0; i < queryResults.length; i++) {
            var keyContactID = queryResults[i].Person.Id;
			var keyContactAccountname = queryResults[i].Person.Name;
			keyContactAccountname = keyContactAccountname.split("|").pop().replace("\\","%5C");
            var firstName= queryResults[i].Person.FirstName != null ? queryResults[i].Person.FirstName :'';
            var lastName = queryResults[i].Person.LastName!= null ? queryResults[i].Person.LastName :'';
            var name = firstName + ' '+ lastName;
            var email = queryResults[i].Person.EMail !=null ? queryResults[i].Person.EMail : '';
            var jobTitle = queryResults[i].Person.JobTitle !=null ? queryResults[i].Person.JobTitle : '';
            var compressedemail = email !=null ? email.replace('.','').replace('@','') : i;
            var workphone = queryResults[i].Person.WorkPhone? queryResults[i].Person.WorkPhone: '';
            var picture = '/_layouts/15/userphoto.aspx?size=L&accountname='+ keyContactAccountname ;
            var html = columnsDiv +'<div class="content-wrapper"><div class="md-thumb cover-bg" style="background-image: url('+picture+')">'+
                        '</div><div class="text-table"><div style="line-height: 1"><span style="float:left" class="ms-imnSpan"><a href="#" onclick="IMNImageOnClick(event);'+
                        'return false;" class="ms-imnlink" tabindex="-1"><span class="ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10">'+
                        '<img title="" alt="No presence information" name="imnmark" src="/_layouts/15/images/spimn.png?rev=40"'+
                        ' class="ms-spimn-img ms-spimn-presence-disconnected-10x10x32" showofflinepawn="1" sip="'+email+'" '+
                        'id="imn_'+compressedemail+',type=sip"/></span></a></span><h5 class="text-bold">'+
                        '<a href="../_layouts/15/userdisp.aspx?ID='+keyContactID+'">'+name+'</a></h5></div><h5 class="pb-10">'+jobTitle+'</h5>'+
                        '<h5><a href="tel:'+workphone+'">'+workphone+'</a></h5><h5 class="text-red"><a href="mailto:'+email+'">'+email+'</a></h5></div></div>';            
            $('#keyContacts').append(html);
        }   
    }
    else{
        if(hideKeyContacts){
            $('#keyContacts').parent().parent().hide();
        }
        else{
            $('#loadMoreContacts').hide();
            $('#keyContacts').html("No key Contacts specified.");
        }
    }

}
function fetchGroupSpaces(number,columnNumber){
    var groupSpacesRestSource = "../_api/web/lists/getbytitle('Group Spaces')/items?$select="
      + "Title,Link"
      + "&$orderby=DisplayOrder"
      + "&$top="+number;

    $.ajax(
    {
        url: groupSpacesRestSource ,
        headers: { "accept": "application/json; odata=verbose" },
        cache: false,
        success: function (items) {            
            displayGroupSpaces(items.d.results,number,columnNumber);
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
}

function displayGroupSpaces(queryResults,number,columnNumber){
    var totalItems = queryResults.length;
         
    var columnsDiv ='';
    if(columnNumber == 2){
        columnsDiv = '<div class="col-lg-6 col-sm-6 col-xs-12 col-no-padding">';
    }
    
    else if(columnNumber ==3){
        columnsDiv = '<div class="col-lg-4 col-sm-6 col-xs-12 col-no-padding">';
    }
    if(totalItems > 0){
        for (var i = 0; i < queryResults.length; i++) {
            var title = queryResults[i].Title;
            var link= queryResults[i].Link.Url != null ? queryResults[i].Link.Url :'#';
            var html = columnsDiv +'<a href="' + link + '">'+ title +'</a></div>';            
            $('#groupSpaces').append(html);
        }   
    }
    else{
		$('#groupTab').hide();       
    }

}

function clippingText() {
    var $p = $('#fos p');
    var divh = $('#fos').height();
    $('#hiddenfield').val($('#fos').html()); // we are using this hidden field to store the full text as a value to be displayed in full.
    while ($p.outerHeight() > divh) {
        $p.text(function (index, text) {
            return text.replace(/\W*\s(\S)*$/, '...');
        });
    }
    if(divh<239){
        $('.call-action-sm').hide();
    }
}
    

