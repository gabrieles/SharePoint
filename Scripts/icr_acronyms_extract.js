function getAllAcronyms(){
    
	var listName = getURLParameter("listname");
	var fieldName = getURLParameter("fieldname").replace(/ /g, "_x0020_");;
	var listContext = getURLParameter("listContext");
	var highlight1 = getURLParameter("highlight1");
	var highlight2 = getURLParameter("highlight2");
	
	console.log(listName);
	console.log(fieldName);
	console.log(listContext);
	console.log(highlight1);
	console.log(highlight2);
	
	
	if (listContext) {
		var clientContext = new SP.ClientContext(listContext);	
	} else {
		var clientContext = new SP.ClientContext("/");	
	}
	
    var oList = clientContext.get_web().get_lists().getByTitle(listName);
	//get a list of all items in this category without a parent (=top level items)
    var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml('<View><Query>'+
								'<OrderBy><FieldRef Name="ID" Ascending="True" /></OrderBy>'+
							'</Query></View>');						
    this.listItems = oList.getItems(camlQuery);
	this.fieldName = fieldName;
	this.highlight1 = highlight1;
	this.highlight2 = highlight2;
	
    clientContext.load(listItems);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showListItemAcronyms), Function.createDelegate(this, this.hideListItemAcronyms));
}

function showListItemAcronyms(){
    var itemsEnumerator = listItems.getEnumerator();
    var count = listItems.get_count();
	console.log(count)
    if(count>0){  
		
		var html = '<div id="item-0" class="dis-tr"> ' +
						'<span class="item-ID dis-tc pr-20"><h2>ID</h2></span>' +
						'<span class="itemTitle dis-tc pr-20"><h2>Title</h2></span>' +
						'<span class="itemLength dis-tc pr-20"><h2>Page length</h2></span>' +
						'<span class="ItemLink-0 dis-tc pr-20"><h2>Acronyms</h2></span>' +
					'</div>';
		$('#ItemAcronymsList').append(html);
			
        while (itemsEnumerator.moveNext()) {

            var oListItem = itemsEnumerator.get_current();
			
			var id = oListItem.get_item('ID');  
            var title = oListItem.get_item('Title'); 			
			var itemBody = oListItem.get_item(fieldName);
			
			html =  '<div id="item-' + id + '" class="dis-tr"> ' +
						'<span class="item-ID dis-tc pr-20"><p>' + id + '</p></span>' +
						'<span class="itemTitle dis-tc pr-20"><p>' + title + '</p></span>'
			
			//if there is a body, extract the length and the links
			if(itemBody) {
				html +=	'<span class="itemLength dis-tc pr-20"><p>' + itemBody.length + '</p></span>';
				
				//regex to grab all links in the item body
				var acroArray = itemBody.match(/\b[A-Z][A-Z]+\b/g)
				if(acroArray){
					for(var i=0;i<acroArray.length;i++){	
						var acroVal = acroArray[i];
						var acroHighlight = '';
						if (highlight1 && acroVal.indexOf(highlight1)>0){ acroHighlight = 'btn-yellow'; }
						if (highlight2 && acroVal.indexOf(highlight2)>0){ acroHighlight = 'btn-green'; }
						html += '<span class="itemlink ItemLink-' + i + ' ' + acroHighlight + ' dis-tc pr-20">' + acroVal + '</span>';
					}
				}					
					
			} else {
				html +=	'<span class="itemLength dis-tc pr-20"><p>0</p></span>';
			}
			
			html +='</div>';
			
			$('#ItemAcronymsList').append(html);
			      
        }        
    }
}
function hideListItemAcronyms(){
	console.log('Error in fetching the list of acronyms');
}