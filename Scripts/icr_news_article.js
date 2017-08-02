jQuery(document).ready(function($){
	var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;

	if (inDesignMode == "1")
	{
		jQuery('.news-display-mode').hide();// page is in edit mode
		var tags = document.getElementsByTagName('input');   
		for (var i=0; i < tags.length; i++) {   
			//alert(' tags[' + i + '].id=' + tags[i].id);   
			if(tags[i].id.indexOf('ArticleStartDate') > 0) {
				if(tags[i].value.length==0){
					var today = new Date();   
					var todayDay = moment().get('date');  
					var todayMon = moment().get('month')+1;  
					var todayYear = moment().get('year');
					tags[i].value = todayDay + "/" + todayMon + "/" + todayYear;   
				}   
			   
			   break; 
			}
		}
		getCurrentListItemVersion(
		function(file){
			var majorversion = file.get_majorVersion();
			var minorversion = file.get_minorVersion();
			if(minorversion>0){
				jQuery('#customPublish').show();
			}
			else{
				jQuery('#customPublish').hide();
			}
		   
		});
		
	}  
	else{
		jQuery('.news-display-mode').show();
		fetchCommentsCountAndTags();
	}

	
	var imageGallery;
	$('#pageImage').flexslider({
		animation: "slide",
		controlNav: false,
		animationLoop: false,
		slideshow: false,
		itemWidth: 100,
		itemMargin: 5,
	});               
															
});

function fetchCommentsCountAndTags(){               
	var context = SP.ClientContext.get_current();
	var web = context.get_web(); 
	var currentList = web.get_lists().getById(_spPageContextInfo.pageListId); 
	var currentListItem = currentList.getItemById(_spPageContextInfo.pageItemId);
	context.load(currentListItem);
	context.executeQueryAsync(
	 function(){
		//success(currentListItem);
		var listItem = currentListItem;
		var tags =[];
		var people =[];		
		var newsType = listItem.get_item('NewsType');
		if(newsType){tags.push(newsType);}
		var locations = listItem.get_item('icr_Locations');                    
		var departments = listItem.get_item('icr_Departments');                   
		var pic = listItem.get_item('PublishingPageImage');
		imageGallery = listItem.get_item('icr_NewsImagesFolder');
		$('#newsArticleDate').html(moment(listItem.get_item('ArticleStartDate')).format("DD MMMM YYYY"));
		var firstLocation =null;
		var firstBusinessUnit =null;                       
		var firstDepartment =null;
		var peopleArray = listItem.get_item('People');
		var imagesrc = ""; 
		if(pic == null || pic == undefined) {
			$(".article-img-aside").hide();
		}
		else{
			if(pic.indexOf("<a")!=-1){
				imagesrc= $(pic).find("img:first").attr("src");
			}
			else{
				imagesrc= $(pic).attr("src");
			}
			if(imagesrc.length>0){
				$("#pageImage").append('<a href="'+ imagesrc +'" data-lightbox="example-set"><img src="'+imagesrc+'" />'); 
			}
			else{
				$(".article-img-aside").hide();
			}
		}                      
		
		//$('#articlecontactId').val(listItem.get_item('PublishingContact').get_lookupId());
		if(locations!= null && locations!= undefined && locations.length>0){
			firstLocation = locations[0].get_lookupValue();
			for(var i=0; i<locations.length;i++){
				tags.push(locations[i].get_lookupValue());
			}
		}                  
		
		if(departments!= null && departments!= undefined && departments.length>0){
			firstDepartment = departments[0].get_lookupValue();
			for(var i=0; i<departments.length;i++){
				tags.push(departments[i].get_lookupValue());
			}
		}
		
		if(peopleArray!= null && peopleArray!= undefined && peopleArray.length>0){
			$('#peopleList-wrapper').show(); 
			var peopleHTML = '';
			for(var h=0; h<peopleArray.length; h++){
				peopleHTML = peopleHTML + 
							'<h5 class="people-tag">' +
								'<a href="/_layouts/15/userdisp.aspx?ID='+peopleArray[h].get_lookupId() + '">'
									+ peopleArray[h].get_lookupValue() + 
								'</a>' +
							'</h5>'; 
			}
			$('#peopleListItems').append(peopleHTML);
		}
		
		for(var j=0; j<tags.length; j++){
			var tagHTML = '<h6 class="icr-tag">'+tags[j]+'</h6>';
			$('#newsTagsItems').append(tagHTML);
		}                  
		
		var allowComments = listItem.get_item('Allow_x0020_comments');
		console.log(allowComments);
		if(allowComments) {
			fetchComments(_spPageContextInfo.pageItemId, 'comments-container', 10);
		}
		
		if(imageGallery!= null && imageGallery!= undefined && imageGallery.length>0){
			getImages(imageGallery, "carousel");                        
		}
		
		var id = listItem.get_id();
		getTopNews(id);
		getRelatedNews(newsType,firstLocation,firstDepartment,id);
			
	 }, 
	 function(error){
		console.log('There was an error in retrieving the news item');
	 }
	);
}



function getTopNews(id){
	var clientContext = SP.ClientContext.get_current();
	var oList = clientContext.get_web().get_lists().getById(_spPageContextInfo.pageListId);

	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml('<View>'+
								'<Query>'+
									'<Where>'+
										'<And><Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq>'+
										'<Neq><FieldRef Name="ID" /><Value Type="Counter">'+id+'</Value></Neq></And>'+
									//	'<And><Eq><FieldRef Name="NewsType" /><Value Type="Choice">General</Value></Eq></And>'+
									'</Where>'+
									'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
								'</Query>'+
								'<RowLimit>3</RowLimit>'+
							'</View>');
	this.topNewsListCollection = oList.getItems(camlQuery);

	clientContext.load(topNewsListCollection);

	clientContext.executeQueryAsync(Function.createDelegate(this, this.showMoreNews), Function.createDelegate(this, this.hideMoreNews));
}

function showMoreNews(sender,args){
	if(topNewsListCollection.get_count()>0){
		var listItemEnumerator = topNewsListCollection.getEnumerator();                
		while (listItemEnumerator.moveNext()) {

			var oListItem = listItemEnumerator.get_current();

			var link = oListItem.get_item('FileRef');
			var title = oListItem.get_item('Title');
			var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM YYYY");
			
			var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : (oListItem.get_item('PublishingPageImage') !== null ? oListItem.get_item('PublishingPageImage') : "<img src='/style library/icr/Images/icr-logo-thumbnail.jpg'/>");
			var imagesrc = pic;
			if (pic.indexOf("<a") != -1) {
				imagesrc = $(pic).find("img:first").attr("src");
			}
			else {
				imagesrc = $(pic).attr("src");
			}
			var text = "";
			text = '<div class="container-full-width"><a href="'+link+'" class="md-thumb cover-bg img-border" style="background-image:url(\''+imagesrc+'\')"></a><div class="text-table"><h6 class="pb-10"><a href="'+link+'">'+title+'</a></h6><div class="icr-meta"><span>'+articleDate+'</span></div></div></div>';
			$("#topNews").append(text);
			var areaName = window.location.pathname;
			console.log(areaName);
			areaName = areaName.split("/")[1];
			console.log(areaName);
			$("#topNewsTitle").text("More " + areaName.toLowerCase());	
			$("#topNewsTitle").attr("href","/" + areaName);	
		}
	}
	else{
		$('#topNewsSection').hide();
	}
}
function hideMoreNews(sender,args){
	$('#topNewsSection').hide();
}



function getRelatedNews(newsType,locations,departments,id){
	var orConditions ="";
	if(newsType =="Notice")
	{
		orConditions = "<Eq><FieldRef Name='NewsType' /><Value Type='Choice'>Notice</Value></Eq>";        
	}
	else{
		if(locations!=null){
			orConditions = "<Contains><FieldRef Name='icr_Locations' /><Value Type='LookupMulti'>"+locations+"</Value></Contains>";
			if(departments!=null){
				orConditions = "<Or>"+ orConditions + "<Contains><FieldRef Name='icr_Departments' /><Value Type='LookupMulti'>"+departments+"</Value></Contains></Or>" 
			}                        
			
		}                    
		else if(departments!=null){
			orConditions = "<Contains><FieldRef Name='icr_Departments' /><Value Type='LookupMulti'>"+departments+"</Value></Contains>";
		}
	}
			
	var clientContext = SP.ClientContext.get_current();
	var oList = clientContext.get_web().get_lists().getById(_spPageContextInfo.pageListId);

	var camlQuery = new SP.CamlQuery();
	
	var camlQueryString = 	'<Query>'+
								'<Where>'+
									'<Leq><FieldRef Name="ArticleStartDate" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today/></Value></Leq>'+
									'<And><Neq><FieldRef Name="ID" /><Value Type="Counter">'+id+'</Value></Neq>'
									+orConditions+
								'</Where>'+
								'<OrderBy><FieldRef Name="ArticleStartDate" Ascending="False" /></OrderBy>'+
							'</Query>'+
							'<RowLimit>4</RowLimit>';
							
	camlQuery.set_viewXml('<View>'+camlQueryString+'</View>');
	this.relatedNewsCollection = oList.getItems(camlQuery);

	clientContext.load(relatedNewsCollection);

	clientContext.executeQueryAsync(Function.createDelegate(this, this.showRelatedNews), Function.createDelegate(this, this.hideRelatedNews));               
}
function showRelatedNews(){
	if(relatedNewsCollection.get_count()>0){
		var listItemEnumerator = relatedNewsCollection.getEnumerator();                
		while (listItemEnumerator.moveNext()) {

			var oListItem = listItemEnumerator.get_current();

			var link = oListItem.get_item('FileRef');
			var title = oListItem.get_item('Title');
			var articleDate = moment(oListItem.get_item('ArticleStartDate')).format("DD MMM YYYY");


			var text = "";
			text='<div class="container-md"><p><a href="'+link+'">'+title+'</a></p><div class="icr-meta">'+
				  '<span>'+articleDate+'</span></div></div>'

			$("#relatedNews").append(text);
		   
		}
	}
	else{
		$('#relatedNewsSection').hide();
	}
}
function hideRelatedNews(sender,args){
	$('#relatedNewsSection').hide();
}
