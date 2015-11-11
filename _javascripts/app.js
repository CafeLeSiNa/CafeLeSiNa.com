document.addEventListener('DOMContentLoaded', function() {
    [].slice.apply(document.querySelectorAll(".menu a")).forEach(function(node) {
        if (node.getAttribute('href') == location.pathname) {
            node.className += " active";
        }
    });
});
