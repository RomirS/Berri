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
    YESCONT.css("display", "block").addClass('center');
    tutorData.subjects.forEach(subject => {
        YESCONT.append(`<h3>${subject}</h3>`);
    });
} else {
    NOCONT.css("display", "block");
    YESCONT.css("display", "none");
}

let DROPCONT = $("#dropdown-content");
let SUBJFORM = $("#subjectForm");
let INPTXT = document.getElementById("chooseSubjectText");
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

function changeProfPic() {
    // console.log("changing profile picture");
    // document.getElementsByClassName('prof')[0].style.display = "none";
    // document.getElementsByClassName("overlay")[0].style.display = "none";
    // document.getElementsByClassName("imageSection")[0].style.backgroundImage = "none"
    var new_url = window.prompt("New profile pic url:")
    if (new_url == null || new_url == "") {
        console.log("user cancelled")
    } else {
        $.ajax({
            type: "POST",
            url: "changeProfPic",
            data: { newUrl: new_url },
            dataType: "json",
            success: function(data, textStatus) {
                console.log("SUCCESS")
                console.log(data.url)
                window.location.replace(data.url)
            }
        });
    }
}