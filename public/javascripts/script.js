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
    
    // load image
    $('.img-circle').src(data.url);
    console.log("page refresh initiated");
    //location.reload();
});