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