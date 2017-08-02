var baseURL = '';
var mainURL = '';
var accountName = '';
var userType = '';
var isICRStaff = '';
var nexusRoles;

//defines core URLs to be used by other functions
defineURLs();

/* fix for “Object doesn't support this property or method” error in IE11 */
// from https://stackoverflow.com/questions/18829292/object-doesnt-support-this-property-or-method-error-in-ie11
if (typeof(UserAgentInfo) != 'undefined' && !window.addEventListener) 
{
	UserAgentInfo.strBrowser=1; 
} 
// from https://stackoverflow.com/questions/28659450/object-doesnt-support-property-or-method-attachevent-internetexplorer-11
if(typeof(UserAgentInfo) != 'undefined' &&!document.attachEvent){
	UserAgentInfo.strBrowser=1; 
}

//this is where it all starts
jQuery('document').ready(function ($) {

    //get the two top menus
    getNavigation();

    //add classes to <body> to help with the styling
    addClassToBody()

    // various fixes...
    fixForMobile();
    miscellaneousFixes();

    //define user details, and act upon them
    getCurrentUserDetails(function (profileData) {
       
		//store the user details in the global var nexusUser
		setUserDetails(profileData);
		
		//autofill forms using the data in nexusUser
		autofillNexusForm();
		
		//set the personalised links in the "My ICR" menu
		getUserLinks();
		$('#myDocs').prop('href', mysiteURL + '/Documents');
		
        try {
            addPersonalisation(); // this function is special as it NOT defined in icr_core.js, but it is to be included in those areas where you want to execute code after fetching the user details
        } catch (e) {
            console.log('No additional personalisation on the page')
        }
		
		//while not related to the user details placing this call here induces it to be executed after other functions that define how to display the page
		addAnchors();
		
    });

    getGlobalAlert();

    addDateAndPageContact();

    fixSharedWith();

	
		
}); //end. document ready


//please do not add functions in this file. Add them to icr_core.js and then trigger them here

