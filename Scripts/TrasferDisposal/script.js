$(document).ready(function () {

    //Inject css
    InsertCss(".ms-formlabel h3.ms-standardheader { min-width: 360px; }");

    //update controls
    // Hide or shor info on recipient
    $("table[id^='ICR_x0020_Division_x0020_recipie']").closest('tr').hide();
    $("table[id^='Third_x0020_party_x0020_recipien']").closest('tr').hide();


    $("input[value='Site management (for disposal)']").change(function () {
        if ($(this).prop("checked", true)) {
            $("table[id^='ICR_x0020_Division_x0020_recipie']").closest('tr').hide();
            $("table[id^='Third_x0020_party_x0020_recipien']").closest('tr').hide();
        }
    });

    $("input[value='Another division in the ICR']").change(function () {
        if ($(this).prop("checked", true)) {
            $("table[id^='ICR_x0020_Division_x0020_recipie']").closest('tr').show();
            $("table[id^='Third_x0020_party_x0020_recipien']").closest('tr').hide();
        }
    });

    $("input[value='A third party']").change(function () {
        if ($(this).prop("checked", true)) {
            $("table[id^='ICR_x0020_Division_x0020_recipie']").closest('tr').hide();
            $("table[id^='Third_x0020_party_x0020_recipien']").closest('tr').show();
        }
    });


    //Hide or show infor on decontamination
    $("textarea[title='How it was decontaminated?']").closest('tr').hide();

    $("input[value='The equipment/area was decontaminated.']").change(function () {
        if ($(this).prop("checked", true)) {
            $("textarea[title='How it was decontaminated?']").closest('tr').show();
        }
    });

    $("input[value='Not needed since it has never been exposed to hazardous substances.']").change(function () {
        if ($(this).prop("checked", true)) {
            $("textarea[title='How it was decontaminated?']").closest('tr').hide();
        }
    });

    TransferDisposal.Init();
});

function InsertCss(code) {
    var style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet) {
        // IE
        style.styleSheet.cssText = code;
    } else {
        // Other browsers
        style.innerHTML = code;
    }

    document.getElementsByTagName("head")[0].appendChild(style);
}
