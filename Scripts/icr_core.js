/* CUSTOM JS FOR ICR */

var accountName;
var jobTitle = "";
var mysiteURL = "";
var userDept = "";
var nexusUser = [];


function defineURLs(){
	//silently redirect all traffic directed to https://internal.nexus.icr.ac.uk to https://nexus.icr.ac.uk
	//if (window.location.hostname.indexOf("internal")==0) {window.location.replace(window.location.href.replace("//internal.","//"))}
	
	//check if we are on MySite or in the main area, and set the global vars as needed
	if ( window.location.href.indexOf("//my") > 0 || window.location.href.indexOf("//testmy") > 0 ) {
		baseURL = _spPageContextInfo.siteAbsoluteUrl.split("/my/")[0];
		mainURL = baseURL.replace("//my.","//").replace("//testmy.","//testintranet.");	
	} else {
		baseURL = _spPageContextInfo.siteAbsoluteUrl.replace("teams","");
		mainURL = baseURL;
	}	
}

function getCurrentUserDetails(onComplete){
	jQuery.ajax( {
		url: baseURL  + "/_api/sp.userprofiles.peoplemanager/getmyproperties",
		typr: "GET",
		headers: { 
			"accept": "application/json;odata=verbose"
		},
		success: onComplete,
		error: function (xhr, ajaxOptions, thrownError) { 
			console.log('Error in getCurrentUserDetails() in icr_core.js -');
			console.log("GET error:\n" + xhr.status + "\n" + thrownError);
		}
	}); 
	
}

function honorificTrim(honorString){
	var out = '';
	switch( honorString.toLowerCase() ) {
		case 'Professor':
			out = 'Professor';
			break;
		case 'Prof':
			out = 'Professor';
			break;			
		case 'Doctor':
			out = 'Dr';
			break;				
		default:
			out = '';
		}
	return out;	
}

function setUserDetails(profileData){
	accountName = profileData.d.AccountName; 
	accountEmail = profileData.d.Email; 
	jobTitle = profileData.d.title;
	mysiteURL = profileData.d.PersonalUrl;
	var uValsList = profileData.d.UserProfileProperties.results;
	var uVals =[];

	for(var k in uValsList) {
		uVals[uValsList[k].Key] = uValsList[k].Value;
	}
	//fix Honorific
	if(uVals.Honorific) { uVals.Honorific = honorificTrim(uVals.Honorific); }
	
	nexusUser = uVals;
	if (nexusUser.Honorific) {
		nexusUser['fullName'] = nexusUser.Honorific + ' ' + nexusUser.PreferredName;
	} else {
		nexusUser['fullName'] = nexusUser.PreferredName;
	}
	userDept = nexusUser.Department;
	
	if(!nexusUser.PromoteContentFor){
		if (nexusUser.Department) {
			var deptString = '*academic services*' + 
							'*communications*' +
							'*communications*' +
							'*development office*' +
							'*enterprise*' +
							'*facilities*' +
							'*finance*' +
							'*human resources*' +
							'*internal audit*' +
							'*information technology*' +
							'*research operations*' +
							'*institute secreteriat*' +
							'*secretariat*'+
							'*strategic partnership*';
			if ( deptString.indexOf( nexusUser.Department.trim().toLowerCase() ) ) {
				nexusUser.PromoteContentFor = "Corporate";
			} else {
				nexusUser.PromoteContentFor = "Researcher";
			}			
		} else {
			nexusUser.PromoteContentFor = "Researcher";
		}
	}
	
}

function departmentID(){
	var out = '';
	switch(nexusUser.Department.toLowerCase()) {
		case 'breast cancer research': 
			out = 'dept_g1';   
			break;
		
		case 'cancer biology': 
			out = 'dept_z9';   
			break;
		
		case 'cancer therapeutics': 
			out = 'dept_j5';   
			break;
		
		case 'clinical studies': 
			out = 'dept_f8';   
			break;
		
		case 'genetics and epidemiology': 
			out = 'dept_q2';   
			break;
			
		case 'molecular pathology': 
			out = 'dept_s0';   
			break;

		case 'radiotherapy and imaging': 
			out = 'dept_e1';   
			break;
			
		case 'structural biology': 
			out = 'dept_x3';   
			break;
		
		case 'academic services': 
			out = 'dept_t0';   
			break;
				
		case 'communications': 
			out = 'dept_d3';   
			break;

		case 'development office': 
			out = 'dept_r3';   
			break;

		case 'enterprise': 
			out = 'dept_b3';   
			break;

		case 'facilities': 
			out = 'dept_t2';   
			break;
		
		case 'finance': 
			out = 'dept_w4';   
			break;
		
		case 'human resources': 
			out = 'dept_h9';   
			break;
		
		case 'information technology': 
			out = 'dept_r5';   
			break;

		case 'institute secretariat': 
			out = 'dept_a8';   
			break;

		case 'research operations': 
			out = 'dept_w6';   
			break;
		
		//all small departments get this value to avoid having a code that may be uniquely identifying a person
		default: 
			out = 'dept_a0'; 
	}
	return out; 
}

function autofillNexusForm() {
	var colIndex = 0;
	$('#contentBox').find('input[type=text]').not( "[title='Default Value']" ).each(function() {
		var inputVal = $(this).val();
		if (inputVal.startsWith('[nexusUser')) {
			//extract the name of the property, then store its value, and enter it in the input field
			var pName = inputVal.substring(11,inputVal.length-1);
			if(nexusUser.hasOwnProperty(pName)){
				var pVal = nexusUser[pName];
				$(this).val(pVal);
			}	
		}
		if (inputVal == '[section]') {
			var sectionTitle = $(this).closest('tr').find('.ms-standardheader nobr').text();
			var sectionSub = $(this).parent().next().text();
			colIndex = colIndex < 8 ? colIndex + 1 : 1 ;
			var sectionHTML = '<td class="form-section-wrapper" colspan="2"><div class="form-section-header bc-' + colIndex +'">' + sectionTitle + '</div><div class="form-section-subtitle">' + sectionSub + '</div></td>'
			$(this).closest('tr').html(sectionHTML);
		}
	})

	//while not an autofill, it is a form enahcement: convert the plain text in a field description to HTML
	$('#contentBox .ms-formtable .ms-formbody .ms-metadata').each( function(){ $(this).html($(this).text()); });
	
	//display a section headers even on DispForm.aspx and not just on NewFrom.aspx
	$('#contentBox td.ms-formbody').filter( function(){ return $(this).text().trim() == '[section]'} ).each(function() {
		colIndex = colIndex < 8 ? colIndex + 1 : 1 ;
		sectionTitle = $(this).closest('tr').find('.ms-standardheader').text();
		var sectionHTML = '<td class="form-section-wrapper" colspan="2"><div class="form-section-header bc-' + colIndex +'">' + sectionTitle + '</div></td>'
		$(this).closest('tr').html(sectionHTML);
	})
}

// automatic refresh of webparts on the page. Set the time interval in milliseconds (default is 5 secs)
function nexusAutoRefresh(timeInterval) {
	if(!timeInterval){ timeInterval = 5000; }
	window.setInterval(listViewRefresh, timeInterval);
}
 
// refresh all list view web parts on the page
function listViewRefresh() {
	inplview.MyRestoreAllClvpsNavigation = MyRestoreAllClvpsNavigation;
	inplview.MyRestoreAllClvpsNavigation();
}
 
// Enumerate list view web parts
function MyRestoreAllClvpsNavigation() {
	EnumCLVPs(MyCLVPRestoreNavigation);
}
 
// refresh referencing list view web part
function MyCLVPRestoreNavigation(clvp) {
	var strHash = ajaxNavigate.getParam("InplviewHash" + clvp.WebPartId());
	if (strHash == null) { strHash = ''; }
 
	var strInpl = '?' + DecodeHashAsQueryString(strHash);
	var strShowInGrid = GetUrlKeyValue("ShowInGrid", true, strInpl);
 
	if (strShowInGrid == "True") {
		InitGridFromView(clvp.ctx.view, true);
	} else if (clvp.ctx.inGridMode) {
		ExitGrid(clvp.ctx.view, true);
	}
	clvp.strHash = strHash;
	clvp.fRestore = true;
	var curRootFolder = GetRootFolder2(this);
 
	if (curRootFolder != null)
	strInpl = SetUrlKeyValue("RootFolder", unescapeProperly(curRootFolder), true, strInpl);
	clvp.RefreshPagingEx(strInpl, true, null);
 }
 
function addClassToBody(){
	//take the window location, remove any url parameter, remove the base url, and then split the URL in all its components to create new CSS classes
	newClasses = window.location.href.replace(baseURL,"").split("?")[0].split("/");
	//add class to detect that JS is active
	//jQuery('body').addClass('with-js');
	if (newClasses.length >0) {
		jQuery.each(newClasses, function(index, urlComp){
			urlComp = urlComp.replace("#","").replace("?","").replace(".","_");
			jQuery('body').addClass(urlComp);
		});
	}
	//if element is an iframe or object, add that class, too 
	if (window.frameElement) {
		jQuery('body').addClass("inIframe");
	}
	
}

function getNavigation(){
	var navigationRestSource = baseURL +"/_api/web/lists/getByTitle('Global Navigation')/items?$filter=(Title eq 'NavigationHTML') or (Title eq 'myICRNavHTML')" ;	
	jQuery.ajax({
		url: navigationRestSource,
		headers:{"accept":"application/json;odata=verbose"},
		success: showNavigation,
		error: hideNavigation
	});
}
function showNavigation(data){
	var results = data.d.results;    
	if(results.length>0){
		jQuery.each(results, function(index, result){                    
			var html = result.NavigationHTML;
			if(result.Title =="NavigationHTML"){
				jQuery('#navigationHTML').append(html);
			}
			else if(result.Title =="myICRNavHTML"){
				jQuery('#myICRNavHTML').append(html);
			}
		});
		
		
		//ToDo add delay to the dropdowns inside the primary menu to improve usability
		//
		//var timerShow;
		//var timerHide;
		//var el;
		//$('.with-js #navigationHTML .dropdown-submenu').each(function(i) {
		//	if (el) {el.children('ul.dropdown-menu').removeClass('showThis');}
		//	el = $(this);
		//	el.hover(
		//		function(){
		//			timerShow = setTimeout(function(){
		//				el.children('ul.dropdown-menu').addClass('showThis');
		//				timerShow = null;
		//				//clearTimeout(timerHide);	
		//			}, 150);
		//		},
		//		function() {
		//			if (timerShow) {
		//				clearTimeout(timerShow);
		//				timerShow = null;
		//			} else {
		//				//timerHide = setTimeout(function(){
		//					el.children('ul.dropdown-menu').removeClass('showThis');
		//				//}, 600);
		//			}
		//		}	
		//	);
		//});	
	}	
}
function hideNavigation(){}

function getGlobalAlert(){
try{	
		if (baseURL == mainURL ) {
			var clientContext = new SP.ClientContext("/");	
			var oList = clientContext.get_web().get_lists().getByTitle("Global Alerts");

			var camlQuery = new SP.CamlQuery();
			camlQuery.set_viewXml('<View><Query><Where><Gt><FieldRef Name="Expires" /><Value IncludeTimeValue="TRUE" Type="DateTime"><Today /></Value></Gt></Where><OrderBy><FieldRef Name="Expires" Ascending="True" /></OrderBy></Query>'+'<RowLimit>1</RowLimit></View>');
			this.alertItem = oList.getItems(camlQuery);

			clientContext.load(alertItem);

			clientContext.executeQueryAsync(Function.createDelegate(this, this.showAlert), Function.createDelegate(this, this.hideAlert));

		} else {
			// ToDo add whatever is needed

		}
	}
	catch(e){
		console.log("Could not fetch Global Alert");
	}
		
}
function showAlert(sender, args){
	var alertItemEnumerator = alertItem.getEnumerator();
	var count = alertItem.get_count();
	if(count>0){
		while (alertItemEnumerator.moveNext()) {

			var oListItem = alertItemEnumerator.get_current();

			var body = oListItem.get_item('Body');
			var title = oListItem.get_item('Title');                                
						  
			jQuery('#alertText').html(body);
			jQuery('#alertContainer').css('display','block');      
		}
	}
}
function hideAlert(sender,args){
	 jQuery('#alertContainer').css('display','none');
}

function getCurrentListItem(success, error){
	try{
		var context = SP.ClientContext.get_current();
		var web = context.get_web();
		var currentList = web.get_lists().getById(_spPageContextInfo.pageListId);
		var currentListItem = null;
		if(null !=_spPageContextInfo.pageItemId && undefined != _spPageContextInfo.pageItemId){
			currentListItem = currentList.getItemById(_spPageContextInfo.pageItemId);
			context.load(currentListItem,'PublishingContact','Modified');
		}
		else{
			var id = getQueryStringParams('ID');
			if(null != id){
				currentListItem = currentList.getItemById(id);
			}
			context.load(currentListItem,'Modified');
		}

		
		context.executeQueryAsync(
		 function(){
			success(currentListItem);
		 },
		 error
		);
	}
	catch(e){
		success(null);
	}
}

function addDateAndPageContact(){
try{
	getCurrentListItem(
		function(listItem) {

			if(listItem){                        
				
				//add last modified date
				var modified = listItem.get_item('Modified');
				modified = moment(modified).format("DD MMMM YYYY");
				if(modified !== null && modified.length >0)
				{
					jQuery('#pageModifiedDate').text(modified);
					jQuery('#icr-last-update').show();
				}
				
				//add page contact
				
				//try to get the publishingcontact (avalaible for all pages) 
				try {
					var contact = listItem.get_item('PublishingContact'); 
					var contactId  = contact.get_lookupId();
					var profileUrl = "/_layouts/15/userdisp.aspx?ID="+contactId;           
					jQuery('#pageContactName').text(contact.get_lookupValue());
					jQuery('#pageContactName').prop("href",profileUrl);
					//Update incorrect data link
					UpdateInCorrectDataLink();
					jQuery('#pageContactEmail').text(contact.get_email());
					jQuery('#pageContactEmail').prop("href", "mailto:"+contact.get_email());
					jQuery('#page-contact').show();
				} catch(e) {
					try {
						var contact = listItem.get_item('TaskOwner'); 
						var contactId  = contact.get_lookupId();
						var profileUrl = "/_layouts/15/userdisp.aspx?ID="+contactId;           
						jQuery('#pageContactName').text(contact.get_lookupValue());
						jQuery('#pageContactName').prop("href",profileUrl);
						//Update incorrect data link
						UpdateInCorrectDataLink();
						jQuery('#pageContactEmail').text(contact.get_email());
						jQuery('#pageContactEmail').prop("href", "mailto:"+contact.get_email());
						jQuery('#page-contact').show();
					} catch(e) {
						console.log('No page contact found');
					}
				}

			}                    
					
	   },
	   function(sender,args){
			console.log(args.get_message());   
	   }
	);
   }
   catch(e){
   }
}
function UpdateInCorrectDataLink(){
	var tmpincorrectDataLink = jQuery('#incorrectDataLink').prop('href');
	tmpincorrectDataLink += '&userid=' + $('#pageContactName').attr("href").split('=')[1];
	jQuery('#incorrectDataLink').prop('href',tmpincorrectDataLink);
}

function getQueryStringParams(sParam){
	var pageURL = window.location.search.substring(1);
	var variables = pageURL.split('&');
	for (var i=0;i< variables.length;i++){
		var parameter = variables[i].split('=');
		if(parameter[0] == sParam){
			return parameter[1];
		}
	}
}
//is this a duplicate of the previous one?
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function searchMobile(){
	if(jQuery('#mobileSearchText').val().length>0){
		window.location.href= mainURL + '/search/pages/results.aspx?k=' + jQuery('#mobileSearchText').val();
		return false;
	}
	else{
		return false;
	}
}

function searchDesktop(){
   if(jQuery('#desktopSearchText').val().length>0){
		window.location.href= mainURL + '/search/pages/results.aspx?k=' + jQuery('#desktopSearchText').val();
		return false;
	}
	else{
		return false;
	}
}

function getUserLinks(accountName){
	var soapEnv = "<?xml version='1.0' encoding='utf-8'?> \
					<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'> \
						<soap:Body> \
							<GetUserLinks xmlns='http://microsoft.com/webservices/SharePointPortalServer/UserProfileService'> \
								<AccountName>"+accountName+"</AccountName> \
							</GetUserLinks> \
						</soap:Body> \
					</soap:Envelope>";
	jQuery.ajax({
		url: "/_vti_bin/userprofileservice.asmx",
		type: "POST",
		dataType: "xml",
		data: soapEnv,
		contentType: "text/xml; charset=\"utf-8\"",
		complete: function (xData, status) {
			var resultXml = xData.responseXML;
			var linkscount = jQuery(resultXml).find("QuickLinkData").length;
			var groups = [];
			if (linkscount > 0) {
													   
				jQuery(resultXml).find("QuickLinkData").each(function () {
					var qlName = jQuery(this).find("Name").text();
					//var qlGroup = $(this).find("Group").text().replace(/ /g,'');
					//var qlPrivacy = $(this).find("Privacy").text();
					var qlUrl = jQuery(this).find("Url").text();
					var qlID = jQuery(this).find("ID").text();
					var html = '<li><a href="' + qlUrl + '">' + qlName + '</a></li>';
					jQuery('#myLinksList').append(html);
				})
			}
			else {
				jQuery('.myLinksNav').hide();
			}
		}
	});

}



function fixForMobile(){
	/* APPLIED GLOBALLY  */
    /* ----------------- */          
        
    /* NAVIGATION SEARCH HIDE/SHOW FOR MOBILE/TABLET */
    $("#src-mobile").click(function(e){
        $(".mobile-src-grp").show();
        $("#src-mobile").hide();
        $(".head-img").hide();                       
    });

    $(".reset-mobile").click(function(e){
        $(".mobile-src-grp").hide();
        $("#src-mobile").show();
        $(".head-img").show();                       
    });
    
    /* COLLAB GROUPS / NEWS / EVENTS  */
    /* ------------------------------ */
    
    /* HIDE SHOW MORE FILTER BLOCK FOR MOBILE. MULTIPLE PAGES */
    $("#open-filter-btn, #close-filter-btn").click(function() {
        $("#open-filters").toggle();        
    });
    
    /* TEAMS PAGE */
    /* ---------- */
    
    /* HIDE SHOW MORE CONTENT */
    $('.toggle-btn').on('click', function(){                        
        $(this).next('.toggle-this').toggle();
        if ($(this).text() == "View teams") {
            $(this).html("Hide teams<span class='glyphicon glyphicon-hide'>");            
        }
        else {            
            $(this).html("View teams<span class='glyphicon glyphicon-show'>");
        }
    });
    
    /* CONTENT PAGE RELATED LINKS */
    /* -------------------------- */
    
    //MOVE RELATED LINKS BLOCK ON MOBILE 
    function replaceElements1() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (width <= 767) {
            $('#rel-links-mobile').each(function(){
                $('.icr-user-links-wrapper').appendTo(this);
            });
        }
    }
    function replaceElements2() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (width > 767) {
            $('#rel-links-desktop').each(function(){
                $('.icr-user-links-wrapper').appendTo(this);
            });
        }
    }
    
    /* on page load */
    replaceElements1();
    replaceElements2();
    
    $(window).resize(function() {
        replaceElements1();
        replaceElements2();
    });
}

function miscellaneousFixes(){
	/* Fix replacing background-size:cover, which is not supported by IE8 */    
    $('.cover-bg').each(function (){
        var imageSRC = ($(this).css('background-image'));
        imageSRC = imageSRC.replace('url("', '');
        imageSRC = imageSRC.replace('")', '');
        $(this).css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src= "' + imageSRC + '", sizingMethod=scale)' );
    });
	
	// If you are on the settings page, add buttons to toggle the visibility of additional links 
	if (window.location.href.indexOf("settings.aspx") >0 || window.location.href.indexOf("start.aspx") >0 ) {
		var htmlShowButtons ='<button id="showMore" href="javascript:void(0)" onclick="jQuery(\'#ctl00_PlaceHolderMain_SettingLinksV4\').addClass(\'displayAllLinks\'); return false;">Show More</a>';
		htmlShowButtons +='<button id="showLess" href="javascript:void(0)" onclick="jQuery(\'#ctl00_PlaceHolderMain_SettingLinksV4\').removeClass(\'displayAllLinks\'); return false;">Show Less</a>';
		jQuery('#ctl00_PlaceHolderMain_SettingLinksV4').append(htmlShowButtons);
	}
	
	//hide "Recent" tab in left-hand menu
	jQuery(".ms-core-listMenu-item:contains('Recent')").parent().hide();
	
	var incorrectDataLinkUrl = '/help/Lists/ReportOutOfDateOrIncorrectContent/NewForm.aspx?Source=' + window.location.href;
	incorrectDataLinkUrl += '&pagetitle=' + $('title').text();
	jQuery('#incorrectDataLink').prop('href',incorrectDataLinkUrl);
	jQuery('#incorrectDataLink').click(function(){
		var options = { title: "Report out of date incorrect content",
						url: jQuery('#incorrectDataLink').prop('href')
						};
		 SP.UI.ModalDialog.showModalDialog(options);
		return false;
	});
}

function getCurrentListItemVersion(success, error){
	var context = SP.ClientContext.get_current();
	var web = context.get_web(); 
	var currentList = web.get_lists().getById(_spPageContextInfo.pageListId); 
	var currentListItem = currentList.getItemById(_spPageContextInfo.pageItemId);
	var file = currentListItem.get_file();
	context.load(file);
	context.executeQueryAsync(
	 function(){
		success(file);
	 }, 
	 error
	);
}


function CheckIfCurrentUserInGroup(groupName, OnResult) {

	var clientContext = new SP.ClientContext.get_current();
	this.currentUser = clientContext.get_web().get_currentUser();
	clientContext.load(this.currentUser);

	this.userGroups = this.currentUser.get_groups();
	this.groupName = groupName;
	this.OnResult = OnResult;
	clientContext.load(this.userGroups);
	clientContext.executeQueryAsync(Function.createDelegate(this, this.OnGroupsSucceeded),Function.createDelegate(this, this.OnGroupsFailed));
}

function OnGroupsSucceeded() {
	var isMember = false;
	 var groupsEnumerator = this.userGroups.getEnumerator();
	while (groupsEnumerator.moveNext()) {
		var group= groupsEnumerator.get_current();               
		if(group.get_title() == this.groupName) {
			isMember = true;
			break;
		}
	}

  this.OnResult(isMember);
}

function OnGroupsFailed() {
	this.OnResult(false);
}

function getImages(imagesFolder,outputElementID){               
	var ctx = SP.ClientContext.get_current();
	var list = ctx.get_web().get_lists().getByTitle('Images');
	var webURL = ctx.get_web().Url;
	var folderName = _spPageContextInfo.webServerRelativeUrl + "/PublishingImages/"+imagesFolder;
	var camlString = '<View Scope="RecursiveAll"><Query><Where><Eq><FieldRef Name="FileDirRef"/><Value Type="Text">'+folderName+'</Value></Eq></Where></Query></View>';
	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml(camlString);
	this.items = list.getItems(camlQuery);
	this.items.outID = outputElementID;
	ctx.load(items);
	ctx.executeQueryAsync(Function.createDelegate(this,this.displayImages),Function.createDelegate(this,this.hideImages));
}

function displayImages(sender, args){
	var listItemEnumerator = items.getEnumerator();
	while(listItemEnumerator.moveNext()){
		var item = listItemEnumerator.get_current();
		try{

			var file = item.get_item('FileRef');                        
			$('#' + items.outID + ' ul').append('<li><a href="' + file + '" data-lightbox="example-set"><img src="'+file+'?RenditionID=1" /></a></li>');
		}
		catch (e) {}                    
		
	}
	$('#' + items.outID ).flexslider({
			animation: "slide",
			controlNav: false,
			animationLoop: false,
			slideshow: false,
			itemWidth: 100,
			itemMargin: 5,
		});

}
function hideImages(sender, args){
	console.log('From icr_core.js - hideImages ');
	console.log(args);
}


function fetchComments(id, outElementID, batchSize){ 
	
	
	var parentEl = $("#"+outElementID)
	
	parentEl.empty();
	
	commentsHTML = 	'<div class="row">' +
                        '<div class="col-xs-12">' +
                            '<div class="container-md bg-l-grey">' +
                                '<h2 class="np">Comments</h2>' +
								'<div class="container-full-width">' +
									'<div class="icr-comments">' +
										'<textarea id="txtComments" placeholder="Add a comment"> </textarea>' + 
									'</div>' +
								'</div>' +
								'<div class="btn-no-padding fr">' +
									'<a href="#" class="icr-btn btn-red" onclick="insertComment();return false;">Submit</a>' +
								'</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
					'<div class="row">' +
						'<div class="col-xs-12">' +
							'<div class="full-width-content-block" id="commentsListSection">' +
								'<ul id="commentsList" style="padding-left:0px;list-style:none;" class="content"></ul>' +
								'<div class="page_navigation"></div>' +
							'</div>' +
						'</div>' +
					'</div>';
					
	parentEl.append(commentsHTML)
	
	var commentsSource = "../_api/web/lists/getbytitle('Comments')/items?$select=ID,PageID/ID,Comments,Modified,"
							  + "Author/Id,Author/Name,Author/FirstName,Author/LastName,Author/EMail&$expand=Author/Id,PageID/ID"
							  + "&$orderby=Modified"
							  + "&$filter=PageID/ID eq "+ id;
							  //+ "&$top=100";
	$.ajax(
	{
		url: commentsSource,
		headers: { "accept": "application/json; odata=verbose" },
		cache: false,
		success: function (items) {            
			displayComments(items.d.results, batchSize);
		},
		error: function (err) {
			console.log('From icr_core.js - fetchComments');
			console.log(JSON.stringify(err));
		}
	});                              
}
function displayComments(queryResults,bSize){
	var totalComments = queryResults.length;
	var comments ='';
	if(totalComments>0){
		for (var i = 0; i < queryResults.length; i++) {
			//var date = queryResults[i].Modified.split(' ')[0].split('-');
			//var commentDate = new Date(date[0],date[1]-1,date[2]);
			var date = moment(queryResults[i].Modified).format("DD MMMM YYYY, h:mm a")
			var commentDate = date.split(', ')[0];
			var commentTime = date.split(', ')[1];
			var commentText = queryResults[i].Comments.replace(/&/g,'&amp').replace(/</g,'&lt').replace(/>/g,'&gt').replace(/"/g,'&quot').replace(/(?:\r\n|\r|\n)/g,"<br>");
			var accountName = queryResults[i].Author.EMail !=null?queryResults[i].Author.EMail:queryResults[i].Author.Name;
			var commentImage  = "/_layouts/15/userphoto.aspx?accountname=" +  accountName;
			//var author = ($(this).attr("ows_Author")).split(',')[0].split(';#');                   
			var commentauthor = queryResults[i].Author.FirstName + ' ' +queryResults[i].Author.LastName;
			var authorID = queryResults[i].Author.Id;
			
			jQuery('#txtComments').val("");
			
			var html = '<li><div class="container-full-width"><a href="/_layouts/15/userdisp.aspx?ID='+authorID+'"><div class="md-thumb cover-bg img-border" style="background-image:url(\''+commentImage+'\')">'+
						'</div></a><div class="text-table"><div class="icr-meta"><span><a href="/_layouts/15/userdisp.aspx?ID='+authorID+'">'+commentauthor +'</a></span>'+ '<span class="icr-meta-space"></span>'+commentDate+'</span><span class="icr-meta-space"></span>'+commentTime+'</span></div><h5>'+commentText+'</h5></div></div></li>';
			comments+= html
			
		}
		$('#commentsList').html(comments);
		$('#commentsListSection').pajinate({                    
		items_per_page : bSize,
		show_paginate_if_one: false,
		abort_on_small_lists: true,
		wrap_around: true,
		show_first_last: false
		}); 
	}
}
function insertComment(){
	if($('#txtComments').val().trim().length>0){
		var clientContext = SP.ClientContext.get_current();
		var web = clientContext.get_web(); 
		var oList = web.get_lists().getByTitle('Comments');
	
		var itemCreateInfo = new SP.ListItemCreationInformation();
		oListItem = oList.addItem(itemCreateInfo);
			
		oListItem.set_item('Comments', $('#txtComments').val());
		oListItem.set_item('PageID', _spPageContextInfo.pageItemId);
		//oListItem.set_item('PageContact',$('#articlecontactId').val());                
			
		oListItem.update();

		clientContext.load(oListItem);
			
		clientContext.executeQueryAsync(function OnCommentSuccceded(){
			fetchComments(_spPageContextInfo.pageItemId);
			$('#txtComments').val("");
		}, function OnCommentFailed(){

		});
	}
  
}

//ToDo add more categories and color combinations
function eventCategoryColor(eventCategory) {
	var cColor = '';
	switch(eventCategory) {
		case "Organisational":
			cColor = "orange";
		break;
		case "Scientific":
			cColor = "pink";
		break;
		case "Student":
			cColor = "yellow";
		break;
		case "Committee":
			cColor = "Blue";
		break;
		default:
			cColor = "lime";
	}
	return cColor;
}


function toggleDisplay(el){
	$(el).next('.children').toggle();
	$(el).hasClass("expanded") ? $(el).removeClass("expanded") : $(el).addClass("expanded");
}

function fixSharedWith(){
	var newText	= "Permissions";
	$('a#Ribbon\\.ListForm\\.Display\\.Manage\\.ManagePermissions-Medium span.ms-cui-ctl-mediumlabel').text(newText);
	$('a#Ribbon\\.ListForm\\.Manage\\.ManagePermissions-Medium span.ms-cui-ctl-mediumlabel').text(newText);
	$('span#Ribbon\\.ListItem\\.Manage\\.ManagePermissions_ToolTip h1').text(newText);
	$('a#Ribbon\\.Documents\\.Display\\.Manage\\.ManagePermissions-Medium span.ms-cui-ctl-mediumlabel').text(newText);
	$('a#Ribbon\\.Documents\\.Manage\\.ManagePermissions-Medium span.ms-cui-ctl-mediumlabel').text(newText);
	$('span#Ribbon\\.Documents\\.Manage\\.ManagePermissions_ToolTip h1').text(newText);
}

function addAnchors(){
	// select all the page headings
	$("#contentBox h1,#contentBox h2,#contentBox h3,#contentBox h4,#contentBox h5,#contentBox h6").each(function (index) {
		var anchorID = 'anchor' + index;
		// Append anchor to heading, with a reference to itself
		var html = '<a title="Link to this section" id="' + anchorID + '" class="anchor glyphicon-link" href="#' + anchorID + '"></a>'; 
		$(this).prepend(html);
	});
	//now check that if the current window location includes a reference to an anchor, and jump to it 
	var anchorID = window.location.hash.substr(1);
	if(anchorID) {
		$('#' + anchorID).parent().get(0).scrollIntoView();
	}
}

//Input is string with the jquery selector of where the list of members will be inerted (as first child)
//Outputs a table with the list of members and highlights the group admins
function listGroupMembers(elementSelector) {
	
	//array to store list of users to avoid duplications
	var usersList = [];

	//#memberListWrapper is where all the output will be
	$(elementSelector).prepend('<div id="memberListWrapper"></div>');
	
	//add a message for the empty state
	$(elementSelector + ' #memberListWrapper').append('<p id="memberLoading">Loading...</p>');
	
	//retrieve list of users from the permissions table for the group
    var clientContext = new SP.ClientContext(_spPageContextInfo.webAbsoluteUrl);
    var oweb = clientContext.get_web();
    nexusRoles = oweb.get_roleAssignments();
    clientContext.load(nexusRoles, 'Include(Member,RoleDefinitionBindings.Include(Name,Description))');
    clientContext.executeQueryAsync(
		//on success
		function(){
			var userEnumerator = nexusRoles.getEnumerator();
			var count = nexusRoles.get_count();
			if(count>0){
				
				//prepare the HTML to include the results
				var html = 	'<div id="membersList" class="dis-t stripe-light-grey1-odd lh-48px icr-table fw-300">' + 
								'<div class="members-headerRow members-row dis-tr">' +
									'<div class="memberName dis-tc text-bold pb-10 pt-10 pr-20 pl-10 va-mid">Members</div>' +
									'<div class="memberRole dis-tc text-bold pb-10 pt-10 pr-20       va-mid">Group administrators</div>' +
								'</div>'+
							'</div>';	
				
				$(elementSelector +' #memberLoading').remove();
				$(elementSelector +' #memberListWrapper').append(html);
						
				while (userEnumerator.moveNext()) {
					var oUser = userEnumerator.get_current();
					
					//check the user permissions. Set the user as a member if s/he has edit/contribute/design permissions and as admin if s/he has full control
					var isMember = false;
					var isAdmin = '';
					$.each(oUser.get_roleDefinitionBindings().$2_1, function (i, v) {
						if (v.get_name() == 'Contribute' || v.get_name() == 'Edit' || v.get_name() == 'Design') {
							isMember = true;
						} else if ( v.get_name() == 'Full Control' ){
							isMember = true;
							isAdmin = "Administrator";
						}
					});
					
					if (isMember) {
						
						if (oUser.get_member().get_principalType() == SP.Utilities.PrincipalType.user) { //if the member is a user
							
							//grab the userName
							var mUserName = oUser.get_member().get_loginName().split('icr\\')[1];
							//check if the user is already in the printed list of users
							if( jQuery.inArray( mUserName, usersList ) > -1 ) {
								//is a user already exists and is an admin, update the member role only
								if( isAdmin == "Administrator" ) { jQuery('#' + mUserName +' .memberRole').text("Administrator"); }
								
							} else {
								//add user to array, then add the HTML to the dom
								usersList.push(mUserName)
								var mHtml = '<div id="' + mUserName + '" class="members-row dis-tr">' +
												'<div class="memberName dis-tc memberName dis-tc pb-10 pt-10 pr-20 pl-10 va-mid">' +
													'<span class="sm-thumb mr-20" style="background-image:url(\'/_layouts/userphoto.aspx?size=S&accountName=' + oUser.get_member().get_email() + '\')"></span>' +
													'<span><a href="https://my.nexus.icr.ac.uk/Person.aspx?accountname=icr\\'+ mUserName +'">' + oUser.get_member().get_title() + '</a></span>' +
												'</div>' + 
												'<div class="memberRole dis-tc va-mid">' + isAdmin + '</div>' +
											'</div>';
								$("#membersList").append(mHtml);
								
							}
								
							
						} else if (oUser.get_member().get_principalType() == 8) { //teh member is a SharePoint group
						
							//Query to get the list of users in the SP group 
							//NB: Since this is an async call it may take time before it returns the results, hence the need to print the user one at a time and update the already existing ones
							var groupCollection = clientContext.get_web().get_siteGroups(); //context is already defined
							var membersGroup = groupCollection.getByName(oUser.get_member().get_title());
							var membersGroupUserList = membersGroup.get_users();
							clientContext.load(membersGroupUserList);
							clientContext.executeQueryAsync(
								//on success
								function(){
									var userEnumerator = membersGroupUserList.getEnumerator();
									while (userEnumerator.moveNext()) {
										var oUser = userEnumerator.get_current();
										
										//store the userName, ID, fullName, and email	
										var mUserName = oUser.get_loginName().split('icr\\')[1];
										
										if( jQuery.inArray( mUserName, usersList ) > -1 ) {
								
											//is a user already exists and is an admin, update the member role only
											if( isAdmin == "Administrator" ) { jQuery('#' + mUserName +' .memberRole').text("Administrator"); }
											
										} else {
											//add user to array, then add the HTML to the dom
											usersList.push(mUserName)
											var mHtml = '<div id="' + mUserName + '" class="members-row dis-tr">' +
															'<div class="memberName dis-tc memberName dis-tc pb-10 pt-10 pr-20 pl-10 va-mid">' +
																'<span class="sm-thumb mr-20 cover-bg" style="background-image:url(\'/_layouts/userphoto.aspx?size=S&accountName=' + oUser.get_email() + '\')"></span>' +
																'<span><a href="https://my.nexus.icr.ac.uk/Person.aspx?accountname=icr\\'+ mUserName +'">' + oUser.get_title() + '</a></span>' +
															'</div>' + 
															'<div class="memberRole dis-tc va-mid">' + isAdmin + '</div>' +
														'</div>';
											$("#membersList").append(mHtml);
										}
										
									}

								}, 
								//on failure
								function(){
									console.log('Request to get the group members failed. ' + args.get_message() + '\n' + args.get_stackTrace());
									$(elementSelector +' #memberListWrapper').html('<p>Could not retrieve the list of group members</p>');
								}
							);
						}	
					}
				} 
			} else {
				//no error, but no members
				$(elementSelector +' #memberLoading').remove();
				$(elementSelector +' #memberListWrapper').html('<p>No members found</p>');
			}
		}, 
		//on failure
		function(){
			console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
			$(elementSelector +' #memberListWrapper').html('<p>Could not retrieve the list of members</p>');
		}
	);
}

function icr_validate(){
	//drop-in function for more visible validation of fields. To use it, add on the NewForm/EditForm page this line of code:
	// function PreSaveAction() { return icr_validate(); }
		
	//reset all validation messages (if present)
	$('.invalidField').removeClass('invalidField');
	$('.invalidFieldWarning').removeClass('invalidFieldWarning');
	$('.additionalWarning').remove();
	var out1 = true;
	var out2 = true;	
	
	var inlineHTML = '<span style="display: inline;" class="invalidFieldWarning additionalWarning">You must specify a value for this required field.</span>';
	var messageHTML1 = '<tr class="additionalWarning"><td colspan=5 class="redAlert" >You need to fill all the required fields</td></tr>';
	var messageHTML2 = '<tr class="additionalWarning"><td colspan=5 class="redAlert" >You have entered some invalid data</td></tr>';
		
	//for single line of text, date fields or choice
	$('input[title$="Required Field"], select[title$="Required Field"]').filter(function(){ return $(this).val().trim().length == 0 ;}).each(function () {
		$(this).closest('td.ms-formbody').addClass('invalidField');  
		//for fields that have a warning message, give it a class to make it red
		$(this).closest('td.ms-formbody').find('span span').filter(function(){ return $(this).text() === 'You must specify a value for this required field.';}).addClass('invalidFieldWarning');
		//Add the warning to single text fields
		if ( $(this).attr('name').endsWith("TextField") ) { $(this).parent().append(inlineHTML); }	
		//add the warning to selects
		if ( $(this).is('select') ) { $(this).parent().append(inlineHTML); }	
		out1 = false;	
	}); 
	
	//for people picker
	$('.ms-formvalidation').closest('tr').find('td.ms-formbody input[name$="hiddenSpanData"]').filter(function(){ return $(this).val().trim().length == 0 ;}).each(function () { 
		$(this).closest('td.ms-formbody ').addClass('invalidField');
		$(this).closest('td.ms-formbody ').append(inlineHTML);
		out1 = false;
	}); 
	//if the data entered has no match, add a message at the bottom
	$('.ms-usereditor span.ms-error').filter(function(){ return $(this).text().trim().length > 0 ;}).each(function () {
		out2 = false;
	}); 
	
	//for html fields
	$('.ms-formvalidation').closest('tr').find('.ms-rtestate-write').filter(function(){ return $(this).text().trim().length == 0 ;}).each(function () { 
		$(this).closest('td.ms-formbody ').addClass('invalidField');
		$(this).closest('td.ms-formbody ').append(inlineHTML);
		out1 = false;
	}); 
	
	//add message above the "Save" and "Cancel" buttons
	if (!out1) { $('.ms-toolbar > table > tbody > tr > td.ms-descriptiontext').parent().parent().prepend(messageHTML1); }
	if (!out2) { $('.ms-toolbar > table > tbody > tr > td.ms-descriptiontext').parent().parent().prepend(messageHTML2); }
	
	//if both flags are true, the form has passed all validations
	if( out1 && out2 ) {
		return true;
	} else {
		return false;
	}
	
}

function displayVertical(additionalClasses){
	
	if( typeof additionalClasses === 'undefined' ) { additionalClasses = ''; }
	
	var t = $('table.ms-listviewtable tbody').eq(0);
	var r = t.find('tr');
	var cols= r.length;
	var rows= r.eq(0).find('td').length;
	var cell, next, tem, i = 0;
	var tb= $('<tbody class="vertical ' + additionalClasses + '"></tbody>');
	
	var tHeaders = [];
	var t2 = $('table.ms-listviewtable thead tr th').each(function () {
		tHeaders.push($(this).text());
	}); 
	
	while(i<rows){
		cell= 0;
		tem= $('<tr><td><p class="text-bold pr-20">' + tHeaders[i] + '</p></td></tr>');
		while(cell<cols){
			next= r.eq(cell++).find('td').eq(0);
			tem.append(next);
		}
		tb.append(tem);
		++i;
	}
	$('table.ms-listviewtable tbody').remove();
	$('table.ms-listviewtable').append(tb);
	$('table.ms-listviewtable').show();
	$('table.ms-listviewtable thead').hide();
}



function addTaskMenu(category,type,highlightID,parentID){

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
	
	clientContext.load(relatedTasks);

	clientContext.executeQueryAsync(
		//on success
		function () {
			var relatedTaskEnumerator = relatedTasks.getEnumerator();
			var count = relatedTasks.get_count();
			if(count>0){    
				while (relatedTaskEnumerator.moveNext()) {
					var oListItem = relatedTaskEnumerator.get_current();
					
					var id = oListItem.get_item('ID');
					var title = oListItem.get_item('Title');
					if (id==highlightID) {				
						var text = '<li class="currentTask"><a class="selected" href="/Lists/ICR Tasks/DispForm.aspx?ID='+id+'">'+title+'</a><ul id="childrenTasksOf' + id + '"></ul></li>';
						$('#relatedTasks').append(text);
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
		},
		//on failure
		function () {
			console.log("Error in fetching the related tasks");
		}    
		);
}

