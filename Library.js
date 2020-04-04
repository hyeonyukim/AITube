function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}


$(document).ready(function() {
    var sidenavWidth = $('sidenav').width();
    var subtitleWidth = $('subtitleScreen').width();
    var screenWidth = screen.width;
    $('pallet').width(screenWidth - sidenavWidth - subtitleWidth);
});