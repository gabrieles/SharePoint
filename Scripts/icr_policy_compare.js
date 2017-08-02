var dmp = new diff_match_patch();
var policyId = getQueryStringParams('policyID');
var listId = "C35881B6-9688-4742-B63B-2CEE54C84DAF"; //policy list id


function updateForComparison(vID, index, runCompare){
	var webUrl = _spPageContextInfo.webAbsoluteUrl;
	
	if(vID != 0) {
		//if there is a vID that is different from 0, GET the page to extract the field values
		var policyURL = webUrl + "/Lists/ICR%20Policies/DispForm.aspx?ID="  + policyId + "&VersionNo=" + vID;
		$.ajax({
			type: 'GET',
			url: policyURL, 
			data: {format: 'html'},
			success: function(data) {
				var title =  $(data).find('#WebPartWPQ1 a[name="SPBookmark_Title"]').parent().parent().next().text().trim();
				var approving_committee = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Approving_x0020_committee"]').parent().parent().next().text().trim();
				var first_approval = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Approved"]').parent().parent().next().text().trim();
				var minute_reference = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Minutes_x0020_reference"]').parent().parent().next().text().trim();
				var policy_owner = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Document_x0020_owner"]').parent().parent().next().text().trim();
				var equality_impact_assessment = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Equality_x0020_Impact_x0020_Asse"]').parent().parent().next().text().trim();
				var equality_assessment_outcome = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Equality_x0020_assessment_x0020_"]').parent().parent().next().text().trim();
				var last_review_date = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Last_x0020_review_x0020_date"]').parent().parent().next().text().trim();
				var next_review_date = $(data).find('#WebPartWPQ1 a[name="SPBookmark_Next_x0020_review"]').parent().parent().next().text().trim();
				var category = $(data).find('#WebPartWPQ1 a[name="SPBookmark_icr_PolicyCategory"]').parent().parent().next().text().trim();
				var subCategory = $(data).find('#WebPartWPQ1 a[name="SPBookmark_icr_PolicySubcategory"]').parent().parent().next().text().trim();
				var body = $(data).find('#WebPartWPQ1 a[name="SPBookmark_icr_PolicyContent"]').parent().parent().next().find('.ms-rtestate-field').html();
				//var status = $(data).find('#WebPartWPQ1 a[name="SPBookmark__ModerationStatus"]').parent().next().text().trim();
				$('#title' + index ).text( title );
				$('#committee' + index ).text( approving_committee );
				$('#dateApproval' + index ).text( first_approval );
				$('#minute' + index ).text( minute_reference );
				$('#owner' + index ).text( policy_owner );
				$('#equalityDate' + index ).text( equality_impact_assessment );
				$('#equalityOutcome' + index ).text( equality_assessment_outcome );
				$('#latestReview' + index ).text( last_review_date );
				$('#nextReview' + index ).text( next_review_date );
				
				$('#text' + index ).html( body );
				if (runCompare) { nexusCompare(); }	
			},
		   error: function() {
				$('#text' + index ).html('<p>Could not retrieve the policy</p>');
		   },
		});	
	} else {
		//do this for the latest version
		//I do not know why the "standard" query does not display the fields for teh current version of a policy (it does return the body, and the HTML for the fields is present, but not its content)
		//this second query is noticeably faster than the other one.
		var policyURL = webUrl + "/_api/Web/Lists(guid'" + listId + "')/Items(" + policyId +")/FieldValuesAsHtml";
		$.ajax({
			type: 'GET',
			url: policyURL, 
			headers: { "Accept": "application/json; odata=verbose" },
			success: function(data) {
				
				var item = data.d;
				
				//lookup items are returned as links, and special characters are encoded as HTML. Need to extract the plain text
				var title = jQuery("<div>"+item.Title+"</div>").text().trim();
				var approving_committee = jQuery("<div>"+item.Approving_x005f_x0020_x005f_committee+"</div>").text().trim(); 
				var first_approval = item.Approved;
				var minute_reference = jQuery("<div>"+item.Minutes_x005f_x0020_x005f_reference+"</div>").text().trim();
				var policy_owner = jQuery("<div>"+item.Document_x005f_x0020_x005f_owner+"</div>").text().trim();
				var equality_impact_assessment = item.Equality_x005f_x0020_x005f_Impact_x005f_x0020_x005f_Asse;
				var equality_assessment_outcome = item.Equality_x005f_x0020_x005f_assessment_x005f_x0020_x005f_;
				var last_review_date = item.Last_x005f_x0020_x005f_review_x005f_x0020_x005f_date;
				var next_review_date = item.Next_x005f_x0020_x005f_review;
				//var alert_list = item.icr_x005f_PolicyOwner;
				//var category = item.icr_x005f_PolicyCategory;
				//var subCategory = item.icr_x005f_PolicySubcategory;				
				var body = item.icr_x005f_PolicyContent;
				
				$('#title' + index ).text( title );
				$('#committee' + index ).text( approving_committee );
				$('#dateApproval' + index ).text( first_approval );
				$('#minute' + index ).text( minute_reference );
				$('#owner' + index ).text( policy_owner );
				$('#equalityDate' + index ).text( equality_impact_assessment );
				$('#equalityOutcome' + index ).text( equality_assessment_outcome );
				$('#latestReview' + index ).text( last_review_date );
				$('#nextReview' + index ).text( next_review_date );
				
				$('#text' + index ).html( body );
				
				if (runCompare) { nexusCompare(); }	
			},
		   error: function() {
				$('#text' + index ).html('<p>Could not retrieve the policy</p>');
		   },
		});			
	}
	
		
	
	

}

function showFieldsComparison(){
	$('#fieldsCompare').removeClass('hideDefault');
	$('#hideFields').removeClass('hideDefault');
	$('#showFields').addClass('hideDefault');
}

function hideFieldsComparison(){
	$('#fieldsCompare').addClass('hideDefault');
	$('#hideFields').addClass('hideDefault');
	$('#showFields').removeClass('hideDefault');
}

function showTextComparison(){
	$('#textCompare').removeClass('hideDefault');
	$('#hideText').removeClass('hideDefault');
	$('#showText').addClass('hideDefault');
}

function hideTextComparison(){
	$('#textCompare').addClass('hideDefault');
	$('#hideText').addClass('hideDefault');
	$('#showText').removeClass('hideDefault');
}


$('#select1').change(function() {
	var selectedVal = $(this).val()
	if(selectedVal != 'doc') {
		updateForComparison( selectedVal, "1", true)  
	} else {
		showTextComparison();
		readyForCopyPaste('text1');
	}
  
});
$('#select2').change(function() {
  	var selectedVal = $(this).val()
	if(selectedVal != 'doc') {
		updateForComparison( selectedVal, "2", true)  
	} else {
		
		readyForCopyPaste('text2');
	}
});


function readyForCopyPaste(elementID) {
	showTextComparison();
	hideFieldsComparison();
	$('#' + elementID ).html( '<p class="compareNote">Paste the text here, then click on "Compare"</p>' );	
}

function html2text(sourceHTML){
	var out = sourceHTML;
	
	
//remove all stuff from MS Word
	
	// replace new lines that MS word injects randomly
	out = out.replace(/(\r\n|\n|\r)/gm," ");
		
	// smart single quotes and apostrophe
    out = out.replace(/[\u2018\u2019\u201A]/g, "\'");
    // smart double quotes
    out = out.replace(/[\u201C\u201D\u201E]/g, "\"");
    // ellipsis
    out = out.replace(/\u2026/g, "...");
    // dashes
    out = out.replace(/[\u2013\u2014]/g, "-");
    // circumflex
    out = out.replace(/\u02C6/g, "^");
    // open angle bracket
    out = out.replace(/\u2039/g, "<");
    // close angle bracket
    out = out.replace(/\u203A/g, ">");
    // spaces
    out = out.replace(/[\u02DC\u00A0]/g, " ");
	
	var newStr = '';
	//replace some closing tags with newline+themselves+the newline
	var closingTags = [ '<\/h1>',
						'<\/h2>',
						'<\/h3>',
						'<\/h4>',
						'<\/h5>',
						'<\/h6>',
						'<\/p>',
						'<\/table>',
						'<\/ul>',
						'<\/ol>',
						'<\/li>',
						'<\/div>',
						'<br>'];
	for (var j = 0; j < closingTags.length; ++j) {
		newStr = closingTags[j] + "\r\n \r\n";
		out = out.replace(new RegExp(closingTags[j], 'gm'), newStr);
	}	
	//replace some opening tags with newline+themselves
	var openingTags = [ '<h1>',
						'<h2>',
						'<h3>',
						'<h4>',
						'<h5>',
						'<h6>'];
	for (var j = 0; j < openingTags.length; ++j) {
		newStr = "\r\n" + openingTags[j];
		out = out.replace(new RegExp(openingTags[j], 'gm'), newStr);
	}
	
	//strip all HTML4.01 tags (such as - div, span and abbr)
	//NB: the URL of all links will be lost. All img will be stripped out, too.
    out = out.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');

	//Converts HTML special characters to their entity equivalents.
	var HTMLentities = [
        ['&amp', '&'],
        ['&apos', '\''],
        ['&#x27', '\''],
        ['&#x2F', '/'],
        ['&#39', '\''],
        ['&#47', '/'],
        ['&lt', '<'],
        ['&gt', '>'],
        ['&nbsp', ' '],
        ['&quot', '"'],
		['&#160;',' ']
    ];
    for (var i = 0, max = HTMLentities.length; i < max; ++i) {
		out = out.replace(new RegExp(HTMLentities[i][0]+';', 'g'), HTMLentities[i][1]);
	}
	
	//replace tabs with single space
	out = out.replace(/\t/g, ' ');
	
	//replace multiple spaces with a single one
	out = out.replace(/ +(?= )/g,'');
	
	//Strip all leading and trailing whitespace from a string.
	out = out.replace(/^\s+/, '').replace(/\s+$/, '');
	
	//leave two linebreaks in a row but remove any more than 2
	out = out.replace(/\n\s*\n\s*\n/g, '\n\n');
	
	return out;
}




function nexusCompare() {
	//compare fields
	var fieldNames = ["title","committee","dateApproval","minute","owner","equalityDate","equalityOutcome","latestReview","nextReview"]
	for (var i = 0; i < fieldNames.length; i++){
		if( $('#' + fieldNames[i] + '1').text() != $('#' + fieldNames[i] + '2').text() ) { 
			$('#' + fieldNames[i] + '2.no-change').removeClass('no-change').addClass('changed');
		} else {
			$('#' + fieldNames[i] + '2.changed').removeClass('changed').addClass('no-change'); 
		}
	}
	
	var text1 = html2text( $('#text1').html() );
	var text2 = html2text( $('#text2').html() );
	// the timeout in seconds
	// If the mapping phase of the diff computation takes longer than this, then the computation is truncated and the best solution to date is returned. 
	// While guaranteed to be correct, it may not be optimal. A timeout of '0' allows for unlimited computation.
	dmp.Diff_Timeout = 0; 
	// The result of any diff may contain 'chaff', irrelevant small commonalities which complicate the output. A post-diff cleanup algorithm factors out these trivial commonalities.
	// You have 3 possible options for this:
	// 	semantic (Increase human readability by factoring out commonalities which are likely to be coincidental.)
	//	efficiency (Increase computational efficiency by factoring out short commonalities which are not worth the overhead. The larger the edit cost, the more agressive the cleanup. 
	//	none (no cleanup - just print the raw output of the diff)
	var cleanupType = 'semantic';
	  
	var ms_start = ( new Date() ).getTime();
	var d = dmp.diff_main(text1, text2);
  
	switch(cleanupType){
		case 'semantic': 
			dmp.diff_cleanupSemantic(d);
			break;
		case 'efficiency': 
			//You need to set the edit cost. Default is 4
			dmp.Diff_EditCost = 4;
			dmp.diff_cleanupEfficiency(d);
			break;
		default: 
			//no cleanup - you get the raw output
	}
	
	var ds = dmp.diff_prettyHtml(d);
	document.getElementById('outputdiv').innerHTML = ds;
	//store the end time  
	var ms_end = ( new Date() ).getTime();
}


function getPolicyForComparison(){
	
	//set the link top go back to the policy 
	$('#policyLink').attr('href','/Lists/ICR%20Policies/DispForm.aspx?ID='  + policyId ); 
	
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
	
	var versionsUrl = webUrl + '/_layouts/15/versions.aspx?List={' + listId +'}&ID=' + policyId;  
	//query the web page with the version history, and parse the HTML to get the list. Ugly, but it works.
	$.ajax({
		type: 'GET',
		url: versionsUrl, 
		data: {format: 'html'},
		success: function(data) {
			var versions = []; // array of all versions.
			var dummyT = []; // dummy array used for temporary storage of a version. For each version we store three values: version number, date, and internal version number 
			var vtable = $(data).find('#DeltaPlaceHolderMain table.ms-settingsframe');
			var elPublishedID = '-1'; //set the publishedID to a number that cannot be matched
			
			vtable.find('tr').each( function(){
				var el = $(this).find('td.ms-vb2:first');
				
				if( el.text().trim().length >0 ){
					var dummyVID = el.next().find('a').attr('href').split('=')[2];
					if(!dummyVID) {dummyVID = '0'; }
					dummyT = [el.text().trim(), el.next().text().trim(), dummyVID ];
					versions.push(dummyT);	
					
					if ( el.parent().hasClass('ms-sectionhighlight') ) {
						elPublishedID = dummyVID; //ID of the published version
					} 
				}
			});
			
			var html = '';
			for (var i = 0; i < versions.length; i++){
				//populate the two dropdowns to select what to compare
				if( versions[i][2] != elPublishedID ) {
					html = '<option value="' + versions[i][2] + '">version '+ versions[i][0] +' (' + versions[i][1] + ')</option>';
				} else {
					html = '<option value="' + versions[i][2] + '">published version '+ versions[i][0] +' (' + versions[i][1] + ')</option>';
				}
				$('#select1').append(html);
				$('#select2').append(html);
			}
			//add option of copy&pasting from a document
			html = '<option value="doc">Text from document</option>';
			$('#select1').append(html);
			$('#select2').append(html);
			
			//compare published vs latest
			$('#select1').val(elPublishedID); 
			$('#select2').val(0);
			//run the comparison only after fetching both versions
			updateForComparison(elPublishedID, "1", true);
			updateForComparison("0", "2", true);
	   },
	   error: function() {
			$('#outputdiv').html('<p>Could not retrieve the policy</p>');
	   },
	});

	
}




