var pcwidth;

function toggleshow(id){
    $(".toggleshow").hide();
    
    $(id).fadeIn();
}

$(document).ready(function() {
    
    $('body').dblclick(function(e){
        console.log($(e.target));
        $('#setting').fadeIn();
    });
    $('#setting').dblclick(function(){
        $('#setting').fadeOut();
    });
    
    
    $(".toggleshow[id!=home]").hide();
    
   
    
    
    pcwidth = $('#playerControls').width() + 40;
        console.log(pcwidth);

    if ( !! $('#playerControls').offset()) { // make sure ".sticky" element exists

        

        var stickyTop = $('#playerControls').offset().top; // returns number 

        $(window).scroll(function() { // scroll event

            var windowTop = $(window).scrollTop(); // returns number 

            if (stickyTop < windowTop) {
                $('#playerControls').css({
                    position: 'fixed',
                    top: 0,
                    'margin-left':(-1*pcwidth/2)+20,
                    'z-index':999
                });
            }
            else {
                $('#playerControls').css({
                    'position': 'static',
                    'margin-left':0
                });
            }

        });

    }


   /* $('#playerControls').affix({
        offset: {
            top: 0
        }
    });*/
    
    
    
    
});
