$(function() {
    'use strict';

    // Navigation
    $(".menu a").each(function(_, node) {
        console.log(node);
        var $node = $(node);
        var href = $node.attr('href');

        if (href === void(0)) {
            return;
        }

        if (trim_url(href) == trim_url(location.pathname)) {
            $node.addClass("active");
        }
    });

    // Kanban
    var $kanban = $("#kanban");
    var $kanban_flip = $(".flip-kanban");
    var $kanban_flip_back = $(".flip-back-kanban");

    $kanban.flip({
        trigger: 'manual'
    });
    $kanban.on('flip:done',function(){
        $kanban_flip.popup('hide');
    });

    $kanban_flip.on('click', function(evt) {
        evt.preventDefault();
        $kanban_flip.popup('hide');
        $kanban.flip(true);
    }).popup({on: 'hover', position: 'top right'});

    $kanban_flip_back.on('click', function(evt) {
        evt.preventDefault();
        $kanban.flip(false);
    });

    // Workaround for flip.js
    var introductionHeight = max($('.front .introduction').outerHeight(), $('.back .introduction').outerHeight()) + 21;
    $('.front').height(introductionHeight);
    $('.back').height(introductionHeight);
    $('#kanban').height(introductionHeight);

    function max(a, b) {
        return a > b ? a : b;
    }

    function trim_url(url) {
        return url.replace(/\/$/, "");
    }


    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    // Resize stuff...
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center); 
    });
});
