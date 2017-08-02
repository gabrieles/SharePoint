function getFormCategories(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('ICR form categories');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.formCategeories = oList.getItems(camlQuery);
    
    clientContext.load(formCategeories);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showFormCategories), Function.createDelegate(this, this.hideFormCategories));
}

function showFormCategories(sender, args){
    var formCategeoriesEnumerator = formCategeories.getEnumerator();
    var count = formCategeories.get_count();

	
    if(count>0){
		
		if (filterText.length>0) {
			var headerClass = '';
			var listClass = ' in';
		} else {
			var headerClass = ' collapsed';
			var listClass = '';
		}
		
		var categoryList = new Object();
		
        while (formCategeoriesEnumerator.moveNext()) {

            var oListItem = formCategeoriesEnumerator.get_current();
			
            var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
            var title = oListItem.get_item('Title');            
            var id = oListItem.get_item('ID');       
            var pic = oListItem.get_item('Image') !== null ? oListItem.get_item('Image') : ""
            var imagesrc = pic;
            if (pic.indexOf("<a") != -1) {
                imagesrc = $(pic).find("img:first").attr("src");
            }
            else {
                imagesrc = $(pic).attr("src");
            }
            			
			//print the policy categories
            var html =  '<div id="category'+id+'" class="col-md-4 col-xs-12">'+
							'<div class="container-md taskCategory-'+color+'">'+
								'<a data-toggle="collapse" href="#'+id+'list" class="tasks-header' + headerClass + '">'+
									'<div class="tasks-thumb cover-bg" style="background-image: url(\''+imagesrc+'\')"></div>'+
									'<h4 class="text-bold">'+title+'</h4>'+
								'</a>'+
								'<ul id="'+id+'list" class="content-list policyListByCategory panel-collapse collapse' + listClass + '"></ul>'+
							'</div>'+
						'</div>';
            $('#policiesList').append(html);
			categoryList[title] = id;
            	
        }
		//if there is no filter text, print the subcategories. If there is a filter text, print the policies
		if (filterText.length>0) {
			catList = categoryList;
			getForms();
		} else {
			getFormSubCategories();
		}		
    }
    else{
        $('#policiesList').removeClass("isVisible");
    }
	

}
function hideFormCategories(){
	console.log('Error in fetching the forms');
}

function getFormSubCategories(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('ICR form subcategories');

    var camlQuery = new SP.CamlQuery();

    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.polSubCategories = oList.getItems(camlQuery);
    
    clientContext.load(polSubCategories);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showFormSubCategories), Function.createDelegate(this, this.hideFormSubCategories));
}

function showFormSubCategories(){
    var polSubCatEnumerator = polSubCategories.getEnumerator();
    var count = polSubCategories.get_count();
	var subCategoryList = new Object();
    if(count>0){    
        while (polSubCatEnumerator.moveNext()) {

            var subCategory = polSubCatEnumerator.get_current();
			var categoryParent = subCategory.get_item('Parent').get_lookupValue();
            var categoryID = subCategory.get_item('Parent').get_lookupId();
            var title = subCategory.get_item('Title');            
            var id = subCategory.get_item('ID');       
                       
            var html =  '<li id="item'+id+'" class="policySubcategory">'+
							'<a class="itemCollection" href="javascript:void(0)" onclick="toggleDisplay(this);">'+title+'</a>'+
							'<ul class="children" id="'+id+'sublist" style="display:none;">'+
							'</ul>'+
						'</li>';
            $('#'+categoryID+'list').append(html);
			subCategoryList[categoryParent + " - " + title] = id;
        }
		catList = subCategoryList;
        getForms();
    }
    else{
        $('#policiesList').html("No form subcategories found");
    }
}
function hideFormSubCategories(){
	console.log('Error in fetching the form subcategories');
}

function hideEmptyCategories(){
    $('.policyListByCategory').each(function(){
        $(this).has("li").parent().parent().addClass("isVisible");
    });
}

function filterForms(){
    $('#policiesList').show();
    filterText = $('#searchText').val();
    if(filterText.length>0){
        $('#policiesList').empty();
        getFormCategories();
    }
}

function getForms(){

    if(filterText.length>0){ filterText = filterText + "+"; }
    var queryURL = _spPageContextInfo.webAbsoluteUrl +"/_api/search/query?querytext='" + filterText + "ContentTypeId:0x01010A004A0B3181C51C084ABC1F943E14215A47'&selectproperties='Title,linkPath,Category,Subcategory'&rowlimit=500&enablestemming=true&sortlist='size:descending'";
	$.ajax({
		type: "GET", 
		headers: { 
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
		}, 
		url: queryURL, 
		success: showForms,
		failure: hideForms
   });
   
}

function showForms(data){
	var query = data.d.query; 
	var count = query.PrimaryQueryResult.RelevantResults.RowCount;
	console.log(count);
	if(count>0){  
		var categoryID = '';	
		for(var i = 0; i < count; i++) {
			var catKey = '';
			var form = query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results;
			console.log(form);
			//find the correct id where to append the form
			if (filterText.length>0) {
				catKey = form[3].Value;  //category
				categoryID = catList[catKey];
			} else {
				catKey = form[3].Value + " - "+ form[4].Value;
				categoryID = catList[catKey] + "sub";
			}
			var formTitle = form[2].Value; // Title
			var formURL = form[3].Value; //OriginalPath
			var html =  '<li class="policyItem"><a href="'+formURL+'">'+formTitle+'</a></li>';
			$('#'+categoryID+'list').append(html);
							  
		}        
	} else {
		$('#policiesList').html("No forms found");
	}

	hideEmptyCategories();
  
	
	
}

function hideForms(){
	console.log('Error in retrieving the forms');
	console.log(JSON.stringify(error));
}