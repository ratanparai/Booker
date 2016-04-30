$('img').error(function(){
        console.log('image not found');
        $(this).attr('src', '/images/missing.png');
});

$('#profile-update-form').submit(function(event){
    
    var newPass = $('#newpassword').val();
    var confPass = $('#confirmpassword').val();
    
    if(newPass!= "" || confPass!= "") {
        if(newPass != confPass) {
            $('#confirmPasswordBox').addClass("has-error");
            $('#newPasswordBox').addClass("has-error");
            $('#myModal').modal();
            
            event.preventDefault();
        } else {
           
        }
        
    }
    
    
});

$("#rating").rating();


// SOCKET.IO 
var socket = io.connect('http://localhost:8056');

socket.on('refresh profile page', function(data){
    console.log("refresh profile page");
    // load image
    $('.img-circle').src = data.url ;
    console.log("page refresh initiated");
    //location.reload();
});

// search book 

socket.on('new book in search', function(data){
    // add new book to the search result page.
    console.log(data);
    
    html = '<div class="col-md-2" style="display: none;"><a href="/book/' + data.id + '">';
    html += '<img src="/images/books/'+ data.id + '.jpg" class=img-thumbnail"></a>';
    html += '<div class="title network-name">' + data.title + '</div></div>';
    
    $(html).hide().appendTo('.search-result').show('slow');
    //$('.search-result').append(html).show('slow');
});

socket.on('notification', function(data){
    console.log("got notification");
    console.dir(data);
    var icon = 'http://localhost:3000/images/profile/' + data[0].user_id.profile_picture;
    var title = data[0].user_id.name;
    var pro = Math.round(data[0].percentage);
    var body = data[0].user_id.name + ' is reading ' + data[0].book_id.title + ' : '+ pro + '%';
    browserNotification(body , icon, title);
});

function browserNotification(theBody, theIcon, data) {
    
    var options = {
        body : theBody,
        icon : theIcon
    }
    // check if browser supports notifications
    if(!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }
    
    // check whether notificatio permission have already been granted
    else if(Notification.permission === "granted") {
        // It then create a notification
        var notification = new Notification(data, options);
    }
    
    // Otherwise, ask for user permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
            if(permission === "granted") {
                var notification = new Notification(data,options);
            }
        });
    }
}