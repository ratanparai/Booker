
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
    } else {
        
        var progressPercentage = Math.round(data.percentage);
        
        var description = data.book_id.description;
        description = description.replace(/<br>/g, '');
        
        var html = '<div class="panel panel-default"><div class="panel-body"><div data-book-id="'+ data.book_id._id +'" data-user-id="'+ data.user_id._id +'" data-progress-id="'+ data._id +'" class="row progress-book"><div class="col-md-2"><img src="/images/books/'+ data.book_id._id +'.jpg" class="thumbnail"></div><div class="col-md-10"><div class="row progress-book-title"> <h3><a href="/book/'+ data.book_id._id +'">'+ data.book_id.title +'</a></h3></div><div class="row progress-book-author"> <h5><a href="/author/'+ data.book_id.author_id +'">'+ data.book_id.author_name +'</a></h5></div><div class="row progress-book-progress"> <div class="progress"><div role="progressbar" aria-valuenow="'+ progressPercentage +'" aria-valuemin="0" aria-valuemax="100" style="width:'+ progressPercentage +'%" class="progress-bar">'+ progressPercentage+'%</div></div></div><div class="row progress-book-description"><p>'+ description +'</p></div><div class="row progress-book-show-more"><a href="/book/'+ data.book_id._id +'">More</a></div></div></div></div></div>';
        
        //console.log("prepending value..");
        
        // $('.profile-progress-outer').prepend();
        $(html).hide().prependTo('.profile-progress-outer').show('slow');
    }
    
})