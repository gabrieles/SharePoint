function LikePage() {
    var like = false;
    var likeButtonText = $("a.LikeButton").text();
    if (likeButtonText != "") {
        if (likeButtonText == "Like")
            like = true;

        var aContextObject = new SP.ClientContext();
        EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function () {
            Microsoft.Office.Server.ReputationModel.
            Reputation.setLike(aContextObject,
                _spPageContextInfo.pageListId.substring(1, 37),
                _spPageContextInfo.pageItemId, like);

            aContextObject.executeQueryAsync(
                function () {
                    //alert(String(like));
                    GetLikeCount();
                }, function (sender, args) {
                    //alert('F0');
                });
        });
    }

}

function GetLikeCount() {

    var context = new SP.ClientContext(_spPageContextInfo.webServerRelativeUrl);
    var list = context.get_web().get_lists().getById(_spPageContextInfo.pageListId);
    var item = list.getItemById(_spPageContextInfo.pageItemId);

    context.load(item, "LikedBy", "ID", "LikesCount");
    context.executeQueryAsync(Function.createDelegate(this, function (success) {
        // Check if the user id of the current users is in the collection LikedBy. 
        var likeDisplay = true;
        var $v_0 = item.get_item('LikedBy');
        var itemc = item.get_item('LikesCount');
        if (!SP.ScriptHelpers.isNullOrUndefined($v_0)) {
            for (var $v_1 = 0, $v_2 = $v_0.length; $v_1 < $v_2; $v_1++) {
                var $v_3 = $v_0[$v_1];
                if ($v_3.get_lookupId() === _spPageContextInfo.userId) {
                    //cb(true, item.get_item('LikesCount'));
                    //alert("Liked by me");
                    likeDisplay = false;
					break;
                }
            }
        }
        ChangeLikeText(likeDisplay, itemc);

    }), Function.createDelegate(this, function (sender, args) {
        //alert('F1');
    }));

}

function ChangeLikeText(like, count) {
    if (like) {
        jQuery("a.LikeButton").html('<span class="glyphicon glyphicon-thumbs-up"></span>Like');
    }
    else {
        jQuery("a.LikeButton").html('<span class="glyphicon glyphicon-thumbs-down"></span>Unlike');
    }
    var htmlstring = String(count);
    if (count > 0)
        jQuery("#likecount").html(htmlstring+' likes')
    else
        jQuery("#likecount").html("0 likes");
}

jQuery(document).ready(function () {
    var inDesignMode = document.forms[MSOWebPartPageFormName].MSOLayout_InDesignMode.value;

    if (inDesignMode != "1")
    {
        GetLikeCount();
        jQuery("a.LikeButton").click(function () {
            LikePage();
        });
    }
});