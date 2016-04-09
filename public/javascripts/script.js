$('img').error(function(){
        console.log('image not found');
        $(this).attr('src', '/images/missing.png');
});