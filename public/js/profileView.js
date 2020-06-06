let userData = document.getElementById('userData').value;
let tutorData = document.getElementById('tutorData').value;
let tutorSubjects = document.getElementById('tutorSubjects').value;
let NOCONT = $("#noContent");
let YESCONT = $("#yesContent");

var isTutor = false;
if (userData.userType == "Registered Tutor") {
    isTutor = true;
}

if (isTutor) {
    NOCONT.css("display", "none");
    tutorData.subjects.forEach(subject => {
        $('#subjects').append(`<div>${subject} </div>`);
    });
    if (tutorData.isActive) {
        $('#status').text('Status: Active')
    } else {
        $('#status').text('Status: Inactive')
    }

} else {
    NOCONT.css("display", "block");
    YESCONT.css("display", "none");
}

let DROPCONT = $("#dropdownContent");
let SUBJFORM = $("#subjectForm");
let INPTXT = document.getElementById("chooseSubject");
tutorSubjects.forEach(function(subject) {
    var a = document.createElement('a');
    a.value = subject;
    a.appendChild(document.createTextNode(subject));
    a.addEventListener("click", function() {
        INPTXT.setAttribute("value", '');
        INPTXT.setAttribute("value", a.value);
        SUBJFORM.submit();
    });
    DROPCONT.append(a)
});

function newProfPic() {
    $('#myFile').trigger('click');
}
$('#myFile').change(function() {
    $('#newPfpForm').submit();
});

$( ".imageSection" ).hover(
function() {
    $('.overlay').removeClass('fade-out');
    $('.overlay').addClass('fade-in');
}, function() {
    $('.overlay').removeClass('fade-in');
    $('.overlay').addClass('fade-out');
}
);

function makeResponsive(maxWidth) {

    var setMax = false;
    if (window.innerWidth >= maxWidth) setMax = true;
    function modifyProp(tag, prop, val) {
        if (setMax) $(tag).css(prop, val/100 * maxWidth);
        else $(tag).css(prop, `${val}vw`);
    }

    //- Overall
    modifyProp('.section', 'margin', 1);
    modifyProp('.section', 'padding', 3);

    //- Box 1
    modifyProp('.imageSection', 'width', 24.6);
    modifyProp('.imageSection', 'padding-top', 24.6);
    modifyProp('#pfpText', 'font-size', 1.8);

    //- Box 2
    modifyProp('#headerSection .heading', 'font-size', 8);
    modifyProp('.imgContainer', 'width', 8);
    modifyProp('.imgContainer', 'height', 8);

    //- Box 3
    modifyProp('#sect3', 'width', 35)
    modifyProp('#yesContent div', 'margin-bottom', 1.0)
    modifyProp('#yourSubjects', 'font-size', 3.5);
    modifyProp('#subjects div', 'font-size', 3.2);
    modifyProp('#subjects div', 'margin-right', 1.0);
    modifyProp('#status', 'font-size', 3.5);
    modifyProp('#status', 'margin-top', 2.5);
    modifyProp('#toggleStatus .button', 'height', 6.5);
    modifyProp('#toggleStatus .button', 'width', 12.0);
    modifyProp('#toggleStatus input:submit', 'font-size', 2.5);

    //- Box 4
    modifyProp('#subjectForm', 'margin-bottom', 2.0);
    modifyProp('#chooseSubject', 'font-size', 3.5);
    modifyProp('#chooseSubject', 'padding', 1.5);
    modifyProp('.col-2 .heading', 'font-size', 3.5);
    modifyProp('#searchEmails', 'font-size', 2.8);


    $('#dropdownContent').width( $('#chooseSubject').width() );

}

makeResponsive(1015);
window.addEventListener('resize', (e) => {
    makeResponsive(1015);
});


// function changeProfPic() {
//     var new_url = window.prompt("New profile pic url:")
//     if (new_url == null || new_url == "") {
//         console.log("user cancelled")
//     } else {
//         $.ajax({
//             type: "POST",
//             url: "changeProfPic",
//             data: { newUrl: new_url },
//             dataType: "json",
//             success: function(data, textStatus) {
//                 console.log("SUCCESS")
//                 console.log(data.url)
//                 window.location.replace(data.url)
//             }
//         });
//     }
// }