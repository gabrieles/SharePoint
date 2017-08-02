function getPromoLinks(numberOfItems,containerId,listName){    
    var ctx = SP.ClientContext.get_current();
    var list = ctx.get_web().get_lists().getByTitle(listName);
    this.items = list.getItems(SP.CamlQuery.createAllItemsQuery());
    this.containerId = containerId;
    this.listName = (null!=listName && listName != undefined)? listName : 'Promo Links';
    this.numberOfItems = (null!=numberOfItems && numberOfItems != undefined)? numberOfItems : 18;
    ctx.load(items);
    ctx.executeQueryAsync(Function.createDelegate(this,this.displayPromoLinks),Function.createDelegate(this,this.hidePromoLinks));    
}

function displayPromoLinks(sender, args){
    var listItemEnumerator = items.getEnumerator();
    while(listItemEnumerator.moveNext()){
        var item = listItemEnumerator.get_current();
        var promoImage = item.get_item('PublishingRollupImage');
        var imsSrc = promoImage;
        if(promoImage.indexOf("<a")!=-1){
            imgSrc = $(promoImage).find("img:first").attr("src");
        }
        else{
            imgSrc = $(promoImage).attr("src");
        }
        var title= item.get_item('Title');
        var description = item.get_item('Description');
        var link = item.get_item('Link').get_url();
        var html = '<div class="col-md-4 col-xs-12 rainbow-block"><a href="'+link+'" class="container-md">'+
                        '<div class="md-thumb cover-bg img-border" style="background-image:url('+imgSrc+')"></div>'+
                        '<div class="text-table"><h4 class="text-bold line-clamp-2 pb-10">'+title+'</h4>'+
                        '<h5>'+description+'</h5></div></a></div>';
        $('#'+containerId).append(html); 
    }
}
function hidePromoLinks(sender, args){
    $('#'+containerId).hide(); 
}

function fixSummaryLinkGroups() {
// add a css class to "Summary of link group names" that begin with "_" - thsi way you can ses CSS to hide those group titles and avoid indenting the items under these groups
$('.slm-layout-main .groupheader').filter(function() {
   return $(this).text().indexOf("_") === 0; 
 }).addClass("groupheaderHidden");
	
}

function fetchKeyContacts(number,columnNumber,hideKeyContacts){       
    ProcessImn();

    var keyPeopleRestSource = "../_api/web/lists/getbytitle('Key People')/items?$select="
      + "Person/Id,Person/Name,Person/FirstName,Person/LastName,Person/EMail,Person/WorkPhone,Person/JobTitle&$expand=Person/Id"
      + "&$orderby=DisplayOrder"
      + "&$top="+number;

    $.ajax(
    {
        url: keyPeopleRestSource,
        headers: { "accept": "application/json; odata=nometadata" },
        cache: false,
        success: function (items) {            
            displayKeyContacts(items.value,number,columnNumber,hideKeyContacts);
        },
        error: function (err) {
            console.log(JSON.stringify(err));
        }
    });
}

function displayKeyContacts(queryResults,number,columnNumber,hideKeyContacts){
    var totalItems = queryResults.length;
    if(totalItems<number){
        $('#loadMoreContacts').hide();
    }       
    var columnsDiv ='';
    if(columnNumber == 3){
        columnsDiv = '<div class=\'col-xs-12 col-sm-6 col-md-4\'>';
    }
    
    else if(columnNumber ==4){
        columnsDiv = '<div class=\'col-xs-12 col-sm-6 col-md-3\'>';
    }
    if(totalItems > 0){
        for (var i = 0; i < queryResults.length; i++) {
            var authorID = queryResults[i].Person.Id;
            var name= queryResults[i].Person.FirstName +' '+ queryResults[i].Person.LastName;
            var email = queryResults[i].Person.EMail;
            var jobTitle = queryResults[i].Person.JobTitle;
            var workphone = queryResults[i].Person.WorkPhone? queryResults[i].Person.WorkPhone: '';
            var picture = '/_layouts/15/userphoto.aspx?accountname='+ email ;
            var html = columnsDiv +'<div class=\'row\'><div class=\'single-profile clearfix\' style=\'height:130px\'> <div class=\'jm-profile-photo\'><a href=\'../_layouts/15/userdisp.aspx?ID='+authorID+'\'><img src=\''+picture+'\' alt=\'profilepic\'/></a></div>' +
            '<div class="jm-profile-information"><div><span style="float:left" class="ms-imnSpan"><a href="#" onclick="IMNImageOnClick(event);return false;" class="ms-imnlink" tabindex="-1"><span class="ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10">'+
            '<img title="" alt="No presence information" name="imnmark" src="/_layouts/15/images/spimn.png?rev=40" class="ms-spimn-img ms-spimn-presence-disconnected-10x10x32" showofflinepawn="1" sip="'+email+'" id="imn_'+email.replace('.','').replace('@','')+',type=sip"/></span></a></span>'+
            '<h4><a href=\'../_layouts/15/userdisp.aspx?ID='+authorID+'\'>'+name+'</a></h4></div><span class="jobtitle">'+jobTitle+'</span><a class="phone" href="tel:'+workphone+'">'+workphone+'</a>'+
            '<a class="mail" href="mailto:'+email+'">'+email+'</a> </div></div></div></div>';
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

function getPagesInThisSection(){
	var clientContext = new SP.ClientContext("/ouricr");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');
	var currentItemId = _spPageContextInfo.pageItemId;

	var camlQuery1 = new SP.CamlQuery();
	camlQuery1.set_viewXml('<View><Query><Where><Eq><FieldRef Name="ID" /><Value Type="Number">' + currentItemId + '</Value></Eq></Where></Query></View>');
	this.currentItem = oList.getItems(camlQuery1)	
	
	clientContext.load(currentItem);

	clientContext.executeQueryAsync(Function.createDelegate(this, this.getPagesToAdd), Function.createDelegate(this, this.hidePagesToAdd));
}

function getPagesToAdd(sender, args){
	var clientContext = new SP.ClientContext("/ouricr");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');
	
	var currentItemEnumerator = currentItem.getEnumerator();
    var count = currentItem.get_count();

	if (count >0) {
        while (currentItemEnumerator.moveNext()) {

            var oListItem = currentItemEnumerator.get_current();
			console.log(oListItem);
			var currentItemId = oListItem.get_item('ID');
			var currentItemParent = oListItem.get_item('Parent');
			var currentItemSection = oListItem.get_item('Section');
			var currentItemSummaryLinks = oListItem.get_item('SummaryLinks');
			console.log(currentItemId);
			console.log(currentItemParent);
			var camlQuery = new SP.CamlQuery();
			
			//If the item has a parent, display the siblings. If not, display the items in the same section but withoiut a parent
			if (currentItemParent) {
				currentItemParentID = currentItemParent.get_lookupId();
				camlQueryText = '<View><Query><Where><And>' +
								'<Eq><FieldRef Name="Parent" LookupId="true" /><Value Type="Lookup">' + currentItemParentID + '</Value></Eq>' +
								'<Neq><FieldRef Name="ID" /><Value Type="Number">' + currentItemId + '</Value></Neq>' +
								'</And></Where><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>';
			} else {
				camlQueryText = '<View><Query><Where><And>'+
								'<Eq><FieldRef Name="Section" /><Value Type="Choice">' + currentItemSection + '</Value></Eq>' +
								'<And><IsNull><FieldRef Name="Parent" /></IsNull>' +
								'<Neq><FieldRef Name="ID" /><Value Type="Number">' + currentItemId + '</Value></Neq></And>' +
								'</And></Where><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>';
			}
			console.log(camlQueryText);
			camlQuery.set_viewXml(camlQueryText);		
			this.ourICRpages = oList.getItems(camlQuery);
			this.hasSummaryLinks = currentItemSummaryLinks.indexOf("_title");
			
			clientContext.load(ourICRpages);

			clientContext.executeQueryAsync(Function.createDelegate(this, this.showPagesInThisSection), Function.createDelegate(this, this.hidePagesInThisSection));
		}
	}
}

function showPagesInThisSection(){
	var ourICRpagesEnumerator = ourICRpages.getEnumerator();
    var count = ourICRpages.get_count();
	if (count >0) {
		
		var parentItems = [];
		
		var headerText = '<div>'; 
		
		if (hasSummaryLinks >0) { headerText = '<div class="groupheader item medium">Also in this section</div>' } 
		
		var html = '<div id="ouricr-inThisSection" class="slm-layout-main groupmarker">' + headerText + '<ul class="dfwp-list">';

		while (ourICRpagesEnumerator.moveNext()) {
            var oListItem = ourICRpagesEnumerator.get_current();
			
			var id = oListItem.get_item('ID'); 
			var title = oListItem.get_item('Title'); 
			var pageURL = oListItem.get_item('FileRef'); 	
			var displayType = oListItem.get_item('Display_x0020_Type');
			
			switch(displayType) {
				case "Collection":
					html += '<li><div class="item"><div class="link-item"><a class="itemCollection" href="javascript:void(0);" onclick="toggleDisplay(this);">' + title + '</a><ul class="children" id="ChildrenOf' + id + '" style="display:none;"></ul><div class="description"></div></div></div></li>';
					parentItems.push(id);
				break;
				case "Link":
					var linkURL_Item = oListItem.get_item('Link');
					if (linkURL_Item) {
						var linkURL = linkURL_Item.get_url();
						html += '<li><div class="item"><div class="link-item"><a href="' + linkURL + '" title="">' + title + '</a><div class="description"></div></div></div></li>';
					}	 	
				break;
				default:
					html += '<li><div class="item"><div class="link-item"><a href="' + pageURL + '" title="">' + title + '</a><div class="description"></div></div></div></li>';
			}			
			
		}
		
		if (parentItems.length) {
			getNextLevelPages(parentItems);	
		}
		
		html += '</ul><div class="footermarker"></div></div></div>';
			
		$('#slwp_ctl00_PlaceHolderMain_ctl02_ctl00').append(html);	
	}
	
}

function hidePagesInThisSection() {
	console.log('No pages found in this section');
}

function getNextLevelPages(parentArray){
    var clientContext = new SP.ClientContext("/ouricr");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');
	
	var newCamlQueryFilter = '';
	for (var i = 0; i < parentArray.length; i++) {
		newCamlQueryFilter += '<Value Type="Lookup">' + parentArray[i] + '</Value>'
	}
		
	//get a list of all items in this category without a parent (=top level items)
    var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml('<View><Query>'+
								'<Where><In><FieldRef Name="Parent" LookupId="true" /><Values>' + newCamlQueryFilter + '</Values></In></Where>'+
								'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
							'</Query></View>');						
    this.childPages = oList.getItems(camlQuery);
    clientContext.load(childPages);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showChildPages), Function.createDelegate(this, this.hidePagesInThisSection));
}



function showChildPages(){
    var childPagesEnumerator = childPages.getEnumerator();
    var count = childPages.get_count();

	//print out top level tasks, and fill in an array with their ID
    if(count>0){    
        while (childPagesEnumerator.moveNext()) {

            var oListItem = childPagesEnumerator.get_current();
            
			var parentID_item = oListItem.get_item('Parent'); 
			//the parentID_item should not be null... but check
			if (parentID_item) {
				
				var parentID = parentID_item.get_lookupId();
				var title = oListItem.get_item('Title');            
				var id = oListItem.get_item('ID');       
				var pageURL = oListItem.get_item('FileRef'); 					
				var displayType = oListItem.get_item('Display_x0020_Type');	

				switch (displayType){
					case 'Item':
					  var html =  '<li id="item' + id + '"><a href="'+pageURL+'">'+title+'</a></li>';
					break;
					
					case 'Link':
					  var linkURL= '';
					  var linkURL_Item = oListItem.get_item('Link');
					  if (linkURL_Item) {
						var linkURL = linkURL_Item.get_url();
						var html =  '<li id="item' + id + '"><a href="' + linkURL + '">'+title+'</a></li>';
					  }
					break;
					
					case 'Collection':
					  var html =  '<li id="item' + id + '"><a class="itemCollection" href="javascript:void(0)" onclick="toggleDisplay(this)">'+title+'</a><ul class="children" id="ChildrenOf' + id + '" style="display:none"></ul></li>';
					break;
				}
				$('#ChildrenOf'+parentID).append(html);

            }      
        }        
    }
	
}