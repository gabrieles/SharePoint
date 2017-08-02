var TransferDisposal = TransferDisposal || {};
TransferDisposal.AFM = TransferDisposal.AFM || {};

//Get sites from sites api
TransferDisposal.AFM.GetSites = function () {
    var dfd = jQuery.Deferred();
    $.ajax({
        url: "https://nexus.icr.ac.uk/_vti_bin/AFMService.svc/GetSites",
        type: "GET",
        async: true,
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            dfd.resolve(data);
        }
    });
    return dfd.promise();
};

//Get buildings from buildings api
TransferDisposal.AFM.GetBuildings = function (site) {
    var dfd = jQuery.Deferred();
     $.ajax({
        url: "https://nexus.icr.ac.uk/_vti_bin/AFMService.svc/GetBuildings/" + site,
        type: "GET",
        async: true,
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            dfd.resolve(data);
        }
    });
    return dfd.promise();
};

//Get floors from floors api
TransferDisposal.AFM.GetFloors = function (building) {
    var dfd = jQuery.Deferred();
     $.ajax({
        url: "https://nexus.icr.ac.uk/_vti_bin/AFMService.svc/GetFloors/" + building,
        type: "GET",
        async: true,
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            dfd.resolve(data);
        }
    });
    return dfd.promise();
};

//Get rooms from rooms api
TransferDisposal.AFM.GetRooms = function (building, floor) {
    var dfd = jQuery.Deferred();
     $.ajax({
        url: "https://nexus.icr.ac.uk/_vti_bin/AFMService.svc/GetRooms/" + building + "/" + floor,
        type: "GET",
        async: true,
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            dfd.resolve(data);
        }
    });
    return dfd.promise();
};