function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function showMoreProfile(){
	$('#profile-box').removeClass("collapsed");
}
function hideMoreProfile(){
	$('#profile-box').addClass("collapsed");
}

function displayProfileInfo(userData, isItMe) {
		    
	var html = '';		
	
	var result = userData.d;
	uValsList = result.UserProfileProperties.results;
	var uVals =[];

	for(var k in uValsList) {
		uVals[uValsList[k].Key] = uValsList[k].Value;
	}
	
	//Add the name
	var uName = result.DisplayName;
	var uHonorific = honorificTrim(uVals.Honorific);
	if (uName) {
		if(uHonorific) {
			html += '<div class="profileName ms-core-pageTitle">' + uHonorific + ' ' + uName + '</div>';
		} else {
			html += '<div class="profileName ms-core-pageTitle">' + uName + '</div>';
		}
	}  
	
	//Add the profile picture
	var uPicUrl = result.PictureUrl;        
	html += '<div id="newProfilePic" class="ms-profile-image">';
	if (uPicUrl) {
		uPicUrl = uPicUrl.replace("MThumb", "LThumb");
		html += '<div id="profilePic" class="ms-profile-image" name="onetidHeadbnnr0" style=" background-image: url(\'' + uPicUrl + '\');" alt="User Photo"></div>';		
	}
	html += '</div>';

	
	//add the yellow box with all the details
	html += '<div id="profile-box" class="profile-wrapper collapsed">';	
	console.log(result);
	console.log(uVals);
	//organisational details
	var uTitle = result.Title;
	var uDept = uVals.Department;
	var uTeam = uVals.Team;
	
	html += '<div id="uPersonal">';
	if (uTitle) { html += '<div class="ms-textLarge" id="uTitle"> ' + uTitle + ' </div>'; }
	if (uDept && uTeam) { 
		html += '<div class="ms-textLarge font-it" id="uDept"><span title="Department">' +  uDept + '</span> - <span title="Team">' + uTeam + '</span></div>'; 
	} else {
		if (uDept != '' ) { html += '<div class="ms-textLarge font-it" id="uDept" title="Department">' + uDept + '</div>'; }
		if (uTeam != '') { html += '<div class="ms-textLarge font-it" id="uTeam" title="Team">' + uTeam + '</div>';	}
	}
	html += '</div>';
	
	
	//Core contact details	
	html += '<div id="uContacts">';
	
	var uEmail = result.Email;
	if (!uEmail) {uEmail = '';}
	html += '<div id="uEmail" class="profileCoreContact"> <span class="profileIcon glyphicon glyphicon-envelope"></span><a title="Send an email" href="mailto:' + uEmail + '">' + uEmail + '</a></div>'; 
	
	var uPhone = uVals.WorkPhone;
	if (!uPhone) {uPhone = '';}
	if (uPhone != '') { html += '<div id="uPhone" class="profileCoreContact"> <span class="profileIcon glyphicon glyphicon-earphone"></span>' + uPhone + '</div>'; }
	
	var uSkype = uVals["SPS-SipAddress"];
	if (!uSkype) {uSkype = '';}
	if (uSkype != '') { html += '<div id="uSkype" class="profileCoreContact"> <span class="profileIcon"></span><a title="Send a message via Skype" href="sip:' + uSkype + '">Send instant message</a></div>'; } else { html += '<div id="uNoSkype"></div>'; }
	
	html += '</div>';
	

	html += '<div id="showOn" class="showBtnContainer"><a class="showToggle" onclick="showMoreProfile();">Show more</a></div>';
	
	// Manager
	var uManager = uVals.Manager;
	if (!uManager) {uManager = '';}
	html += '<div id="uManager">'; 
	html += '<div class="dis-ib profileLabel">Manager : </div>';
	html += '<div class="dis-ib profileField">';
	html += '<span> <a id="uMng" href="/Person.aspx?accountname=' + uManager + '" data-name="'+ uManager +'">'+ uManager +'</a></span>';
	html += '</div></div>';
	
	// Hierarchy
	//var uManagers = result.ExtendedManagers.results;
	//var uReports = result.ExtendedReports.results;
	//var uPeers = result.Peers.results;
	
	
	//Location
	var uSite =  uVals["SPS-Location"];
	var uBuilding = uVals.Building;
	var uFloor = uVals.Floor;
	var uRoom = uVals.Room;
	if (uSite || uBuilding || uFloor || uRoom) {
		html += '<div id="uLocation">';
		html += '<div class="dis-ib profileLabel">Location : </div>';
		html += '<div class="dis-ib profileField">'; 
		if (uSite != '') { html += '<span>' + uSite + '</span>'; }
		if (uBuilding != '') { html += '<span>' + uBuilding + '</span>'; }
		if (uFloor != '') { html += '<span>' + uFloor + '</span>'; }
		if (uRoom != '') { html += '<span>' + uRoom + '</span>'; }
		html += '</div></div>';
	}
	
	
	//User-driven fields
	html += '<div id="uAdditional">';
	
	var uRSkills = uVals["SPS-Skills"]; 
	var uRSkillsOut = '';
	if (uRSkills){
		var uRSkillsArray = uRSkills.split("|");
		for (i = 0; i < uRSkillsArray.length; i++) {
			uRSkillsOut += '<span><a href="https://nexus.icr.ac.uk/Search/pages/peopleresults.aspx#k=' + uRSkillsArray[i] + '">' + uRSkillsArray[i] + '</a></span>';
		}
	}
	html += '<div id="uRSkills"> <div class="profileLabel dis-ib">Research skills : </div> <div class="profileField dis-ib">' + uRSkillsOut + '</div></div>'; 
	
	var uRInterests = uVals["SPS-Interests"]; 
	var uRInterestsOut = '';
	if (uRInterests){
		var uRInterestsArray = uRInterests.split("|");
		for (i = 0; i < uRInterestsArray.length; i++) {
			uRInterestsOut += '<span><a href="https://nexus.icr.ac.uk/Search/pages/peopleresults.aspx#k=' + uRInterestsArray[i] + '">' + uRInterestsArray[i] + '</a></span>';
		}
	}
	html += '<div id="uRInterests"> <div class="profileLabel dis-ib">Research interests : </div> <div class="profileField dis-ib"><span> ' + uRInterestsOut + ' </span></div></div>'; 
	
	var uProfSkills = uVals.ProfessionalSkills;
	var uProfSkillsOut = '';
	if (uProfSkills){
		var uProfSkillsArray = uProfSkills.split("|");
		for (i = 0; i < uProfSkillsArray.length; i++) {
			uProfSkillsOut += '<span><a href="https://nexus.icr.ac.uk/Search/pages/peopleresults.aspx#k=' + uProfSkillsArray[i] + '">' + uProfSkillsArray[i] + '</a></span>';
		}
	}
	html += '<div id="uProfSkills"> <div class="profileLabel dis-ib">Professional skills : </div> <div class="profileField dis-ib"><span> ' + uProfSkillsOut + ' </span></div></div>';
		
	html += '</div>';
	
	
	html += '<div id="showOff" class="showBtnContainer"><a class="showToggle" onclick="hideMoreProfile();">Show less</a></div>';
	
	html += '</div>'; //close the yellow box
	
	var uAboutMe = uVals.AboutMe;
	if (uAboutMe) { html += '<div id="uAboutMe"> <span> ' + uAboutMe + ' </span> </div>'; }		

	
	$('#profileData').append(html);
	
	
	
	if (isItMe) {
		
		var htmlEdit = '<a id="update-profile" href="/_layouts/15/EditProfile.aspx" title="Update your profile"><h5 class="text-bold"><span class="glyphicon glyphicon-edit-profile"></span>Edit</h5></a>';
		$('#profile-box').append(htmlEdit);
		
		//add profile completition measurement
		var addMessage = 'Edit your profile to improve your score!';
		var profCompleted = 0;
		uProfSkills ? profCompleted = profCompleted +20 : addMessage = 'Fill your Professional skills for a +20%';
		uRInterests ? profCompleted = profCompleted +20 : addMessage = 'Fill your Research interests for a +20%';
		uAboutMe ?    profCompleted = profCompleted +30 : addMessage = 'Fill your "About me" for a +30%';
		uRSkills ?    profCompleted = profCompleted +30 : addMessage = 'Fill your Research skills for a +30%';
		
		if (profCompleted == 100) addMessage = 'Congratulations! Your profile is complete!';
		
		var addAverage = 'The average across the ICR is 15%';
		if (profCompleted > 15 ) addAverage = '';
		
		var htmlComp = ' <div class="radial-wrapper">'+
							'<div id="radial-container" class="radial-progress progress-'+profCompleted+' progress-start progress-pink" >'+
								'<div class="circle"><div class="mask full"><div class="fill"></div></div><div class="mask half"><div class="fill"></div><div class="fill fix"></div></div></div>'+
								'<div class="inset"><div class="percentage">'+profCompleted+'<span class="stretch-v-200">%</span><div class="completed">completed</div></div></div>'+
							'</div>'+
							'<div class="radial-progress-messages"><div class"average">'+addAverage+'</div><div class="addmessage">'+addMessage+'</div></div>'+
						'</div>';
		$('#MiddleLRightCell #MSOZoneCell_WebPart').append(htmlComp);
		window.setTimeout( function() {$('#radial-container').removeClass('progress-start')}, 500);
		
	}	

	//update the manager's name in the background
	$.ajax({
		
		url: _spPageContextInfo.webServerRelativeUrl + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + uManager +"'",
		method: "GET",
		headers: {
			"accept": "application/json;odata=verbose"
		},
		success: function (data) {
			var manResult = data.d;
			$('#uMng').text(manResult.DisplayName);
		},
		error: function (err) {errorProfileInfo(err)}
	});	
	
	
}

function errorProfileInfo(errorOutput) {
	console.log(JSON.stringify(errorOutput));
}

function getProfileInfo() {
	var baseUrl = _spPageContextInfo.webServerRelativeUrl;
	var URLaccountName = getURLParameter('accountname');
	if (URLaccountName && URLaccountName.indexOf("|") >0 ) { URLaccountName = URLaccountName.split('|').pop(); }
	if (URLaccountName) {
		$.ajax({
			
			url: baseUrl + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + URLaccountName +"'",
			method: "GET",
			headers: {
				"accept": "application/json;odata=verbose"
			},
			success: function (data) {displayProfileInfo(data, false)},
			error: function (err) {errorProfileInfo(err)}
		});	
	} else {
		$.ajax({
			
			url: baseUrl + "_api/SP.UserProfiles.PeopleManager/GetMyProperties",
			method: "GET",
			headers: {
				"accept": "application/json;odata=verbose"
			},
			success: function (data) {displayProfileInfo(data, true)},
			error: function (err) {errorProfileInfo(err)}
		});	
	}
}


