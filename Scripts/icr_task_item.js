function getTaskDetails(id){
	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Tasks');

    var oListItem = oList.getItemById(id);
    clientContext.load(oListItem);
    clientContext.load(oListItem, 'EffectiveBasePermissions');
    clientContext.executeQueryAsync(
    // OnSuccess
		function ( sender , args ) {
			
			var displayType = oListItem.get_item('Display_x0020_Type');
			switch (displayType){				
				case "Link":
					var taskURL_Item = oListItem.get_item('Link');
					if (taskURL_Item) {
						var taskURL = taskURL_Item.get_url();
						window.location.replace(taskURL);
					}
				break;
				
				case "Collection":
					var id = oListItem.get_item('ID');
					getFirstChildTask(id);
				break;
				
				default:
					var id = oListItem.get_item('ID');
					var title = oListItem.get_item('Title');
					var body = oListItem.get_item('Task_x0020_Content');
					var category = oListItem.get_item('icr_TaskCategory').get_lookupValue();
					var taskType = oListItem.get_item('icr_TaskType');
					
					var parentID_item = oListItem.get_item('Parent'); 
					var parentID = '';
					var parentVal = '';
					if (parentID_item) {
						//there is a parent. Check what it is and then act accordingly
						var parentID = parentID_item.get_lookupId();
						parentVal = '<span> &gt; </span><span>' + parentID_item.get_lookupValue() + '</span>'
						getParentTask(parentID);
					} else {
						//if there is no parent print the task category as the parent
						var text = '<li class="itemInactive">'+category+'</li>';
						$('#parentTask').append(text);
					}
					

					//Set breadcrumb
					var breadcrumb_html = '<span><a alt="Skip Navigation Links" href="#breadcrumb_SkipLink"></a>'+
									'<span><a href="/Pages/home.aspx">Nexus</a></span><span> &gt; </span>'+
									'<span><a href="/' + taskType +'">' + taskType + '</a></span><span> &gt; </span>'+
									'<span>' + category + '</span>' + 
									'<a id="breadcrumb_SkipLink"></a></span>';
					$('#breadcrumbID').html(breadcrumb_html);
						
					$('#taskTitle').text(title);
					$('#taskContent').html(body);
					
					getRelatedTasks(category,taskType,id,parentID);
			}
			
		},
		// OnFailure
        function ( sender , args ) {
            console.log('Failed in fetching the task page: ' + args.get_message() + '\n' + args.get_stackTrace());
        }
    );

}


function addAccordionItem(heading,content,id){
	var html = '<div class="panel panel-default"><a class="panel-heading accordion-toggle collapsed"'+
				' data-toggle="collapse" data-parent="#accordion" href="#'+id+'">'+heading+'</a>'+
				'<div id="'+id+'" class="panel-collapse collapse"><div class="panel-body">'+content+'</div></div></div>';

	$('#accordion').append(html);
}

function getParentTask(pID){
	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Tasks');
	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml(	'<View><Query>'+
								'<Where><Eq><FieldRef Name="ID" /><Value Type="Counter">'+pID+'</Value></Eq></Where>'+
							'</Query></View>');

	this.parentTask = oList.getItems(camlQuery);
	clientContext.load(parentTask);
	clientContext.executeQueryAsync(Function.createDelegate(this, this.showParentTasks), Function.createDelegate(this, this.hideParentTasks));    
}

function showParentTasks(){
	var parentTasksEnumerator = parentTask.getEnumerator();
	var count = parentTask.get_count();
	if(count>0){    
		while (parentTasksEnumerator.moveNext()) {
			var oListItem = parentTasksEnumerator.get_current();

			var title = oListItem.get_item('Title');
			var id = oListItem.get_item('ID');
			var displayType = oListItem.get_item('Display_x0020_Type');	
			if (displayType == "Item") {
				var text = '<li><a href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a></li>';
			} else {
				var text = '<li class="itemInactive">'+title+'</li>';
			}
			
			$('#parentTask').append(text);
		}
	}
}

function hideParentTasks(){

}

function getFirstChildTask(itemID){
	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Tasks');
	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml(	'<View><Query>'+
								'<Where><Eq><FieldRef Name ="Parent" LookupId="true" /><Value Type ="Lookup">' + itemID + '</Value></Eq></Where>'+
								'<OrderBy><FieldRef Name="DisplayOrder" Ascending="False" /></OrderBy>'+
							'</Query></View>'+
							'<RowLimit>1</RowLimit>');

	this.firstChild = oList.getItems(camlQuery);
	clientContext.load(firstChild);
	clientContext.executeQueryAsync(Function.createDelegate(this, this.showFirstChildTask), Function.createDelegate(this, this.hideFirstChildTask));    
}

function showFirstChildTask(){
	var firstChildEnumerator = firstChild.getEnumerator();
	var count = firstChild.get_count();
	if(count>0){    
		while (firstChildEnumerator.moveNext()) {
			var oListItem = firstChildEnumerator.get_current();
			var id = oListItem.get_item('ID');
			window.location.replace("https://nexus.icr.ac.uk/Lists/ICR%20Tasks/DispForm.aspx?ID=" + id);
		}
	}
}
function hideFirstChildTask() {
	console.log("Error in fetching first child task");
}


function getRelatedTasks(category,type,id,parentID){

	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Tasks');
	var camlQuery = new SP.CamlQuery();
	if (parentID) {
		//query only items with the same parent
		camlQuery.set_viewXml(	'<View><Query>'+
									'<Where><Eq><FieldRef Name ="Parent" LookupId="true" /><Value Type ="Lookup">' + parentID + '</Value></Eq></Where>'+
									'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
									'</Query></View>');
	} else {
		//if there is no parent query items in the same category and with no parent
		camlQuery.set_viewXml(	'<View><Query>'+
									'<Where><And>'+
										'<Contains><FieldRef Name="icr_TaskCategory" /><Value Type="Lookup">'+category+'</Value></Contains>'+
										'<And><Eq><FieldRef Name="icr_TaskType" /><Value Type="Choice">'+type+'</Value></Eq>'+
										'<IsNull><FieldRef Name="Parent" /></IsNull></And>'+
									'</And></Where>'+
									'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
								'</Query></View>');
	}
		
	this.relatedTasks = oList.getItems(camlQuery);
	this.relatedTasks.currentId = id;
	
	clientContext.load(relatedTasks);

	clientContext.executeQueryAsync(Function.createDelegate(this, this.showRelatedTasks), Function.createDelegate(this, this.hideRelatedTasks));    
}

function showRelatedTasks(){
	var relatedTaskEnumerator = relatedTasks.getEnumerator();
	var count = relatedTasks.get_count();
	if(count>0){    
		while (relatedTaskEnumerator.moveNext()) {
			var oListItem = relatedTaskEnumerator.get_current();
			
			var id = oListItem.get_item('ID');
			var title = oListItem.get_item('Title');
			if (id==relatedTasks.currentId) {				
				var text = '<li class="currentTask"><a class="selected" href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a><ul id="childrenTasksOf' + id + '"></ul></li>';
				$('#relatedTasks').append(text);
				getChildrenTasks(id);
			} else {
			
				var displayType = oListItem.get_item('Display_x0020_Type');	
				switch (displayType){				
					case "Link":
						var taskURL_Item = oListItem.get_item('Link');
						if (taskURL_Item) {
							var taskURL = taskURL_Item.get_url();
							var text = '<li class="siblingTask"><a href="'+taskURL+'">'+title+'</a></li>';
							$('#relatedTasks').append(text);
						}
					break;
					
					case "Collection":
						var text = '<li class="siblingTask"><a href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a></li>';
						$('#relatedTasks').append(text);
					break;
					case "Item":
						var taskType = oListItem.get_item('icr_TaskType');
						var text = '<li class="siblingTask"><a href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a></li>';
						$('#relatedTasks').append(text);
					break;
				}
				
			}
		}
	}
}

function hideRelatedTasks(){
	console.log("Error in fetching related tasks");
}

function getChildrenTasks(parentID){

	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Tasks');
	var camlQuery = new SP.CamlQuery();
	//query only items with the specific parent
	camlQuery.set_viewXml(	'<View><Query>'+
								'<Where><Eq><FieldRef Name ="Parent" LookupId="true" /><Value Type ="Lookup">' + parentID + '</Value></Eq></Where>'+
								'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
							'</Query></View>');
		
	this.childrenTasks = oList.getItems(camlQuery);
	this.childrenTasks.parentId = parentID;
	clientContext.load(childrenTasks);

	clientContext.executeQueryAsync(Function.createDelegate(this, this.showchildrenTasks), Function.createDelegate(this, this.childrenTasks));    
}

function showchildrenTasks(){
	var childrenTasksEnumerator = childrenTasks.getEnumerator();
	var count = childrenTasks.get_count();
	if(count>0){    
		$('#childrenTasksOf' + childrenTasks.parentId).parent().addClass("hasChildren");
		while (childrenTasksEnumerator.moveNext()) {
			var oListItem = childrenTasksEnumerator.get_current();

			var title = oListItem.get_item('Title');
			var id = oListItem.get_item('ID');
			var taskType = oListItem.get_item('icr_TaskType');

			var text = '<li class="childrenTask"><a href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a></li>';
			$('#childrenTasksOf' + childrenTasks.parentId).append(text);
			
		}
	}
}

function childrenTasks(){
	console.log("Error in fetching children tasks");
}