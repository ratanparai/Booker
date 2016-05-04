$('.rate-book').rating(function(vote, event){
    console.log('you vote ' + vote);
    
    var book_id = $('#book_id').val();
    
    console.log('Book id ' + book_id);
    
    $.post('rate', {rating : vote, book_id : book_id})
        .done(function(data) {
            console.log(data); 
        });
});