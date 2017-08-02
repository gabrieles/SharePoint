function getPolicyDetails(){
	//check if you need to display the custom view or the standard one to display the version history
	var id = getQueryStringParams('ID');
	var isVersionPage = getQueryStringParams('VersionNo');
	if(isVersionPage!=undefined) {
		$('#MSOZoneCell_WebPartWPQ2').hide();
		$('#WebPartWPQ1').show();
	} else {
		
		//grab the values from the hidden webpart
		var title = $('#WebPartWPQ1 a[name="SPBookmark_Title"]').parent().parent().next().text().trim();

		var approving_committee = $('#WebPartWPQ1 a[name="SPBookmark_Approving_x0020_committee"]').parent().parent().next().text().trim();
		if (null == approving_committee || approving_committee.length==0) {approving_committee = 'Coming soon'; }
		
		var first_approval = $('#WebPartWPQ1 a[name="SPBookmark_Approved"]').parent().parent().next().text().trim();
		if (null == first_approval || first_approval.length==0) {first_approval = 'Coming soon'; }

		var minute_reference = $('#WebPartWPQ1 a[name="SPBookmark_Minutes_x0020_reference"]').parent().parent().next().text().trim();
		if(null == minute_reference || minute_reference.length==0 ) {minute_reference = 'Coming soon';}
		
		var policy_owner = $('#WebPartWPQ1 a[name="SPBookmark_Document_x0020_owner"]').parent().parent().next().text().trim();
		if(null == policy_owner || policy_owner.length==0 ) {policy_owner = 'Coming soon';}
		
		var equality_impact_assessment = $('#WebPartWPQ1 a[name="SPBookmark_Equality_x0020_Impact_x0020_Asse"]').parent().parent().next().text().trim();
		if(null == equality_impact_assessment || equality_impact_assessment.length==0 ) {equality_impact_assessment = 'Coming soon';}
		
		var equality_assessment_outcome = $('#WebPartWPQ1 a[name="SPBookmark_Equality_x0020_assessment_x0020_"]').parent().parent().next().text().trim();
		if(null == equality_assessment_outcome || equality_assessment_outcome.length==0 ) {equality_assessment_outcome = 'Coming soon';}
		
		var last_review_date = $('#WebPartWPQ1 a[name="SPBookmark_Last_x0020_review_x0020_date"]').parent().parent().next().text().trim();
		if(null == last_review_date || last_review_date.length==0 ) {last_review_date = 'Coming soon';}
		
		var next_review_date = $('#WebPartWPQ1 a[name="SPBookmark_Next_x0020_review"]').parent().parent().next().text().trim();
		if(null == next_review_date || next_review_date.length==0 ) {next_review_date = 'Coming soon';}
		
		var category = $('#WebPartWPQ1 a[name="SPBookmark_icr_PolicyCategory"]').parent().parent().next().text().trim();
		
		var subCategory = $('#WebPartWPQ1 a[name="SPBookmark_icr_PolicySubcategory"]').parent().parent().next().text().trim();
		
		var body = $('#WebPartWPQ1 a[name="SPBookmark_icr_PolicyContent"]').parent().parent().next().html().trim();
		
		//grab the status, but filter out any comments
		var status = $('#WebPartWPQ1 a[name="SPBookmark__ModerationStatus"]').parent().next().contents().filter(function(){ return this.nodeType == 3; })[0].nodeValue.trim();
		
		//print values				
		$('#policyTitle').text(title);
		
		//fill the online cover sheet
		$('#approving-committee').text(approving_committee);
		$('#first-approval').text(first_approval);
		$('#minute-reference').append(minute_reference);
		$('#document-owner').append(policy_owner);
		$('#equality-assessment-date').text(equality_impact_assessment);
		$('#equality-assessment-outcome').text(equality_assessment_outcome);
		$('#next_review').text(next_review_date);
		$('#latest_review').text(last_review_date);
		
		//fill the MS word export cover sheet
		$('#tb-approving-committee').text(approving_committee);
		$('#tb-first-approval').text(first_approval);
		$('#tb-minute-reference').append(minute_reference);
		$('#tb-document-owner').append(policy_owner);
		$('#tb-equality-assessment-date').text(equality_impact_assessment);
		$('#tb-equality-assessment-outcome').text(equality_assessment_outcome);
		$('#tb-next_review').text(next_review_date);
		$('#tb-latest_review').text(last_review_date);
		
		$('#policyContent').html(body);
		
		//add class to the policy page
		$('#policy-page').addClass(status);
		if(status.trim().toLowerCase()=='pending'){
			var htmlMessage = 	'<div class="redAlert">Pending approval - users can see only the latest approved version' +
									'<a id="requestApproval" title="Request approval for this policy" class="icr-btn btn-red" href="#" ' +
										'onclick="javascript:SP.UI.ModalDialog.showModalDialog({ url: \'/Lists/Policy%20approval%20request/NewForm.aspx?policyID=' + id + '\', title: \'Request approval for this policy\' }); return false;">Request approval</a>' +
								'</div>'
			$('#message').append(htmlMessage);
		}
		
		//add left hand menus, and additional items related to policies
		getRelatedPolicies(category,subCategory,id); //left hand menu for everyone
		getPolicyFaqs(id);	//FAQ list at the bottom of the page
		replaceStrings(id);	//replace links in the body of the policy 
		getPolicyReviewSummaries(id);  //Add table with list of review summaries (visible on "show more")
		addonsForEditors(id); //Add left hand menu for editors
		prepareForPrintAndExport(id); //Additional elements needed for the printed version and for the export to MS Word version

	}
	
	setPolicyBreadcrumb(category, subCategory)
    
}

function setPolicyBreadcrumb(category, subCategory){
	//Set breadcrumb
	var breadcrumb_html = '<span><a alt="Skip Navigation Links" href="#breadcrumb_SkipLink"></a>'+
							'<span><a href="/Pages/home.aspx">Nexus</a></span><span> &gt; </span>'+
							'<span><a href="/pages/policy-library.aspx">Policies</a></span><span> &gt; </span>'+
							'<span>' + category + '</span><span> &gt; </span>' + 
							'<span>' + subCategory + '</span>' +
							'<a id="breadcrumb_SkipLink"></a></span>';
	$('#breadcrumbID').html(breadcrumb_html);
	
}
 
function addonsForEditors(id) {
	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Policies');

    var oListItem = oList.getItemById(id);
    clientContext.load(oListItem);
    clientContext.load(oListItem, 'EffectiveBasePermissions');
    clientContext.executeQueryAsync(
    // OnSuccess
        function ( sender , args ) {
			var listItem_HasEditPerms = oListItem.get_effectiveBasePermissions().has(SP.PermissionKind.editListItems);
			if(listItem_HasEditPerms) {addMenu(id);}
	
		}
	);	
}
 
function prepareForPrintAndExport(id) {
	var html = '<div id="policyInfoPrint"><p> Printed on ' + moment(Date()).format("DD MMMM YYYY") + ' from https://nexus.icr.ac.uk/Lists/ICR%20Policies/DispForm.aspx?ID=' + id + '</p> <span><b>Uncontrolled if printed</b></span></div>'; 
	$('#policyContent').append(html);
	
} 
 
function addAccordionItem(heading,content,id){
	var html = '<div class="panel panel-default"><a class="panel-heading accordion-toggle collapsed"'+
				' data-toggle="collapse" data-parent="#accordion" href="#'+id+'">'+heading+'</a>'+
				'<div id="'+id+'" class="panel-collapse collapse"><div class="panel-body">'+content+'</div></div></div>';

	$('#accordion').append(html);
}

function getRelatedPolicies(category,subCategory,id){

	var clientContext = new SP.ClientContext("/");
	var oList = clientContext.get_web().get_lists().getByTitle('Policies');

	var camlQuery = new SP.CamlQuery();
	var camlQueryString = '';
	if (subCategory) {
		var catTitle = subCategory;
		camlQueryString = 	'<View><Query>'+
								'<Where><Eq><FieldRef Name="icr_PolicySubcategory" /><Value Type="Lookup">'+subCategory+'</Value></Eq></Where>'+
								'<OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy>'+
							'</Query></View>';
	} else {
		if (category) {
			var catTitle = category;
			camlQueryString = 	'<View><Query>'+
									'<Where><Eq><FieldRef Name="icr_PolicyCategory" /><Value Type="Lookup">'+category+'</Value></Eq></Where>'+
									'<OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy>'+
								'</Query></View>';
		}
	}
	
	if (camlQueryString) {
		camlQuery.set_viewXml(camlQueryString);

		this.relatedPolicies = oList.getItems(camlQuery);
		relatedPolicies.catTitle = catTitle;
		relatedPolicies.currentID = id;
		clientContext.load(relatedPolicies);

		clientContext.executeQueryAsync(Function.createDelegate(this, this.showRelatedPolicies), Function.createDelegate(this, this.hideRelatedPolicies)); 
	}
	   
}

function showRelatedPolicies(){
	var relatedPolicyEnumerator = relatedPolicies.getEnumerator();
	var count = relatedPolicies.get_count();
	if(count>0){ 
		var text = '<li class="itemInactive" id="relatedPolicies">' + relatedPolicies.catTitle + '</li>';
		$('#relatedPolicies').append(text);
		while (relatedPolicyEnumerator.moveNext()) {
			var oListItem = relatedPolicyEnumerator.get_current();

			var title = oListItem.get_item('Title');
			var id = oListItem.get_item('ID');
		   
			var link = "/Lists/ICR%20Policies/DispForm.aspx?ID="+id;
			if (id == relatedPolicies.currentID) {
				var text = '<li><a href="'+link+'" class="selected">'+title+'</a></li>';
			} else {
				var text = '<li><a href="'+link+'">'+title+'</a></li>';	
			}			
			$('#relatedPolicies').append(text);
		}
	}
}

function hideRelatedPolicys(){
}


function getPolicyFaqs(id){
		var clientContext = new SP.ClientContext("/");
		var oList = clientContext.get_web().get_lists().getByTitle('Policy FAQ');

		var camlQuery = new SP.CamlQuery();
		camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Policy" LookupId="true"/><Value Type="Lookup">'+id+'</Value></Eq></Where></Query></View>');
		this.policyFAQ = oList.getItems(camlQuery);
		
		clientContext.load(policyFAQ);

		clientContext.executeQueryAsync(Function.createDelegate(this, this.showPolicyFAQ), Function.createDelegate(this, this.hidePolicyFAQ));
	}

function showPolicyFAQ(){
	 var faqEnumerator = policyFAQ.getEnumerator();
		var count = policyFAQ.get_count();
		//add elements
		if(count>0){   
			var html = '<h2>Frequently Asked Questions</h2>';
			$('#accordion').append(html);
			while (faqEnumerator.moveNext()) {
				var oListItem = faqEnumerator.get_current();
				addAccordionItem(oListItem.get_item('Title'),oListItem.get_item('Answer'),'faq'+oListItem.get_item("ID"));
		}
	}
	
}

function hidePolicyFAQ(){
}
	
function getPolicyReviewSummaries(id){
		var clientContext = new SP.ClientContext("/");
		var oList = clientContext.get_web().get_lists().getByTitle('Policy Review Summaries');

		var camlQuery = new SP.CamlQuery();
		camlQueryString = 	'<View><Query>'+
								'<Where><Eq><FieldRef Name="Updated_x0020_policy" LookupId="true"/><Value Type="Lookup">'+id+'</Value></Eq></Where>'+
								'<OrderBy><FieldRef Name="Date" Type="DateTime" IncludeTimeValue="TRUE" Ascending="False" /></OrderBy>'+
							'</Query></View>';
		camlQuery.set_viewXml(camlQueryString);
		this.policyReviews = oList.getItems(camlQuery);
		
		clientContext.load(policyReviews);

		clientContext.executeQueryAsync(Function.createDelegate(this, this.showPolicyReviews), Function.createDelegate(this, this.hidePolicyReviews));
	}

function showPolicyReviews(){
	var reviewsEnumerator = policyReviews.getEnumerator();
	var count = policyReviews.get_count();
	var html = '<div class="policyReviewItem policyReviewheader">'+
					'<div class="policyReview-date">Date</div>'+
					'<div class="policyReview-summary">Summary of update</div>'+
					'<div class="policyReview-reviewer">Reviewed by</div>'+
					'<div class="policyReview-minutes">Minute reference</div>'+
				'</div>';
	if(count>0){    
		while (reviewsEnumerator.moveNext()) {
			var oListItem = reviewsEnumerator.get_current();
			/* get the date of the review, and format it */
			var review_date = moment(oListItem.get_item('Date')).format("DD MMM YYYY");
			/* get the summary. As it is plain text there is no need to format it */
			var review_summary = oListItem.get_item('Summary_x0020_of_x0020_update');
			/* get the reviewer, and turn the name into a link to his/her profile */
			
			var review_reviewer = oListItem.get_item('Reviewedby');

			//var review_reviewer_name = review_reviewer.get_lookupValue();
			//reviewerID = review_reviewer.get_lookupId();
			//var review_reviewer_link = '<a href="/_layouts/15/userdisp.aspx?ID=' + reviewerID + '">' + review_reviewer_name + '</a>';

			//var review_reviewer_link = '<a href="/_layouts/15/userdisp.aspx?ID=69">Liz Bennet</a>';
			/* get a link to the meeting minutes */
			var review_minute_reference = oListItem.get_item('Minute_x0020_reference');
			
			
			html = html + 	'<div class="policyReviewItem">'+
								'<div class="policyReview-date">'+review_date+'</div>'+
								'<div class="policyReview-summary">'+review_summary+'</div>'+
								'<div class="policyReview-reviewer">'+review_reviewer+'</div>'+
								'<div class="policyReview-minutes">'+review_minute_reference+'</div>'+
							'</div>';		
		}
		$('#policyReviews').append(html);
	
	}
	
}	

function hidePolicyReviews(){
}

function replaceStrings(id){
		var clientContext = new SP.ClientContext("/");
		var oList = clientContext.get_web().get_lists().getByTitle('Policy string replacements');

		var camlQuery = new SP.CamlQuery();
		camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Policy" LookupId="true"/><Value Type="Lookup">'+id+'</Value></Eq></Where></Query></View>');
		this.policyReplacements = oList.getItems(camlQuery);
		
		clientContext.load(policyReplacements);
		clientContext.executeQueryAsync(Function.createDelegate(this, this.doPolicyStringReplacements), Function.createDelegate(this, this.hidePolicyStringReplacements));
	}

function doPolicyStringReplacements(){
	var stringEnumerator = policyReplacements.getEnumerator();
	var count = policyReplacements.get_count();
	
	var outText = '{ "items" : [';
	if(count>0){    
		
		var html = '<div class="policyReplacementsItem policyReplacementsheader">'+
					'<div class="policyReplacements-text">Text converted into a link</div>'+
					'<div class="policyReplacements-link">Link URL</div>'+
					'<div class="policyReplacements-tootip">Tootip</div>'+
				'</div>';
		while (stringEnumerator.moveNext()) {
			var oListItem = stringEnumerator.get_current();
			
			/* get the string to be replaced */
			var replacementOriginalText = oListItem.get_item('Title');
			
			/* get the link */
			var replacementNew = oListItem.get_item('Link_x0020_to_x0020_be_x0020_dis');
			var replacementNew_url = replacementNew.get_url();
			var replacementNew_text = replacementNew.get_description().trim();
			if(null == replacementNew_text || replacementNew_text.length==0 || replacementNew_text == replacementNew_url) replacementNew_text = replacementOriginalText;
			
			
			/* get the tooltip, */			
			var replacementTooltip = oListItem.get_item('Tooltip');
			if (replacementTooltip == null ) { replacementTooltip = ''; }
			//create string for replacement pattern		
			outText = outText + '{ "oldText":"'+ replacementOriginalText +'" , "newText":"'+ replacementOriginalText +'" , "newURL":"'+ replacementNew_url +'" , "tooltip":"'+ replacementTooltip +'"},';
			
			//add item to table of replacement patterns
			html = html + 	'<div class="policyReplacementsItem">'+
								'<div class="policyReplacements-text">'+replacementOriginalText+'</div>'+
								'<div class="policyReplacements-link"><a href="'+replacementNew_url+'">'+replacementNew_url+'</a></div>'+
								'<div class="policyReplacements-tootip">'+replacementTooltip+'</div>'+
							'</div>';	
			
		}
		
		outText = outText + '{}]}';
		var outJSON = JSON.parse(outText);
		injectLinks(outJSON, 'policyContent');
		
		$('#policyReplacementPatterns').append(html);
	
	}
}

function hidePolicyStringReplacements(){
} 	

function injectLinks(jStrings, contentID) {
	var oldText = '';
	var newText = '';
	var newURL = '';
	var tooltip = '';
	
	//get the policy content as a text string
	var str = document.getElementById(contentID).innerHTML;
	
	for (i = 0; i < jStrings.items.length-1; i++) {
		el = jStrings.items[i];
		oldText = el.oldText;
		newText = el.newText;
		if(newText == null || newText.length==0) newText = oldText;
		newURL = el.newURL;
		tooltip = el.tooltip;
		if(tooltip == null || tooltip.length==0 || typeof tooltip === "undefined" || tooltip==="null"){ 
			tooltip_html = '';
			linkClass = 'replaced'; 	
		} else {
			tooltip_html = 'data-rel="tooltip" data-original-title="' + tooltip + '" ';
			linkClass = 'replaced has-tooltip'; 	
		}
		
		var newLink = '<a target="_blank" rel="noopener noreferrer" class="'+ linkClass +'" '+ tooltip_html +'href="' + newURL + '">' + newText + '</a>';
		str = str.replace(RegExp(oldText, "gi"), newLink );
	}
	  document.getElementById(contentID).innerHTML = str;
	  //use bootstrap tooltips
	  $('[data-rel=tooltip]').tooltip();
}


function addMenu(id) {
	html = 	'<li>'+ 
				'<span class="menu-header" id="addItems">Add</span>'+
			'</li>'+
			'<li>'+ 
				'<a class="menu-item" title="Create a new Policy" href="/Lists/ICR Policies/NewForm.aspx">New Policy</a>'+
			'</li>'+
			'<li>'+ 
				'<a class="menu-item" title="Add a new Policy review summary" href="#" onclick="javascript:SP.UI.ModalDialog.showModalDialog({ url: \'/Lists/Policy%20Review%20Summaries/NewForm.aspx?policyID=' + id + '\', title: \'New policy review summary\' }); return false;">New Review summary</a>'+
			'</li>'+
			'<li>'+
				'<a class="menu-item" title="Add a new link" href="#" onclick="javascript:SP.UI.ModalDialog.showModalDialog({ url: \'/Lists/Policy%20string%20replacements/NewForm.aspx?policyID=' + id + '\', title: \'New link\' }); return false;">New Link</a>'+
			'</li>'+
			'<li>'+
				'<a class="menu-item" title="Add a new Frequently Asked Question" href="#" onclick="javascript:SP.UI.ModalDialog.showModalDialog({ url: \'/Lists/Policy%20FAQ/NewForm.aspx?policyID=' + id + '\', title: \'New Frequently Asked Question\' }); return false;">New FAQ</a>'+
			'</li>'+
			'<li>'+
				'<a class="menu-item" title="Request approval for this policy" href="#" onclick="javascript:SP.UI.ModalDialog.showModalDialog({ url: \'/Lists/Policy%20approval%20request/NewForm.aspx?policyID=' + id + '\', title: \'Request approval for this policy\' }); return false;">Request approval</a>'+
			'</li>'+
			'<li>'+ 
				'<span class="menu-header" id="showItems">Review</span>'+
			'</li>'+
			'<li>'+
				'<a class="menu-item" title="Compare policy versions" href="/Pages/compare.aspx?Source=/Lists/ICR Policies/DispForm.aspx?ID=' + id + '&RootFolder=&policyID=' + id + '">Compare versions</a>'+
			'</li>'+			
			'<li>'+ 
				'<a class="menu-item" href="/Lists/ICR Policies/">See all policies</a>'+
			'</li>'+
			'<li>'+ 
				'<a class="menu-item" href="/Lists/Policy%20Review%20Summaries/">See all Review summaries</a>'+
			'</li>'+
			'<li>'+
				'<a class="menu-item" href="/Lists/Policy string replacements/">See all Links</a>'+
			'</li>'+	
			'<li>'+
				'<a class="menu-item" href="/Lists/Policy%20FAQ/">See all FAQs</a>'+
			'</li>';			
	$('#addMenu').append(html);
}

function showMorePolicyDetails(){
	$('#policy-page').addClass("displayMore");
}
function showLessPolicyDetails(){
	$('#policy-page').removeClass("displayMore");
}