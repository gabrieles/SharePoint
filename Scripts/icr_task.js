<script type="text/javascript">
    $(document).ready(function ($) {
        $('#onetIDListForm').addClass('container');
        var id = getQueryStringParams('ID');
        getTaskDetails(id);  
    });
    function getTaskDetails(id){
        var clientContext = new SP.ClientContext("/");
        var oList = clientContext.get_web().get_lists().getByTitle('ICR Tasks');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml(	'<View><Query>'+
									'<Where><Eq><FieldRef Name="ID" /><Value Type="Counter">'+id+'</Value></Eq></Where>'+
									'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
								'</Query></View>');
        this.taskItem = oList.getItems(camlQuery);
        
        clientContext.load(taskItem);

        clientContext.executeQueryAsync(Function.createDelegate(this, this.showTaskDetails), Function.createDelegate(this, this.hideTaskDetails));
    }

    function showTaskDetails(sender, args){

        var listItemEnumerator = taskItem.getEnumerator();
        var count = taskItem.get_count();
        if(count>0){    
            while (listItemEnumerator.moveNext()) {
                var oListItem = listItemEnumerator.get_current();
				
				var displayType = oListItem.get_item('Display_x0020_Type');	//todo you may want to trigger different displays based on the type of tasks that you have...
				console.log(displayType)
				switch (displayType){
					
					case "Link":
						var taskURL_Item = oListItem.get_item('Link');
						if (taskURL_Item) {
							var taskURL = taskURL_Item.get_url();
							window.location.replace(taskURL_Item);
							console.log(taskURL_Item);
						}
					break;
					
					case "Collection":
						var id = oListItem.get_item('ID');
						console.log(id);
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
						if (parentID_item) {
							//there is a parent. Check what it is and then act accordingly
							var parentID = parentID_item.get_lookupId();
							getParentTask(parentID);
						} else {
							//if there is no parent print the task category as the parent
							var text = '<li class="parentInactive">'+category+'</li>';
							$('#parentTask').append(text);
						}

						var owner = oListItem.get_item('TaskOwner');
						if(owner !=null && owner !=undefined){
							owner = owner.get_lookupId();
						}

						var modified = oListItem.get_item('Modified');
						modified = moment(modified).format("DD MMMM YYYY");
						if(modified != null && modified.length >0)
						{
							jQuery('#pageModifiedDate').show();
							jQuery('#pageModifiedDate').text(modified);
						}

						$('#taskTitle').text(title);
						$('#taskContent').html(body);
						
						if(owner!=null){
							bindTaskOwner(owner);
						}
						else{
							jQuery('#pageContactName').text("Gabriele Sani");
							jQuery('#pageContactName').prop("href","#");
							jQuery('#pageContactEmail').text("Gabriele.Sani@icr.ac.uk");
							jQuery('#pageContactEmail').prop("href", "mailto:Gabriele.Sani@icr.ac.uk");
						}
						getRelatedTasks(category,taskType,id,parentID);
				}
                
            }

        }
    }
    function hideTaskDetails(sender, args){

    }

    function addAccordionItem(heading,content,id){
        var html = '<div class="panel panel-default"><a class="panel-heading accordion-toggle collapsed"'+
                    ' data-toggle="collapse" data-parent="#accordion" href="#'+id+'">'+heading+'</a>'+
                    '<div id="'+id+'" class="panel-collapse collapse"><div class="panel-body">'+content+'</div></div></div>';

        $('#accordion').append(html);
    }
	
	function getParentTask(pID){
		var clientContext = new SP.ClientContext("/");
        var oList = clientContext.get_web().get_lists().getByTitle('ICR Tasks');
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
					var text = '<li class="parentInactive">'+title+'</li>';
				}
                
                $('#parentTask').append(text);
            }
        }
    }
	
	function hideParentTasks(){

    }
	
	function getFirstChildTask(itemID){
		var clientContext = new SP.ClientContext("/");
        var oList = clientContext.get_web().get_lists().getByTitle('ICR Tasks');
		var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml(	'<View><Query>'+
									'<Where><Eq><FieldRef Name ="Parent" LookupId="true" /><Value Type ="Lookup">' + itemID + '</Value></Eq></Where>'+
									'<OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy>'+
								'</Query></View>');

        this.firstChild = oList.getItems(camlQuery);
		clientContext.load(firstChild);
		clientContext.executeQueryAsync(Function.createDelegate(this, this.showFirstChildTask), Function.createDelegate(this, this.hideFirstChildTask));    
	}
	
	function showFirstChildTask(){
        var firstChildEnumerator = firstChild.getEnumerator();
        var count = firstChild.get_count();
		console.log(count);
        if(count>0){    
            while (firstChildEnumerator.moveNext()) {
                var oListItem = firstChildEnumerator.get_current();
                var id = oListItem.get_item('ID');
				console.log('aaa' + id);
				window.location.replace("https://nexus.icr.ac.uk/Lists/ICR%20Tasks/DispForm.aspx?ID=" + id);
			}
        }
    }
	function hideFirstChildTask() {
		
	}
	
	
    function getRelatedTasks(category,type,id,parentID){

        var clientContext = new SP.ClientContext("/");
        var oList = clientContext.get_web().get_lists().getByTitle('ICR Tasks');
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

                var title = oListItem.get_item('Title');
                var id = oListItem.get_item('ID');
                var taskType = oListItem.get_item('icr_TaskType');
				if (id==relatedTasks.currentId) {
					var text = '<li class="currentTask"><a class="selected" href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a><ul id="childrenTasksOf' + id + '"></ul></li>';
					$('#relatedTasks').append(text);
					getChildrenTasks(id);
				} else {
					var text = '<li class="siblingTask"><a href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a></li>';
					$('#relatedTasks').append(text);
				}
            }
        }
    }

    function hideRelatedTasks(){

    }

	function getChildrenTasks(parentID){

        var clientContext = new SP.ClientContext("/");
        var oList = clientContext.get_web().get_lists().getByTitle('ICR Tasks');
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

    }
	
    function bindTaskOwner(owner){
        jQuery.ajax( {
                url: _spPageContextInfo.webAbsoluteUrl  + "/_api/web/getuserbyid("+owner+")",
                typr: "GET",
                headers: { 
                    "accept": "application/json;odata=verbose"
                },
                success: taskOwnerRetrieved,
                error: function (xhr, ajaxOptions, thrownError) { 
                    alert("GET error:\n" + xhr.status + "\n" + thrownError);
                }
            }); 
    }
    function taskOwnerRetrieved(profileData){
        var id = profileData.d.Id;
        var email =  profileData.d.Email;             
        var title =  profileData.d.Title;
        jQuery('#pageContactName').text(title);
        jQuery('#pageContactName').prop("href","/_layouts/15/userdisp.aspx?ID="+id);
        jQuery('#pageContactEmail').text(email);
        jQuery('#pageContactEmail').prop("href", "mailto:"+email);            
    }
</script>
<style type="text/css">
    #sideNavBox { display: none;}
    #contentBox {margin-left: 5px}
    #DeltaPlaceHolderPageTitleInTitleArea{ display: none;}
</style>
<div class="wrapper">
    <div class="container">
        <div class="row">
            
            <!-- end side nav -->
            <div class="col-md-3 hidden-sm hidden-xs pl-0">
                <div class="left-nav red-top-border">
					<ul id="parentTask">
					</ul>
                    <ul id="relatedTasks">                                                            
                    </ul>
                </div>   
            </div>
            <!-- end side nav -->
            <div class="col-md-9 col-xs-12">
                <div class="gutter-left-10">
                    <!-- page title -->
                    <div class="row">
                        <div class="col-xs-12">
                            <h1 id="taskTitle" class="page-title"></h1>                                                            
                        </div>
                    </div>
                    <!-- end.page title -->
                    
                    <!-- user input -->
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="pb-20 icr-user-input">
                                <div id="taskContent"></div>                                              
                            </div>        
                        </div>                                
                    </div>
                    <!-- end.user input -->
                    
                    <!-- accordian -->
                    <div class="row">
                        <div class="col-xs-12">                                        
                            <div class="panel-group" id="accordion">
                                
                            </div>
                        </div>
                    </div>
                    <!-- end.accordian -->
                </div>
            </div>
        </div>
    </div>
</div>