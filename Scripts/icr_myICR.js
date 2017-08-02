function getDepartment(){
	var clientContext = new SP.ClientContext("/");
	
	var deptString = 	'*academic services*' + 
						'*ceo office*' +
						'*coo office*' +
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
							
	if ( deptString.indexOf( userDept.trim().toLowerCase() ) ) {
		var oList = clientContext.get_web().get_lists().getByTitle('Directorates Promo Links');
		var siteType = "Directorate";
	} else {
		var oList = clientContext.get_web().get_lists().getByTitle('Divisions Promo Links');	
		var siteType = "Division";
	}
	
	
	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Title" /><Value Type="Text">'+userDept+'</Value></Eq></Where></Query><RowLimit>1</RowLimit></View>');
	this.departments = oList.getItems(camlQuery);
	departments.siteType = siteType;
	clientContext.load(departments);

	clientContext.executeQueryAsync(Function.createDelegate(this, this.showDepartments), Function.createDelegate(this, this.hideDepartments));

}

function showDepartments(sender, args){
	var departmentEnumerator = departments.getEnumerator();
	var count = departments.get_count();
	if(count>0){    
		while (departmentEnumerator.moveNext()) {

			var oListItem = departmentEnumerator.get_current();

			var color = oListItem.get_item('Color').toLowerCase().replace(' ','-');
			var title = oListItem.get_item('Title'); 
			var description = oListItem.get_item('Description');            
			var id = oListItem.get_item('ID'); 
			var link = oListItem.get_item('Link').get_url();      
			var pic = oListItem.get_item('PublishingRollupImage') !== null ? oListItem.get_item('PublishingRollupImage') : '<img src="/style%20library/ICR/Images/featuredp.jpg" />'
			var imagesrc = pic;
			if (pic.indexOf("<a") != -1) {
				imagesrc = $(pic).find("img:first").attr("src");
			}
			else {
				imagesrc = $(pic).attr("src");
			}
			
			var html = '<h2>' + departments.siteType + ' updates</h2><div class="img-responsive mr-20 pb-20 fl"><img src="'+imagesrc+'"></div><div class="fl">'+                                
						'<p><a href="'+link+'">'+title+'</a></p><div class="icr-meta"><span>'+description+'</span></div></div>';

			$('#departmentUpdates').append(html);                
		}
		getDepartmentDocuments(link);

	}
	else{
		$('#departmentSection').hide();
	}
}
function getDepartmentDocuments(link){
	if(link.substring(-1,1) =='/'){
		link = link.slice(0,-1);
	}

	var clientContext = new SP.ClientContext(link);
	var oList = clientContext.get_web().get_lists().getByTitle('Documents');

	var camlQuery = new SP.CamlQuery();
	camlQuery.set_viewXml('<View><Query><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query><RowLimit>3</RowLimit></View>');

	this.featuredDocumentItem = oList.getItems(camlQuery);
	this.link = link;

	clientContext.load(featuredDocumentItem, 'Include(Title,ContentType,File,Editor)');

	clientContext.executeQueryAsync(Function.createDelegate(this, this.showDepartmentDocuments), Function.createDelegate(this, this.hideDepartmentDocuments)); 
}
function showDepartmentDocuments(sender,args){
	var featuredDocumentItemEnumerator = featuredDocumentItem.getEnumerator();
	//$('#departmentDocuments').append('<h4 class="text-bold pb-20">Latest document uploads</h4>');
	var count = featuredDocumentItem.get_count();
	if(count>0){    
		while (featuredDocumentItemEnumerator.moveNext()) {

			var oListItem = featuredDocumentItemEnumerator.get_current();
			var ct = oListItem.get_contentType();
			if(ct.get_name() !="Folder"){
				var file = oListItem.get_file();
				var editorID  = oListItem.get_item('Editor').get_lookupId();
				var editorValue  = oListItem.get_item('Editor').get_lookupValue();
				var title = file.get_title();
				var name = file.get_name();
				if(title == null){
					title = name;
				}
				var imgSrc ='';
				if(name.indexOf('.doc')!=-1){
					imgSrc ="/style library/ICr/Images/Icons/icon_doc.png"
				}
				else if(name.indexOf('.ppt')!=-1){
					imgSrc ="/style library/ICr/Images/Icons/icon_ppt.png"
				}
				else if(name.indexOf('.xls')!=-1){
					imgSrc ="/style library/ICr/Images/Icons/icon_xls.png"
				}
				else if(name.indexOf('.pdf')!=-1){
					imgSrc ="/style library/ICr/Images/Icons/icon_pdf.png"
				}
				else if(name.indexOf('.jpg')!=-1){
					imgSrc ="/style library/ICr/Images/Icons/icon_image.png"
				}
				else if(name.indexOf('.png')!=-1){
					imgSrc ="/style library/ICr/Images/Icons/icon_image.png"
				}
				var path = file.get_serverRelativeUrl();
				var date = moment(file.get_timeLastModified()).format('DD MMM'); 
				var userdetails = link +"/_layouts/15/userdisp.aspx?ID="+editorID;          
				var text = '<div class="container-full-width"><div class="attachments-wrapper"><div class="doctype_thumb"><img src="'+imgSrc+'"></div>'+
						   '<div class="text-table"><p><a href="'+path+'">'+title+'</a></p><div class="icr-meta"><span>'+date+'</span>'+
							'<span class="icr-meta-space"></span><span><a href="'+userdetails+'">'+editorValue+'</a></span></div></div></div></div>';
						
				$('#departmentDocuments').append(text);            
			}
		}
	}
	else{
		$('#departmentDocuments').hide();
	}      
	
}
function hideDepartmentDocuments(sender,args){
	alert('error');
}


function getMyUserLinks(){
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
					jQuery('#myLinksBlock').append(html);
				})
			}
		}
	});

}


function getMyLinks_withGroups(accountName){
 	var soapEnv = "<?xml version='1.0' encoding='utf-8'?> \
					<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'> \
				  <soap:Body> \
					<GetUserLinks xmlns='http://microsoft.com/webservices/SharePointPortalServer/UserProfileService'> \
					  <AccountName>"+accountName+"</AccountName> \
					</GetUserLinks> \
				  </soap:Body> \
				</soap:Envelope>";
		$.ajax({
			url: "/_vti_bin/userprofileservice.asmx",
			type: "POST",
			dataType: "xml",
			data: soapEnv,
			contentType: "text/xml; charset=\"utf-8\"",
			complete: function (xData, status) {
				var resultXml = xData.responseXML;
				var linkscount = $(resultXml).find("QuickLinkData").length;
				var groups = [];
				if (linkscount > 0) {
					
					//$('#userLinks').empty();
					$(resultXml).find("QuickLinkData").each(function () {
	
						var qlGroup = $(this).find("Group").text();
						if($.inArray(qlGroup,groups)<0){
							groups.push(qlGroup);
						}
					});
					for(i=0;i<groups.length;i++){
						var groupID = groups[i].replace(/ /g,'');
						var expand='';
						if(i==0){
							expand = 'in';
						}
						$('.myLinksSection').append('<div class=""><a class="panel-heading accordion-toggle" data-toggle="collapse"'+
							' data-parent="#accordion" href="#collapse'+i+'"><h5 class="accordion-toggle">'+groups[i]+
							'<span class="glyphicon glyphicon-accordion"></span></h5></a><div id="collapse'+i+'" class="panel-collapse collapse '+expand+'">'+
							'<div class="panel-body"><ul id="'+groupID+'" class="content-list"></ul></div></div></div>');
					}
					
					$(resultXml).find("QuickLinkData").each(function () {
						var qlName = $(this).find("Name").text();
						var qlGroup = $(this).find("Group").text().replace(/ /g,'');
						var qlPrivacy = $(this).find("Privacy").text();
						var qlUrl = $(this).find("Url").text();
						var qlID = $(this).find("ID").text();
						var html = '<li><a href="' + qlUrl + '">' + qlName + '</a></li>';
						$('#'+qlGroup).append(html);
					})
				}
				else {
	
					$('.myLinksSection').hide();
				}
	
			}
		});

}


