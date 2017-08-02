function getTaskCategories(sectionName){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Task Categories');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.taskCageories = oList.getItems(camlQuery);
    taskCageories.secName = sectionName;
    clientContext.load(taskCageories);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showTaskCategories), Function.createDelegate(this, this.hideTaskCategories));
}

function showTaskCategories(sender, args){
    var listItemEnumerator = taskCageories.getEnumerator();
	sName = taskCageories.secName;
    var count = taskCageories.get_count();
    if(count>0){    
        while (listItemEnumerator.moveNext()) {

            var oListItem = listItemEnumerator.get_current();

            var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
            var title = oListItem.get_item('Title');            
            var id = oListItem.get_item('ID');       
            var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : ""
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
            
            var html =  '<div id="category'+id+'" class="col-md-4 col-xs-12"><div class="container-md taskCategory-'+color+'"><div class="tasks-header">'+
                    '<div class="tasks-thumb cover-bg" style="background-image: url(\''+imagesrc+'\')"></div>'+
                    '<h4 class="text-bold">'+title+'</h4></div><ul id="'+id+'list" class="content-list taskListByCategory"></ul></div></div>';
            $('#tasksList').append(html);
                  
        }        
    }
    else{
        $('#tasksList').removeClass("isVisible");
    }

    getTopLevelTasks(sName);
}
function hideTaskCategories(){

}

function getTopLevelTasks(sName){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Tasks');
	//get a list of all items in this category without a parent (=top level items)
    var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml('<View><Query>'+
								'<Where><And>'+
								'<Eq><FieldRef Name="icr_TaskType" /><Value Type="Choice">' + sName + '</Value></Eq>'+
								'<IsNull><FieldRef Name="Parent" /></IsNull>'+
								'</And></Where>'+
								'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
							'</Query></View>');						
    this.tasks = oList.getItems(camlQuery);
	this.tasks.oList = oList;
    
    clientContext.load(tasks);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showTasks), Function.createDelegate(this, this.hideTasks));
}

function showTasks(){
    var taskEnumerator = tasks.getEnumerator();
    var count = tasks.get_count();
	var parentItems = [];
	//print out top level tasks, and fill in an array with their ID
    if(count>0){    
        while (taskEnumerator.moveNext()) {

            var oListItem = taskEnumerator.get_current();

            var categoryID = oListItem.get_item('icr_TaskCategory').get_lookupId();
            var categoryValue = oListItem.get_item('icr_TaskCategory').get_lookupValue();
            var title = oListItem.get_item('Title');            
            var id = oListItem.get_item('ID');       
                        
			var displayType = oListItem.get_item('Display_x0020_Type');		
            
			switch (displayType){
				case 'Item':
				  var html =  '<li id="item' + id + '"><a href="/Lists/ICR%20Tasks/DispForm.aspx?ID='+id+'">'+title+'</a><ul class="children" id="ChildrenOf' + id + '" style="display:none"></ul></li>';
				break;
				
				case 'Link':
				  var taskURL_Item = oListItem.get_item('Link');
				  if (taskURL_Item) {
					var taskURL = taskURL_Item.get_url();
					var html =  '<li id="item' + id + '"><a href="' + taskURL + '">'+title+'</a><ul class="children" id="ChildrenOf' + id + '" style="display:none"></ul></li>';
				  }	 	
				break;
				
				case 'Collection':
				  var html =  '<li id="item' + id + '"><a class="itemCollection" href="javascript:void(0)" onclick="toggleDisplay(this);">'+title+'</a>'+
							  '<ul class="children" id="ChildrenOf' + id + '" style="display:none;"></ul></li>';
				  //update the array with the list of all the parent items to be used to fetch its children
			      parentItems.push(id);
				break;
			}
			$('#'+categoryID+'list').append(html);
			      
        }        
    }
    else{
        $('#tasksList').removeClass("isVisible");
    }
	
	//now add all children tasks under their respective top level parents
	if (parentItems.length) {
		getNextLevelTasks(parentItems);	
	}
	
	
    hideEmptyCategories();
}
function hideTasks(){}


function getNextLevelTasks(parentArray){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Tasks');
	
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
    this.tasks = oList.getItems(camlQuery);
    clientContext.load(tasks);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.showNewTasks), Function.createDelegate(this, this.hideTasks));
}

function showNewTasks(){
    var taskEnumerator = tasks.getEnumerator();
    var count = tasks.get_count();

	//print out top level tasks, and fill in an array with their ID
    if(count>0){    
        while (taskEnumerator.moveNext()) {

            var oListItem = taskEnumerator.get_current();
            
			var parentID_item = oListItem.get_item('Parent'); 
			//the parentID_item should not be null... but check
			if (parentID_item) {
				var parentID = parentID_item.get_lookupId();
				var categoryID = oListItem.get_item('icr_TaskCategory').get_lookupId();
				var categoryValue = oListItem.get_item('icr_TaskCategory').get_lookupValue();
				var title = oListItem.get_item('Title');            
				var id = oListItem.get_item('ID');       
							
				var displayType = oListItem.get_item('Display_x0020_Type');	
				switch (displayType){
					case 'Item':
					  var html =  '<li id="item' + id + '"><a href="/Lists/ICR%20Tasks/DispForm.aspx?ID='+id+'">'+title+'</a><ul class="children" id="ChildrenOf' + id + '" style="display:none"></ul></li>';
					break;
					
					case 'Link':
					  var taskURL= '';
					  var taskURL_Item = oListItem.get_item('Link');
					  if (taskURL_Item) {
						var taskURL = taskURL_Item.get_url();
						var html =  '<li id="item' + id + '"><a href="' + taskURL + '">'+title+'</a><ul class="children" id="ChildrenOf' + id + '" style="display:none"></ul></li>';
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


function hideEmptyCategories(){
    $('.taskListByCategory').each(function(){
        $(this).has("li").parent().parent().addClass("isVisible");
    });
}
