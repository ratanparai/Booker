/**
 * Network activity feed update 
 * =============================================================
 */
socket.on("dashboard network read", function(data){
    appendToNetwork('read', data.user_id.username, data.user_id.name, data.user_id.profile_picture, data.book_id._id, data.book_id.title, data.date);
});

socket.on('dashboard network review', function(data){
    appendToNetwork('review', data.user_id.username, data.user_id.name, data.user_id.profile_picture, data.book_id._id, data.book_id.title, data.update_on);

});

socket.on('dashboard reading new book', function(data) {
    
    appendToNetwork('start reading', data.user_id.username, data.user_id.name, data.user_id.profile_picture, data.book_id._id, data.book_id.title, data.last_update);
});

// for User's own activity feed
// ===============================================================
socket.on('dashboard own read', function(data){
    appendToActivity('read', data.user_id.username, data.user_id.name, data.user_id.profile_picture, data.book_id._id, data.book_id.title, data.date);
});

socket.on('dashboard own new book', function(data) {
    appendToActivity('start reading', data.user_id.username, data.user_id.name, data.user_id.profile_picture, data.book_id._id, data.book_id.title, data.last_update);
});

socket.on('dashboard activity review', function(data) {
    appendToActivity('review', data.user_id.username, data.user_id.name, data.user_id.profile_picture, data.book_id._id, data.book_id.title, data.update_on);
});



function appendToNetwork(type, username, name, profile_picture, book_id, title, date) {
    var numberOfNetworkBook = $('.network-activity > .col-md-4').length;
   
    var thisBook = numberOfNetworkBook + 1 ;


    var html = '<div class="col-md-4 network-history-'+ thisBook +'"><div class="panel panel-default"><div class="panel-dashboard-image panel-heading"><a href="/book/' + book_id +'"><img src="/images/books/'+ book_id +'.jpg" class="thumbnail"></a><div class="poster-under"><a href="/users/view/'+ username +'"><img src="/images/profile/'+ profile_picture +'" class="dashboard-profile-small img-circle"></a></div></div><div class="panel-body dashboard-activity-details"> <a href="/users/view/'+ username +'">'+ name +'</a> '+ type +' <a href="/book/'+ book_id +'">'+ title +'</a><div class="activity-date">'+date+'</div></div></div></div>';
    console.log("Prepending data");

    $('.network-activity > .clearfix').remove();

    $(html).hide().prependTo('.network-activity').show('slow');

    var numberOfNetworkBook = $('.network-activity > .col-md-4').length;
    console.log(numberOfNetworkBook);

    while((numberOfNetworkBook - 3) > 0 ) {
        var nowNumber = numberOfNetworkBook - 3;
        
        $('.network-history-'+nowNumber).before('<div visible-xs-block="" class="clearfix"></div>');
        
        numberOfNetworkBook = numberOfNetworkBook - 3;
    }
}

function appendToActivity(type, username, name, profile_picture, book_id, title, date) {
    var numberOfNetworkBook = $('.left-activity > .col-md-4').length;
   
    var thisBook = numberOfNetworkBook + 1 ;


    var html = '<div class="col-md-4 activity-history-'+ thisBook +'"><div class="panel panel-default"><div class="panel-dashboard-image panel-heading"><a href="/book/' + book_id +'"><img src="/images/books/'+ book_id +'.jpg" class="thumbnail"></a><div class="poster-under"><a href="/users/view/'+ username +'"><img src="/images/profile/'+ profile_picture +'" class="dashboard-profile-small img-circle"></a></div></div><div class="panel-body dashboard-activity-details"> <a href="/users/view/'+ username +'">'+ name +'</a> '+ type +' <a href="/book/'+ book_id +'">'+ title +'</a><div class="activity-date">'+date+'</div></div></div></div>';
    console.log("Prepending data");
    
    var activityHtml = '<div class="col-md-4 activity-history-'+ thisBook +'"><div class="panel panel-default"><div class="panel-dashboard-image panel-heading"><a href="/book/'+ book_id +'"><img src="/images/books/'+ book_id +'.jpg" class="thumbnail"></a></div><div class="panel-body dashboard-activity-details">You '+ type +' <a href="/book/'+ book_id +'">'+ title +'</a><div class="activity-date">'+ date +'</div></div></div></div>';

    $('.left-activity > .clearfix').remove();

    $(activityHtml).hide().prependTo('.left-activity').show('slow');

    var numberOfNetworkBook = $('.left-activity > .col-md-4').length;
    console.log(numberOfNetworkBook);

    while((numberOfNetworkBook - 3) > 0 ) {
        var nowNumber = numberOfNetworkBook - 3;
        
        $('.activity-history-'+nowNumber).before('<div visible-xs-block="" class="clearfix"></div>');
        
        numberOfNetworkBook = numberOfNetworkBook - 3;
    }
}