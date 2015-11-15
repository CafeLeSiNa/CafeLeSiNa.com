var attachFastClick = require('fastclick');

$(function() {
    'use strict';

    attachFastClick(document.body);

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

    var flipable = $('html.csstransforms3d').size() >= 1;

    if (flipable) {
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
    } else {
        var $front = $kanban.find('.front');
        var $back = $kanban.find('.back');

        $back.css({display: "none"});

        $kanban_flip.on('click', function(evt) {
            evt.preventDefault();
            $front.css({display: "none"});
            $back.css({display: "block"});
        });

        $kanban_flip_back.on('click', function(evt) {
            evt.preventDefault();
            $back.css({display: "none"});
            $front.css({display: "block"});
        });
    }

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

    $('.gallery').nanoGallery({
        theme: 'light',
        colorScheme: 'none',
        thumbnailWidth: 'auto',
        thumbnailHeight: 100,
        itemsBaseURL: '/img',
        thumbnailHoverEffect: [{ name: 'labelAppear75', duration: 300 }],
        i18n: { thumbnailImageDescription: '拡大する', thumbnailAlbumDescription: 'Open Album' },
        thumbnailLabel: { display: true, position: 'overImageOnMiddle', align: 'center' }
    });

    $('.ui.embed').embed();
});
