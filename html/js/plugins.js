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

});

