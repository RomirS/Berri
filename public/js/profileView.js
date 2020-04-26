let userData = document.getElementById('userData').value;
let tutorData = document.getElementById('tutorData').value;
let tutorSubjects = document.getElementById('tutorSubjects').value;
let NOCONT = $( "#noContent" );
let YESCONT = $( "#yesContent" );

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
    a.addEventListener("click", function(){ 
    INPTXT.setAttribute("value", ''); 
    INPTXT.setAttribute("value", a.value); 
    SUBJFORM.submit();
    });
    DROPCONT.append(a)
});