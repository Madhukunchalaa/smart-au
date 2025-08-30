/**********************

Author:  GEORGE_FX
Template: Desart Creative Web Studio HTML Template

***************************/
$(window).on("load", function() {
    "use strict";



    // Tooltip operator
    $('[data-toggle="tooltip"]').tooltip();

    // Button Search

     $('.btn-search').on("click", function(){
        $('.btn-search, .search-bar').toggleClass('active');
        $('.form-search').focus();
      });

    // PRELOADER 

    $("#preloader").fadeOut();

    // Projects Carousel
    $('.projects-carousel').owlCarousel({
        loop: true,
        margin: 20,
        nav: true,
        dots: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            }
        }
    });

});

