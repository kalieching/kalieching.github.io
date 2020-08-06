//Get the button
let mybutton = document.getElementById("myBtn");

//When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    $(document.getElementById("myBtn")).fadeIn();
    $(document.getElementById("mySidenav")).fadeIn();

  } else {
    document.getElementById("myBtn").style.display = "none";
    $(document.getElementById("myBtn")).fadeOut();
    $(document.getElementById("mySidenav")).fadeOut();
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
