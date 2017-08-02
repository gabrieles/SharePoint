function getOurIcrPages(){
    var clientContext = new SP.ClientContext("/ouricr");
    var oList = clientContext.get_web().get_lists().getByTitle('Pages');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><IsNull><FieldRef Name="Parent" /></IsNull></Where><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.ourICRpages = oList.getItems(camlQuery);
    
    clientContext.load(ourICRpages);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showOurIcrParentPages), Function.createDelegate(this, this.hideOurIcrPages));
}

function showOurIcrParentPages(sender, args){
    var ourICRpagesEnumerator = ourICRpages.getEnumerator();
    var count = ourICRpages.get_count();
	
	var parentItems = [];
	
    if(count>0){    
        while (ourICRpagesEnumerator.moveNext()) {

            var oListItem = ourICRpagesEnumerator.get_current();
			var id = oListItem.get_item('ID'); 
			
			//print all pages, but the "our ICR" homepage
			if (id && id != 1) {
				var title = oListItem.get_item('Title'); 
				var pageURL = oListItem.get_item('FileRef'); 		
				var parent = oListItem.get_item('Parent');	  
				var section = oListItem.get_item('Section');
				var sectionID = section.toLowerCase().replace(/ /g,"-");
				var displayType = oListItem.get_item('Display_x0020_Type');

				switch(displayType) {
					case "Collection":
						var html =  '<li id="item' + id + '"><a class="itemCollection" href="javascript:void(0)" onclick="toggleDisplay(this);">'+title+'</a>'
						html += '<ul class="children" id="ChildrenOf' + id + '" style="display:none;"></ul></li>';
						parentItems.push(id);
					break;
					case "Link":
						var linkURL_Item = oListItem.get_item('Link');
						if (linkURL_Item) {
							var linkURL = linkURL_Item.get_url();
							var html =  '<li id="item' + id + '"><a href="' + linkURL + '">'+title+'</a></li>';
						}	 	
					break;
					default:
						var html =  '<li id="ouricr-page'+id+'"><a href="' + pageURL + '">'+title+'<a/></li>';
				}			
				$('#'+sectionID+'-list').append(html);
			}	
        }
		
		if (parentItems.length) {
			getNextLevelPages(parentItems);	
		}
	
    }
}
function hideOurIcrPages(){
	console.log('No page was found!');
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
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showChildPages), Function.createDelegate(this, this.hideOurIcrPages));
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



