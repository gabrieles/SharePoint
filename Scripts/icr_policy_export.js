//based on https://github.com/markswindoll/jQuery-Word-Export

if (typeof jQuery !== "undefined" && typeof saveAs !== "undefined") {
    (function($) {
        $.fn.wordExport = function(fileName) {
            
			//the fielname is the policy title - for compatibility with NTFS the fielname is shortened to 255 chars and with no unsupported chars 
			//the list is from https://support.office.com/en-us/article/Invalid-characters-in-file-or-folder-names-or-invalid-file-types-in-OneDrive-for-Business-64883A5D-228E-48F5-B3D2-EB39E07630FA )
			fileName = typeof fileName !== 'undefined' ? fileName : $('#policyTitle').text().substring(0, 255).replace(/["#%*:<>?/\\|~&{|}.,']/g, ""); 
            
			var static = {
                mhtml: {
                    top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" xmlns:m=\"http://schemas.microsoft.com/office/2004/12/omml\" xmlns=\"http://www.w3.org/TR/REC-html40\">\n_html_</html>",
                    head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n_styles_\n</head>\n",
                    body: "<body><div class=\"Section1\">_body_</div></body>"
                }
            };
            
            // Clone selected element before manipulating it
            var markup = $(this).clone();
			
			//remove the list of items for the online cover sheet
			markup.find('#cover-list').remove();
			
			//remove the buttons
			markup.find('#policyButtonsContainer').remove();
					
			//display the table with the cover sheet details
			markup.find('#cover-table').css('display','table');
						
			//remove the summary of reviews as a list of items
			markup.find('#policyReviews').remove();
			
			//display the table with the summary of reviews
			markup.find('#policyReviews-table').css('display','table');
			
			//remove the FAQs
			markup.find('#accordion').remove();
			
			//grab the footer message, place it in the page footer, and remove it from the bottom of the document
			var footerMessage = markup.find('#policyInfoPrint').html();
			markup.find('#policyInfoPrint').remove();
				
            // Remove hidden elements from the output
            markup.each(function() {
                var self = $(this);
                if (self.is(':hidden'))
                    self.remove();
            });
			
			var dummyURL = '';
			console.log('aaa');
			//set all link URLs to be absolute
			markup.find('a').each(function() {
				dummyURL = $(this).get(0).href;
				console.log(dummyURL);
                $(this).attr('href',dummyURL);
            });
			
			//set all img src to be absolute
			markup.find('img').each(function() {
				dummyURL = $(this).get(0).src;
                $(this).attr('src',dummyURL);
            });
			
			//Grab the policy status
			var polStatus = markup.attr('class').replace('displayMore','').trim();
			
			//Saving a MS word file as webpage (filtered) will strip out the header/footer. On the other hand, saving it as 
			var headerFooter = '<table id="hrdftrtbl" border="0" cellspacing="0" cellpadding="0">' +
									'<tr>' +
										'<td>' +
											'<div align=right style="mso-element:header" id=h1 >' +
												'<!-- HEADER-tags -->' +
												'<p class=MsoHeader ><span class="' + polStatus +'"status">' + polStatus +' ICR policy</p>' +
												'<!-- end HEADER-tags -->' +
											'</div>' +
										'</td>' +
										'<td>' +
											'<div style="mso-element:footer" id=f1><span style="position:relative;z-index:-1"> ' +
												'<div class=MsoFooter>' +
												     footerMessage +
												'</div>' +
											'</span></div>' +
											'<div style="mso-element:header" id=fh1>' +
												'<p class=MsoHeader><span lang=EN-US style="mso-ansi-language:EN-US">&nbsp;<o:p></o:p></span></p>' +
											'</div>' +
											'<div style="mso-element:footer" id=ff1>' +
												'<p class=MsoFooter><span lang=EN-US style="mso-ansi-language:EN-US">&nbsp;<o:p></o:p></span></p>' +
											'</div>' +
										'</td>' +
									'</tr>' +
								'</table>';
			markup.append(headerFooter);
			
            // Embed all images using Data URLs
			var options = {
                maxWidth: 624
            };
            var images = Array();
            var img = $('#policyTitle').find('img'); //find list of images in the relevant section of the DOM (cannot use markup since to operate with canvas you need to use elements in DOM and not in jQuery)
            for (var i = 0; i < img.length; i++) {
                // Calculate dimensions of output image (rescale to have a max width of 624px to fit in the page)
                var w = Math.min(img[i].width, options.maxWidth);
                var h = img[i].height * (w / img[i].width);
                // Create canvas for converting image to data URL
                $('<canvas>').attr("id", "jQueryWordExportImg" + i).width(w).height(h).insertAfter(img[i]);
                var canvas = document.getElementById("jQueryWordExportImg" + i);
                $(canvas).attr("width",w);
				$(canvas).attr("height",h);
                // Draw image to canvas
                var context = canvas.getContext('2d');
                context.drawImage(img[i], 0, 0, w, h);
                // Get data URL encoding of image
                var uri = canvas.toDataURL(); //The HTMLCanvasElement.toDataURL() defaults to output a PNG at 96 dpi.
                $(img[i]).attr("src", img[i].src);
                $(img[i]).attr("width", w);
				$(img[i]).attr("height", h);
                // Save encoded image to array
                images[i] = {
                    type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
                    encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
                    location: $(img[i]).attr("src"),
                    data: uri.substring(uri.indexOf(",") + 1)
                };
                // Remove canvas now that we no longer need it
                canvas.parentNode.removeChild(canvas);
            }

            // Prepare bottom of mhtml file with image data
            var mhtmlBottom = "\n";
            for (var i = 0; i < images.length; i++) {
                mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n";
                mhtmlBottom += "Content-Location: " + images[i].contentLocation + "\n";
                mhtmlBottom += "Content-Type: " + images[i].contentType + "\n";
                mhtmlBottom += "Content-Transfer-Encoding: " + images[i].contentEncoding + "\n\n";
                mhtmlBottom += images[i].contentData + "\n\n";
            }
            mhtmlBottom += "--NEXT.ITEM-BOUNDARY--";
			
			//to find out what to use for the stylesheet, create a MS word document, and update the styling of the font styles (Normal, Title, Heading1 etc.) then save the file as a webpage. 
			//The resulting HTML will have the CSS-ish code that MS word requires. Beware that if MS Word does not like the css it will randomly break the page layout and styles...
            var styles = '<style> '+
							'<!-- '+
								'/* Font Definitions */'+
								'@font-face'+
									'{font-family:Wingdings;'+
									'panose-1:5 0 0 0 0 0 0 0 0 0;'+
									'mso-font-charset:2;'+
									'mso-generic-font-family:auto;'+
									'mso-font-pitch:variable;'+
									'mso-font-signature:0 268435456 0 0 -2147483648 0;}'+
								'@font-face'+
								'{font-family:Wingdings;'+
									'panose-1:5 0 0 0 0 0 0 0 0 0;'+
									'mso-font-charset:2;'+
									'mso-generic-font-family:auto;'+
									'mso-font-pitch:variable;'+
									'mso-font-signature:0 268435456 0 0 -2147483648 0;}'+
								'/* Style Definitions */'+
								'body'+
									'{mso-style-unhide:no;'+
									'mso-style-qformat:yes;'+
									'mso-style-parent:"";'+
									'margin:0cm;'+
									'margin-bottom:.0001pt;'+
									'mso-pagination:widow-orphan;'+
									'font-size:11.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;}'+
								'p.MsoNormal, li.MsoNormal, div.MsoNormal'+
									'{mso-style-unhide:no;'+
									'mso-style-qformat:yes;'+
									'mso-style-parent:"";'+
									'margin:0cm;'+
									'margin-bottom:.0001pt;'+
									'mso-pagination:widow-orphan;'+
									'font-size:11.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;}'+
								'h1'+
									'{mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-qformat:yes;'+
									'mso-style-link:"Heading 1 Char";'+
									'mso-margin-top-alt:auto;'+
									'margin-right:0cm;'+
									'mso-margin-bottom-alt:auto;'+
									'margin-left:0cm;'+
									'mso-pagination:widow-orphan;'+
									'mso-outline-level:1;'+
									'border:none;'+
									'mso-border-bottom-alt:solid #FFD602 .75pt;'+
									'font-size:24.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;'+
									'font-weight:bold;}'+
								'h2'+
									'{mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-qformat:yes;'+
									'mso-style-link:"Heading 2 Char";'+
									'mso-margin-top-alt:auto;'+
									'margin-right:0cm;'+
									'mso-margin-bottom-alt:auto;'+
									'margin-left:0cm;'+
									'mso-pagination:widow-orphan;'+
									'mso-outline-level:2;'+
									'font-size:20.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;'+
									'font-weight:bold;}'+
								'h3'+
									'{mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-qformat:yes;'+
									'mso-style-link:"Heading 3 Char";'+
									'mso-margin-top-alt:auto;'+
									'margin-right:0cm;'+
									'mso-margin-bottom-alt:auto;'+
									'margin-left:0cm;'+
									'mso-pagination:widow-orphan;'+
									'mso-outline-level:3;'+
									'border:none;'+
									'mso-border-bottom-alt:solid #C9DD03 .75pt;'+
									'font-size:16.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;'+
									'font-weight:bold;}'+			
								'h4'+
									'{mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-qformat:yes;'+
									'mso-style-link:"Heading 4 Char";'+
									'mso-margin-top-alt:auto;'+
									'margin-right:0cm;'+
									'mso-margin-bottom-alt:auto;'+
									'margin-left:0cm;'+
									'mso-pagination:widow-orphan;'+
									'mso-outline-level:4;'+
									'font-size:15.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;'+
									'font-weight:bold;}'+
								'p'+
									'{mso-style-noshow:yes;'+
									'mso-style-priority:99;'+
									'mso-margin-top-alt:auto;'+
									'margin-right:0cm;'+
									'mso-margin-bottom-alt:auto;'+
									'margin-left:0cm;'+
									'mso-pagination:widow-orphan;'+
									'font-size:11.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:minor-fareast;}'+
								'h1.page-title' +
									'{font-size:32.0pt; '+
									'border:none; ' +
									'mso-border-bottom-alt:auto;}' +
								'span.Heading1Char'+
									'{mso-style-name:"Heading 1 Char";'+
									'mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-locked:yes;'+
									'mso-style-link:"Heading 1";'+
									'mso-ansi-font-size:24.0pt;'+
									'mso-bidi-font-size:24.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-ascii-font-family:Arial;'+
									'mso-ascii-theme-font:major-latin;'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:major-fareast;'+
									'mso-hansi-font-family:Arial;'+
									'mso-hansi-theme-font:major-latin;'+
									'mso-bidi-font-family:Arial;'+
									'mso-bidi-theme-font:major-bidi;'+
									'color:#365F91;'+
									'mso-themecolor:accent1;'+
									'mso-themeshade:191;'+
									'font-weight:bold;}'+
								'span.Heading2Char'+
									'{mso-style-name:"Heading 2 Char";'+
									'mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-locked:yes;'+
									'mso-style-link:"Heading 2";'+
									'mso-ansi-font-size:20.0pt;'+
									'mso-bidi-font-size:20.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-ascii-font-family:Arial;'+
									'mso-ascii-theme-font:major-latin;'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:major-fareast;'+
									'mso-hansi-font-family:Arial;'+
									'mso-hansi-theme-font:major-latin;'+
									'mso-bidi-font-family:Arial;'+
									'mso-bidi-theme-font:major-bidi;'+
									'color:#365F91;'+
									'mso-themecolor:accent1;'+
									'mso-themeshade:191;'+
									'font-weight:bold;}'+
								'span.Heading3Char'+
									'{mso-style-name:"Heading 3 Char";'+
									'mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-locked:yes;'+
									'mso-style-link:"Heading 3";'+
									'mso-ansi-font-size:16.0pt;'+
									'mso-bidi-font-size:16.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-ascii-font-family:Arial;'+
									'mso-ascii-theme-font:major-latin;'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:major-fareast;'+
									'mso-hansi-font-family:Arial;'+
									'mso-hansi-theme-font:major-latin;'+
									'mso-bidi-font-family:Arial;'+
									'mso-bidi-theme-font:major-bidi;'+
									'color:#365F91;'+
									'mso-themecolor:accent1;'+
									'mso-themeshade:191;'+
									'font-weight:bold;}'+		
								'span.Heading4Char'+
									'{mso-style-name:"Heading 4 Char";'+
									'mso-style-noshow:yes;'+
									'mso-style-priority:9;'+
									'mso-style-unhide:no;'+
									'mso-style-locked:yes;'+
									'mso-style-link:"Heading 4";'+
									'mso-ansi-font-size:15.0pt;'+
									'mso-bidi-font-size:15.0pt;'+
									'font-family:"Arial", "sans-serif";'+
									'mso-ascii-font-family:Arial;'+
									'mso-ascii-theme-font:major-latin;'+
									'mso-fareast-font-family:"Times New Roman";'+
									'mso-fareast-theme-font:major-fareast;'+
									'mso-hansi-font-family:Arial;'+
									'mso-hansi-theme-font:major-latin;'+
									'mso-bidi-font-family:Arial;'+
									'mso-bidi-theme-font:major-bidi;'+
									'color:#4F81BD;'+
									'mso-themecolor:accent1;'+
									'font-weight:bold;'+
									'font-style:italic;}'+
								'span.SpellE'+
									'{mso-style-name:"";'+
									'mso-spl-e:yes;}'+
								'span.GramE'+
									'{mso-style-name:"";'+
									'mso-gram-e:yes;}'+
								'.MsoChpDefault'+
									'{mso-style-type:export-only;'+
									'mso-default-props:yes;'+
									'font-size:11.0pt;'+
									'mso-ansi-font-size:11.0pt;'+
									'mso-bidi-font-size:11.0pt;}'+
								'@page WordSection1'+
									'{size:595.3pt 841.9pt;'+
									'margin:72.0pt 72.0pt 72.0pt 72.0pt;'+
									'mso-header-margin:35.4pt;'+
									'mso-footer-margin:35.4pt;'+
									'mso-paper-source:0;}'+
								'div.WordSection1'+
									'{page:WordSection1;}'+
								'ol'+
									'{margin-bottom:0cm;}'+
								'ul'+
									'{margin-bottom:0cm;}'+
								'table#cover-table'+
									'{background:#D9D9D9;border-collapse:collapse;border:none}'+	
								'table#cover-table td' +
									'{border:solid #7F7F7F 1.0pt;padding:2.85pt 5.4pt 2.85pt 5.4pt}'+	
								'.MsoHeader' +
									'{color:#7F7F7F;font-size:10.0pt;mso-bidi-font-size:11.0pt}'+
								'.MsoFooter' +
									'{color:#7F7F7F;}'+	
								'.MsoFooter p' +
									'{margin-bottom:6pt;font-size:10.0pt;mso-bidi-font-size:11.0pt}' +
								'.pending' +
									'{color:#F00034;}'+
								'-->'+
							'</style>'+
							'<style>' +
								'v\:* {behavior:url(#default#VML);}' +
								'o\:* {behavior:url(#default#VML);}' +
								'w\:* {behavior:url(#default#VML);}' +
								'.shape {behavior:url(#default#VML);}' +
							'</style>' +
							'<style>' +
								'@page' +
								'{' +
								'    mso-page-orientation: portrait;' +
								'    size: 21cm 29.7cm;  /* A4 */ ' +   
								'	 margin:2cm 1.5cm 2cm 1.5cm;' +
								'}' +
								'@page Section1 {' +
								'    mso-header-margin:.5in;' +
								'    mso-footer-margin:.5in;' +
								'    mso-header: h1;' +
								'    mso-footer: f1;' +
								'    }' +
								'div.Section1 { page:Section1; }' +
								'table#hrdftrtbl' +
								'{' +
								'    margin:0in 0in 0in 900in;' +
								'    width:1px;' +
								'    height:1px;' +
								'    overflow:hidden;' +
								'}' +
								'p.MsoFooter, li.MsoFooter, div.MsoFooter' +
								'{' +
								'    margin:0in;' +
								'    margin-bottom:.0001pt;' +
								'    mso-pagination:widow-orphan;' +
								'    tab-stops:center 3.0in right 6.0in;' +
								'    font-size:10.0pt;' +
								'}' +
								'</style>' +
								'<xml>' +
								'<w:WordDocument>' +
								'<w:View>Print</w:View>' +
								'<w:Zoom>100</w:Zoom>' +
								'<w:DoNotOptimizeForBrowser/>' +
								'</w:WordDocument>' +
								'</xml>';

            // Aggregate parts of the file together 
            var fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.html())) + mhtmlBottom;
			

			//ToDO: relative links point to file// instead of nexus...
			
            // Create a Blob with the file contents
            var blob = new Blob([fileContent], {
                type: "application/msword;charset=utf-8"
            });
            saveAs(blob, fileName + ".doc");
        };
    })(jQuery);
} else {
    if (typeof jQuery === "undefined") {
        console.error("jQuery Word Export: missing dependency (jQuery)");
    }
    if (typeof saveAs === "undefined") {
        console.error("jQuery Word Export: missing dependency (FileSaver.js)");
    };
}
