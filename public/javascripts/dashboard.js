socket.on("dashboard network read", function(data){
   var numberOfNetworkBook = $('.network-activity > .col-md-4').length;
   
   var thisBook = numberOfNetworkBook + 1 ;
   
   console.log(data);
   
   var html = '<div class="col-md-4 network-history-'+ thisBook +'"><div class="panel panel-default"><div class="panel-dashboard-image panel-heading"><a href="/book/' + data.book_id._id +'"><img src="/images/books/'+ data.book_id._id +'.jpg" class="thumbnail"></a><div class="poster-under"><a href="/users/view/'+ data.user_id.username +'"><img src="/images/profile/'+ data.user_id.profile_picture +'" class="dashboard-profile-small img-circle"></a></div></div><div class="panel-body dashboard-activity-details"> <a href="/users/view/'+ data.user_id.username +'">'+ data.user_id.name +'</a> read <a href="/book/'+ data.book_id._id +'">'+ data.book_id.title +'</a><div class="activity-date">'+data.date+'</div></div></div></div>';
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
   
   
//    var i = 2;
   
//    while( i < numberOfNetworkBook) {
//        // after third div inset a clearfix div class 
//        // $('.network-activity > .col-md-4').eq(i).append('<div visible-xs-block="" class="clearfix"></div>');
       
//        $('<div visible-xs-block="" class="clearfix"></div>').insertAfter('.network-activity > .col-md-4').eq(i);
       
//        i = i + 3;
//    }
   
});