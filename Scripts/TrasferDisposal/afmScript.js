var TransferDisposal = TransferDisposal || {};

TransferDisposal.Site = TransferDisposal.Site || {};
TransferDisposal.Site.Title = 'Site';
TransferDisposal.Site.Id = 'dd_Site';

TransferDisposal.Building = TransferDisposal.Building || {};
TransferDisposal.Building.Title = 'Building';
TransferDisposal.Building.Id = 'dd_Building';

TransferDisposal.Floor = TransferDisposal.Floor || {};
TransferDisposal.Floor.Title = 'Floor';
TransferDisposal.Floor.Id = 'dd_Floor';

TransferDisposal.Room = TransferDisposal.Room || {};
TransferDisposal.Room.Title = 'Room';
TransferDisposal.Room.Id = 'dd_Room';

TransferDisposal.WaitDialog = null;

TransferDisposal.IsEditFlag = false;

TransferDisposal.Init = function () {
    $("input[title='" + TransferDisposal.Site.Title + "']").hide();
    $("input[title='" + TransferDisposal.Building.Title + "']").hide();
    $("input[title='" + TransferDisposal.Floor.Title + "']").hide();
    $("input[title='" + TransferDisposal.Room.Title + "']").hide();

    if ($(location).attr("href").toLowerCase().indexOf("editform.aspx") != -1) {
        TransferDisposal.IsEditFlag = true;
    }
    TransferDisposal.PopulateSites();
};

TransferDisposal.PopulateSites = function () {
    var promiseGetSites = TransferDisposal.AFM.GetSites();
    var $site = TransferDisposal.ResetDropDown(TransferDisposal.Site, function () {
        $("input[title='" + TransferDisposal.Site.Title + "']").val($site.val());
        TransferDisposal.PopulateBuildings($("input[title='" + TransferDisposal.Site.Title + "']").val());
    });
    TransferDisposal.OpenWaitDialog();
    promiseGetSites.done(function (sites) {
        $(sites).each(function () {
            $site.append($("<option>").attr('value', this.Site_id).text(this.Name));
        });
        if (!TransferDisposal.IsEditFlag) {
            $("input[title='" + TransferDisposal.Site.Title + "']").val($site.val());
        }
        else {
            $site.val($("input[title='" + TransferDisposal.Site.Title + "']").val());
        }
        TransferDisposal.PopulateBuildings($("input[title='" + TransferDisposal.Site.Title + "']").val());
    });
};

TransferDisposal.PopulateBuildings = function (site) {
    var $building = TransferDisposal.ResetDropDown(TransferDisposal.Building, function () {
        $("input[title='" + TransferDisposal.Building.Title + "']").val($building.val());
        TransferDisposal.PopulateFloors($("input[title='" + TransferDisposal.Building.Title + "']").val());
    });
    if (site == "") {
        TransferDisposal.PopulateFloors("");
    }
    else {
        var promiseGetBuildings = TransferDisposal.AFM.GetBuildings(site);
        TransferDisposal.OpenWaitDialog();
        promiseGetBuildings.done(function (buildings) {
            $(buildings).each(function () {
                $building.append($("<option>").attr('value', this.Bl_id).text(this.Name));
            });
            if (!TransferDisposal.IsEditFlag) {
                $("input[title='" + TransferDisposal.Building.Title + "']").val($building.val());
            }
            else {
                $building.val($("input[title='" + TransferDisposal.Building.Title + "']").val());
            }
            TransferDisposal.PopulateFloors($("input[title='" + TransferDisposal.Building.Title + "']").val());
        });
    }
};

TransferDisposal.PopulateFloors = function (building) {
    var $floor = TransferDisposal.ResetDropDown(TransferDisposal.Floor, function () {
        $("input[title='" + TransferDisposal.Floor.Title + "']").val($floor.val());
        TransferDisposal.PopulateRooms(
            $("input[title='" + TransferDisposal.Building.Title + "']").val(),
            $("input[title='" + TransferDisposal.Floor.Title + "']").val()
        );
    });
    if (building == "") {
        TransferDisposal.PopulateRooms("", "");
    }
    else {
        var promiseGetFloors = TransferDisposal.AFM.GetFloors(building);
        TransferDisposal.OpenWaitDialog();
        promiseGetFloors.done(function (floors) {
            $(floors).each(function () {
                $floor.append($("<option>").attr('value', this.Fl_id).text(this.Name));
            });
            if (!TransferDisposal.IsEditFlag) {
                $("input[title='" + TransferDisposal.Floor.Title + "']").val($floor.val());
            }
            else {
                $floor.val($("input[title='" + TransferDisposal.Floor.Title + "']").val());
            }
            TransferDisposal.PopulateRooms(
                $("input[title='" + TransferDisposal.Building.Title + "']").val(),
                $("input[title='" + TransferDisposal.Floor.Title + "']").val()
            );
        });
    }
};

TransferDisposal.PopulateRooms = function (building, floor) {
    var $room = TransferDisposal.ResetDropDown(TransferDisposal.Room, function () {
        $("input[title='" + TransferDisposal.Room.Title + "']").val($room.val());
    });
    if (building != "" && floor != "") {
        var promiseGetRooms = TransferDisposal.AFM.GetRooms(building, floor);
        TransferDisposal.OpenWaitDialog();
        promiseGetRooms.done(function (rooms) {
            $(rooms).each(function () {
                $room.append($("<option>").attr('value', this.Rm_id).text(this.Rm_id));
            });
            if (!TransferDisposal.IsEditFlag) {
                $("input[title='" + TransferDisposal.Room.Title + "']").val($room.val());
            }
            else {
                $room.val($("input[title='" + TransferDisposal.Room.Title + "']").val());
            }
            TransferDisposal.IsEditFlag = false;
            TransferDisposal.CloseWaitDialog();
        });
    }
    else {
        TransferDisposal.CloseWaitDialog();
    }
};
TransferDisposal.ResetDropDown = function (rootObj, onChangeCallBack) {
    var objDropDown;
    if ($('#' + rootObj.Id).length) {
        objDropDown = $('#' + rootObj.Id);
        objDropDown.empty();
        $("input[title='" + rootObj.Title + "']").val("");
    }
    else {
        objDropDown = $("<select id='" + rootObj.Id + "' />");
        objDropDown.on('change', onChangeCallBack);
        $("input[title='" + rootObj.Title + "']").after(objDropDown);
    }
    return objDropDown;
};

TransferDisposal.OpenWaitDialog = function () {
    if (TransferDisposal.WaitDialog == null) {
        TransferDisposal.WaitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Processing...');
    }
};
TransferDisposal.CloseWaitDialog = function () {
    if (TransferDisposal.WaitDialog != null) {
        TransferDisposal.WaitDialog.close();
        TransferDisposal.WaitDialog = null;
    }
};
