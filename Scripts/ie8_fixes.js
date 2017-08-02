/* CCS IMPLEMENTATION IN JQUERY. IE8 WORK-AROUND */
    
jQuery('document').ready(function($) {    
    
    /* Create clear properties on stacked items. Home / OurICR / Teams / Policy Library */
    $(".tools-block .col-xs-12:nth-child(4n+1)").css("clear", "left");
    $(".threecolumnclear .rainbow-block:nth-child(3n+1)").css("clear", "left");
    $(".twocolumnclear .rainbow-block:nth-child(2n+1)").css("clear", "left");
    
    /* Add colours to 'rainbow' blocks. OurICR / Teams / Policy Library */        
    $(".rainbow-block:nth-of-type(6n+1) .container-md").css("border-top", "4px solid #ee7ea6");
    $(".rainbow-block:nth-of-type(6n+2) .container-md").css("border-top", "4px solid #f9a100");
    $(".rainbow-block:nth-of-type(6n+3) .container-md").css("border-top", "4px solid #726e20");
    $(".rainbow-block:nth-of-type(6n+4) .container-md").css("border-top", "4px solid #003d4c");
    $(".rainbow-block:nth-of-type(6n+5) .container-md").css("border-top", "4px solid #6e273d");
    $(".rainbow-block:nth-of-type(6n+6) .container-md").css("border-top", "4px solid #f00034");
    
    /* Alternate row colours on pages. Content Pages / Collaboration Groups */
    $(".icr-table-row:nth-child(even)").css("background-color", "#f8f8f8");
    $(".icr-table-row:nth-child(odd)").css("background-color", "#efefef");
    
    /* Style blocks that contain attachments. Home / OurICR / MyICR / EventDetails */
    $(".attachments-block .container-full-width:last-child").css("border-bottom", "none");
    $(".attachments-block .container-full-width:last-child").css("padding-bottom", "0px");
    $(".attachments-block .container-full-width:first-of-type").css("padding-top", "0px");
    
    /* Style yellow block aside. News Article */
    $(".yellow-block-aside .container-md:first-of-type").css("border-top", "none");
    
    /* Style details block. EventDetails */  
    $(".details-block-aside .container-md:first-of-type").css("border-top", "none");
    
    /* Style search results containers. Event / News */
    $(".search-results-block .container-full-width:first-of-type").css("padding-top", "0px");    
    
    /* Style in-line containers. Home / MyICR */
    $(".icr-container-wrapper:first-of-type").css("padding-top", "0px");
    
    /* Style meta links. Header / Footer */
    $(".icr-subscript h6:first-of-type").css("border-left", "none");
    $(".icr-subscript h6:first-of-type").css("padding-left", "0px");
    
    /* Style information block. OurICR */
    $(".information-block .attachments-wrapper:first-of-type").css("padding-top", "0px");            
    
});    