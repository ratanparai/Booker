
var userid = $('#user_id').val();

var needToEmit = {
    channel : 'profile.progress.'+userid
}

socket.emit('subscribe me', needToEmit);

socket.on('profile progress update', function(data) {
    console.log(data);
    
    var outerDiv = $('div[data-progress-id="'+ data._id +'"]');
    console.log(outerDiv.length);
    if (outerDiv.length === 1) {
        // update progress 
        var progressBar = $('div[data-progress-id="'+ data._id +'"]  div.progress-bar');
              
        var progressPercentage = Math.round(data.percentage);

        progressBar.attr('style', 'width:'+ progressPercentage +'%');
        progressBar.text(progressPercentage + '%');
    }
    
})