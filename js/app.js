var WebFont = require('webfontloader');
WebFont.load({
    custom: {
        families: ['Noto Sans Japanese'],
        urls: ['//fonts.googleapis.com/earlyaccess/notosansjapanese.css'],
        timeout: 10000
    }
});

window.jQuery = require('jquery');
window.$ = window.jQuery;

require('flip/dist/jquery.flip.js');
require('simplelightbox');

require('semantic-ui');

var attachFastClick = require('fastclick');

$(function() {
    'use strict';

    require('browsernizr/test/css/transforms3d');
    require('browsernizr');

    $('.gallery a').simpleLightbox({});

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

    $('.ui.embed').embed();
});
