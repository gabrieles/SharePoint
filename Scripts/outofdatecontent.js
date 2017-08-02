	var siteCollectionURL = _spPageContextInfo.siteAbsoluteUrl;
	var userId = null;
	var pageTitle = null;

	$(document).ready(function () {
		if (window.location.toString().toLowerCase().indexOf('newform.aspx') > -1) {
			//* hide approval field...

			//alert(window.location);
			var location = getParameterByName('location', window.location);
			//alert(location);

			//Get UserId from query string
			userId = getParameterByName('userid', window.location);
			
			//Get pageTitle from query string
			pageTitle = getParameterByName('pagetitle', window.location);
			if(pageTitle != null )
			{
				$('input[title="Title Required Field"]').val(pageTitle);
			}

			$('select[title="Fix Out Of Date Content Approval Status Required Field"]').attr({
				'disabled': 'true'
			});

			//Hide title
			$('input[title="Title Required Field"]').closest("tr").hide();
			//Hide person who control account
			$("[id$='ClientPeoplePicker'][title='PageContactAccountName Required Field']").closest("tr").hide();
			//Hide fix out of date content approval status
			$('select[title="Fix Out Of Date Content Approval Status Required Field"]').closest("tr").hide();
			//Hide pgae url
			$('input[title="Page URL Required Field"]').closest("tr").hide();
			//Hide status
            $('select[title="Fix Out Of Date Content Approval Status Required Field"]').closest("tr").hide();

		} else if (window.location.toString().toLowerCase().indexOf('editform.aspx') > -1) {
			var scriptbase = siteCollectionURL + "/_layouts/15/";
			$.getScript(scriptbase + "SP.Runtime.js", function () {
				$.getScript(scriptbase + "SP.js", function () {
					$.getScript(scriptbase + "SP.RequestExecutor.js", getUser);
				});
			});

		}

		$("h3").each(function () {
			if ($(this).html().toString().indexOf('PageTitle') > -1) {
				$(this).html('<nobr>Page title<span title="This is a required field." class="ms-accentText"> *</span></nobr>');
			}
			if ($(this).html().toString().indexOf('PageContactAccountName') > -1) {
				$(this).html('<nobr>Person who controls <br>the updating of the content<span title="This is a required field." class="ms-accentText"> *</span></nobr>');
			}
			if ($(this).html().toString().indexOf('Fix Out Of Date Content Approval Status') > -1) {
				$(this).html('<nobr>Fix Out Of Date <br>Content Approval Status</nobr>');
			}

		});
		
		var fromURL = document.referrer;
		var pagesIndex = fromURL.toLowerCase().indexOf('pages');
		var listsIndex = fromURL.toLowerCase().indexOf('lists');
		var pageREST = "/_api/web/lists/GetByTitle('Pages')/items?$select=Title,EditorId&$filter=FileRef eq '@@'";
		var listsREST = "/_api/web/lists?$select=Title,EditorId&$filter=FileRef eq '@@'";	
		var listItemREST = "/_api/web/lists(guid'@1')/items?$select=Title,EditorId&$filter=ID eq '@2'";	
		var allListsREST = "/_api/Web/Lists?$select=ID,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder";
		
		if(pagesIndex  > -1){			
			var webUrl = fromURL.substring(0, pagesIndex-1)
			var pageUrl = fromURL.replace(_spPageContextInfo.siteAbsoluteUrl,'');
			var pageQuery = webUrl + pageREST.replace("@@", pageUrl);					
			$('input[Title="Page URL Required Field"]').val(fromURL);
			GetPageProperties(webUrl, pageQuery);
		}
		else if(listsIndex > -1){
			var webUrl = fromURL.substring(0, listsIndex-1)
			var id = getParameterByName('ID',fromURL);
			var listUrl = fromURL.substring(listsIndex-1, fromURL.length-1);
			var listGUID = GetListGuid(webUrl + allListsREST, listUrl);					
			var queryREST = listItemREST.replace('@1', listGUID).replace('@2',id);
			$('input[Title="Page URL Required Field"]').val(fromURL);
			GetPageProperties(webUrl, queryREST);
		}
		
	});

	function GetListGuid(restURL, listURL){
			var id = '';
			jQuery.ajaxSetup({async:false});
						    $.ajax({
			        url: restURL,
			        method: "GET",
                    headers: { "Accept": "application/json; odata=verbose" }, 
                    success:function(data) {
                    	if(data.d.results.length > 0){			    
							data.d.results.forEach(function(element){
								if(decodeURIComponent(listURL).indexOf(element.RootFolder.ServerRelativeUrl) > -1){
									id  = element.Id;
								}
							});							
						}
                    }			    
            });
			jQuery.ajaxSetup({async:true});
			return id
	}
	
	function getParameterByName(name, url) {
	    if (!url) {
	      url = window.location.href;
	    }
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

var loginName ='';
var displayName = '';
	function GetEditorName(editorQuery){		
					    $.ajax({
			        url: editorQuery,
			        method: "GET",
                    headers: { "Accept": "application/json; odata=verbose" }, 
			    }).then(function(data) {
			    	if(data.d !== null){
						loginName = data.d.LoginName; // Assume this is the returned value from the rest query 
						displayName = data.d.Title;
						SetAndResolvePeoplePicker('PageContactAccountName Required Field',	loginName);				
					}
			    });
	}
		
	function SetAndResolvePeoplePicker(fieldName, userAccountName) { 
		var controlName = fieldName;		 
		var peoplePickerDiv = $("[id$='ClientPeoplePicker'][title='" + controlName + "']");		 
		var peoplePickerEditor = peoplePickerDiv.find("input[title*='" + controlName + "']");				 
		var spPeoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peoplePickerDiv[0].id];
		 
		peoplePickerEditor.val(userAccountName);	
		if(spPeoplePicker !== null){	 
				spPeoplePicker.AddUnresolvedUserFromEditor(true);		 

		}
		
		spPeoplePicker.SetEnabledState(false);
		$('.sp-peoplepicker-delImage').css('display','none');		 
	}	
		
		
	function GetPageProperties(webUrl, pageQuery){
		var userREST = "/_api/web/getuserbyid(@@)";	
		if(userId!=null)
		{
			SP.SOD.executeFunc('clientpeoplepicker.js', 'SPClientPeoplePicker', function () {
			GetEditorName(webUrl + userREST.replace("@@",userId));
			});
		}
		else
		{
			    $.ajax({
			        url: pageQuery,
			        method: "GET",
                    headers: { "Accept": "application/json; odata=verbose" }, 
			    }).then(function(data) {
			    	if(data.d.results.length >0){
						$('input[Title="PageTitle Required Field"]').attr("value",data.d.results[0].Title);			
						SP.SOD.executeFunc('clientpeoplepicker.js', 'SPClientPeoplePicker', function () {						
							GetEditorName(webUrl + userREST.replace("@@",data.d.results[0].EditorId));
						});
					}
			    });
		}
	}	

