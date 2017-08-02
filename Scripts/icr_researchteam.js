$(document).ready(function ($) {
    fetchKeyInformationLinks();
    fetchKeyContacts(6,3,false);
    fetchGroupSpaces(20,2);
    $('#loadMoreContacts').click(function(){
        $('#keyContacts').empty();
        if($(this).text().indexOf('Load more')!=-1)
        {
            fetchKeyContacts(30,3,false);
            $(this).html('Load Less <span class="glyphicon glyphicon-chevron-up"></span>');
        }
        else if($(this).text().indexOf('View less')!=-1)
        {
            fetchKeyContacts(6,3,false);
            $(this).html('Load more <span class="glyphicon glyphicon-chevron-down"></span>');
        }
        return false;
    });
     clippingText();
      
    $("#read-more").click(function(e) {
        e.preventDefault();
        // $("#read-more").html("Show Less");
        $("#read-more").hide();
        $("#show-less").show(); 
        $("#fos").css( "max-height", "none");   
        $("#fos").html($('#hiddenfield').val());     
    });     
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 
    $("#show-less").click(function(e) {
        e.preventDefault();
        $("#read-more").show();
        $("#show-less").hide(); 
        $("#fos").css( "max-height", "240px");   
        clippingText();

    });    
});


function fetchKeyInformationLinks(){
    var keyLinksRestSource = "../_api/web/lists/getbytitle('Key Information')/items?$select=Link,DisplayOrder&$orderby=DisplayOrder&$top=10";     

    $.ajax(
    {
        url: keyLinksRestSource,
        type: "GET",
        headers: { "accept": "application/json; odata=verbose" },
        cache: false,
        success: function (data) {            
            displayKeyLinks(data.d.results);
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
}
function displayKeyLinks(queryResults){
    var totalItems = queryResults.length;
    if(totalItems == 0){
        $('#keyLinksSection').hide();
    }
    else{
        for (var i = 0; i < queryResults.length; i++) {
            var linkUrl = queryResults[i].Link.Url;
            var linkDescription = queryResults[i].Link.Description;
            var html = '<li class="col-sm-6 col-xs-12 col-no-padding"><a href="'+linkUrl+'">'+linkDescription+'</a></li>';            
            $('#keyLinks').append(html);
        }   
    }
}

function fetchKeyContacts(number,columnNumber,hideKeyContacts){       
    //ProcessImn();

    var keyPeopleRestSource = "../_api/web/lists/getbytitle('Key People')/items?$select="
      + "Person/Id,Person/Name,Person/FirstName,Person/LastName,Person/EMail,Person/WorkPhone,Person/JobTitle&$expand=Person/Id"
      + "&$orderby=DisplayOrder"
      + "&$top="+number;

    $.ajax(
    {
        url: keyPeopleRestSource,
        headers: { "accept": "application/json; odata=verbose" },
        cache: false,
        success: function (items) {            
            displayKeyContacts(items.d.results,number,columnNumber,hideKeyContacts);
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
}

function displayKeyContacts(queryResults,number,columnNumber,hideKeyContacts){
    var totalItems = queryResults.length;
    if(totalItems<number){
        $('#loadMoreContacts').hide();
    }       
    var columnsDiv ='';
    if(columnNumber == 3){
        columnsDiv = '<div class="col-lg-4 col-sm-6 col-xs-12 col-no-padding">';
    }
    
    else if(columnNumber ==4){
        columnsDiv = '<div class="col-lg-3 col-sm-6 col-xs-12 col-no-padding">';
    }
    if(totalItems > 0){
        for (var i = 0; i < queryResults.length; i++) {
            var authorID = queryResults[i].Person.Id;
            var firstName= queryResults[i].Person.FirstName != null ? queryResults[i].Person.FirstName :'';
            var lastName = queryResults[i].Person.LastName!= null ? queryResults[i].Person.LastName :'';
            var name = firstName + ' '+ lastName;
            var email = queryResults[i].Person.EMail !=null ? queryResults[i].Person.EMail : '';
            var jobTitle = queryResults[i].Person.JobTitle !=null ? queryResults[i].Person.JobTitle : '';
            var compressedemail = email !=null ? email.replace('.','').replace('@','') : i;
            var workphone = queryResults[i].Person.WorkPhone? queryResults[i].Person.WorkPhone: '';
            var picture = '/_layouts/15/userphoto.aspx?accountname='+ email ;
            var html = columnsDiv +'<div class="content-wrapper"><div class="md-thumb cover-bg" style="background-image: url('+picture+')">'+
                        '</div><div class="text-table"><div style="line-height: 1"><span style="float:left" class="ms-imnSpan"><a href="#" onclick="IMNImageOnClick(event);'+
                        'return false;" class="ms-imnlink no-border" tabindex="-1"><span class="ms-spimn-presenceWrapper ms-imnImg ms-spimn-imgSize-10x10">'+
                        '<img title="" alt="No presence information" name="imnmark" src="/_layouts/15/images/spimn.png?rev=40"'+
                        ' class="ms-spimn-img ms-spimn-presence-disconnected-10x10x32" showofflinepawn="1" sip="'+email+'" '+
                        'id="imn_'+compressedemail+',type=sip"/></span></a></span><h5 class="text-bold">'+
                        '<a href="../_layouts/15/userdisp.aspx?ID='+authorID+'">'+name+'</a></h5></div><h5 class="pb-10">'+jobTitle+'</h5>'+
                        '<h5><a href="tel:'+workphone+'">'+workphone+'</a></h5><h5 class="text-red"><a href="mailto:'+email+'">'+email+'</a></h5></div></div>';            
            $('#keyContacts').append(html);
        }   
    }
    else{
        if(hideKeyContacts){
            $('#keyContacts').parent().parent().hide();
        }
        else{
            $('#loadMoreContacts').hide();
            $('#keyContacts').html("No key Contacts specified.");
        }
    }

}
function fetchGroupSpaces(number,columnNumber){
    var groupSpacesRestSource = "../_api/web/lists/getbytitle('Group Spaces')/items?$select="
      + "Title,Link"
      + "&$orderby=DisplayOrder"
      + "&$top="+number;

    $.ajax(
    {
        url: groupSpacesRestSource ,
        headers: { "accept": "application/json; odata=verbose" },
        cache: false,
        success: function (items) {            
            displayGroupSpaces(items.d.results,number,columnNumber);
        },
        error: function (err) {
            alert(JSON.stringify(err));
        }
    });
}

function displayGroupSpaces(queryResults,number,columnNumber){
    var totalItems = queryResults.length;
         
    var columnsDiv ='';
    if(columnNumber == 2){
        columnsDiv = '<div class="col-lg-6 col-sm-6 col-xs-12 col-no-padding">';
    }
    
    else if(columnNumber ==3){
        columnsDiv = '<div class="col-lg-4 col-sm-6 col-xs-12 col-no-padding">';
    }
    if(totalItems > 0){
        for (var i = 0; i < queryResults.length; i++) {
            var title = queryResults[i].Title;
            var link= queryResults[i].Link.Url != null ? queryResults[i].Link.Url :'#';
            var html = columnsDiv +'<a href="'+link+'">'+ title +'</a></div>';            
            $('#groupSpaces').append(html);
        }   
    }
    else{
        $('#groupSpaces').html("No group spaces specified.");        
    }

}

function clippingText() {
    var $p = $('#fos p');
    var divh = $('#fos').height();
    $('#hiddenfield').val($('#fos').html()); // we are using this hidden field to store the full text as a value to be displayed in full.
    while ($p.outerHeight() > divh) {
        $p.text(function (index, text) {
            return text.replace(/\W*\s(\S)*$/, '...');
        });
    }
    if(divh<239){
        $('.call-action-sm').hide();
    }
}