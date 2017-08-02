<script type="text/javascript" language="javascript">
var filterText ='';
var catList = new Object();

$(document).ready(function ($) {
	$("#searchText").keyup(function(event){
		if(event.keyCode == 13){
			$("#searchPolicies").click();
		}
	});
	getPolicyCategories();  
});


function getPolicyCategories(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Policy Categories');

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.policyCategeories = oList.getItems(camlQuery);
    
    clientContext.load(policyCategeories);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showPolicyCategories), Function.createDelegate(this, this.hidePolicyCategories));
}

function showPolicyCategories(sender, args){
    var policyCategeoriesEnumerator = policyCategeories.getEnumerator();
    var count = policyCategeories.get_count();

	
    if(count>0){
		
		if (filterText.length>0) {
			var headerClass = '';
			var listClass = ' in';
		} else {
			var headerClass = ' collapsed';
			var listClass = '';
		}
		
		var categoryList = new Object();
		
        while (policyCategeoriesEnumerator.moveNext()) {

            var oListItem = policyCategeoriesEnumerator.get_current();
			
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
			getPolicies();
		} else {
			getPolicySubCategories();
		}		
    }
    else{
        $('#policiesList').removeClass("isVisible");
    }
	

}
function hidePolicyCategories(){
	console.log('Error in fetching the policies');
}

function getPolicySubCategories(){
    var clientContext = new SP.ClientContext("/");
    var oList = clientContext.get_web().get_lists().getByTitle('Policy subcategories');

    var camlQuery = new SP.CamlQuery();

    camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="DisplayOrder" Ascending="True" /></OrderBy></Query></View>');
    this.polSubCategories = oList.getItems(camlQuery);
    
    clientContext.load(polSubCategories);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.showPolicySubCategories), Function.createDelegate(this, this.hidePolicySubCategories));
}

function showPolicySubCategories(){
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
        getPolicies();
    }
    else{
        $('#policiesList').html("No policy subcategories found");
    }
}
function hidePolicySubCategories(){
	console.log('Error in fetching the policy subcategories');
}

function hideEmptyCategories(){
    $('.policyListByCategory').each(function(){
        $(this).has("li").parent().parent().addClass("isVisible");
    });
}

function filterPolicies(){
    $('#policiesList').show();
    filterText = $('#searchText').val();
    if(filterText.length>0){
        $('#policiesList').empty();
        getPolicyCategories();
    }
}

function getPolicies(){

    if(filterText.length>0){ filterText = filterText + "+"; }
    var queryURL = _spPageContextInfo.webAbsoluteUrl +"/_api/search/query?querytext='" + filterText + "ContentTypeId:0x0100E9BCB32D647A444A98F325A2BA3534D60041D6C804A98AA24CB2FF4B354C429341'&selectproperties='Title,OriginalPath,policyCategory,policySubcategory'&rowlimit=500&enablestemming=true";
	$.ajax({
		type: "GET", 
		headers: { 
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
		}, 
		url: queryURL, 
		success: showpolicies,
		failure: hidePolicies
   });
   
}

function showpolicies(data){
	var query = data.d.query; 
	var count = query.PrimaryQueryResult.RelevantResults.RowCount;
	if(count>0){  
		var categoryID = '66sub';	
		for(var i = 0; i < count; i++) {
			var catKey = '';
			var policy = query.PrimaryQueryResult.RelevantResults.Table.Rows.results[i].Cells.results;
			//find the correct id where to append the policy
			if (filterText.length>0) {
				catKey = policy[4].Value;
				categoryID = catList[catKey];
			} else {
				catKey = policy[4].Value + " - "+ policy[5].Value;
				categoryID = catList[catKey] + "sub";
			}
			var policyTitle = policy[2].Value; // Title
			var policyURL = policy[3].Value; //OriginalPath
			var html =  '<li class="policyItem"><a href="'+policyURL+'">'+policyTitle+'</a></li>';
			$('#'+categoryID+'list').append(html);
							  
		}        
	} else {
		$('#policiesList').html("No policies found");
	}

	hideEmptyCategories();
  
	
	
}

function hidePolicies(){
	console.log('Error in retrieving the policies');
	console.log(JSON.stringify(error));
}


</script>

<div class="row">
    <div class="col-md-5">
        <div class="icr-srch-field ">                                            
            <div class="input-group">
                <input id="searchText" type="text" class="form-control" placeholder="Search" name="srch-term" />
                <div class="input-group-btn">
                    <button id="searchPolicies" class="btn btn-default" type="submit" onclick="filterPolicies();return false;"><i class="glyphicon glyphicon-search"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div id="policiesList" class="container-mt-20 threecolumnclear pt-20 tasksList">
        
    </div>
</div>