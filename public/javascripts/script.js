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