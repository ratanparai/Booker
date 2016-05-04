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



// SOCKET.IO 
var socket = io.connect('http://localhost:8056');

socket.on('refresh profile page', function(data){
    console.log("refresh profile page");
    console.dir(data);
    // load image
    $('.profile-main-image').src = data.url ;
    $('.profile-setting-image').src = data.url;
    console.log("page refresh initiated");
    //location.reload();
});

// search book 

socket.on('new book in search', function(data){
    // add new book to the search result page.
    console.log(data);
    
    var numberOfBooks = $('div.search-result div.col-md-2').length;
    
    if (numberOfBooks % 6 == 0 ) {
        html = '<div class="clearfix" visible-xs-block></div>';
    } else {
        html = '';
    }
    
    html += '<div class="col-md-2" style="display: none;"><a href="/book/' + data.id + '">';
    html += '<img src="/images/books/'+ data.id + '.jpg" class="img-thumbnail"></a>';
    html += '<div class="title network-name">' + data.title + '</div></div>';
    
    $(html).hide().appendTo('.search-result').show('slow');
    //$('.search-result').append(html).show('slow');
});

socket.on('notification', function(data){
    console.log("got notification");
    console.dir(data);
    var icon = 'http://localhost:3000/images/profile/' + data.user_id.profile_picture;
    var title = data.user_id.name;
    var pro = Math.round(data.percentage);
    var body = data.user_id.name + ' start reading ' + data.book_id.title + ' : '+ pro + '%';
    browserNotification(body , icon, title);
});

socket.on('read notification', function(data){
    var icon = 'http://localhost:3000/images/profile/' + data.user_id.profile_picture;
    var title = data.user_id.name;
    var body = data.user_id.name + ' read ' + data.book_id.title;
    
    browserNotification(body, icon, title);
});

socket.on('review notification', function(data) {
    var icon = 'http://localhost:3000/images/profile/' + data.user_id.profile_picture;
    var title = data.user_id.name;
    var body = data.user_id.name + ' write a comment on ' + data.book_id.title;
    
    browserNotification(body, icon, title);
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