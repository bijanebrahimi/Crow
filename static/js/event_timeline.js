// Crow navbar scroll
(function ($) {
    $(function(){
        var $win = $(window),
        $body = $('body'),
        $nav = $('.navbar'),
        navHeight = $('.navbar').first().height(),
        subnavHeight = $('.navbar').first().height(),
        subnavTop = $('.navbar').length && $('.navbar').offset().top - navHeight,
        marginTop = parseInt($body.css('margin-top'), 10);
        isFixed = 0;

        processScroll();
        $win.on('scroll', processScroll);
        function processScroll() {
            var i, scrollTop = $win.scrollTop();
            if (scrollTop >= subnavTop && !isFixed) {
                isFixed = 1;
                $nav.addClass('subnav-fixed');
                $body.css('margin-top', marginTop + subnavHeight + 'px');
            } else if (scrollTop <= subnavTop && isFixed) {
                isFixed = 0;
                $nav.removeClass('subnav-fixed');
                $body.css('margin-top', marginTop + 'px');
            }
        }
    });
})(window.jQuery);

$(document).ready(function(){
    // on every textarea value change
    $(document).on('input propertychange', 'textarea', function(){
        status = $(this).val()

        // Direction
        if(crow.is_rtl(status)){
            $(this).css('direction', 'rtl').css('textalign', 'right')
            $(this).siblings('.btn-toolbar').find('.btn_status_rtl:first').addClass('active').siblings('.btn_status_ltr').removeClass('active')
        }else{
            $(this).css('direction', 'ltr').css('textalign', 'left')
            $(this).siblings('.btn-toolbar').find('.btn_status_rtl:first').removeClass('active').siblings('.btn_status_ltr').addClass('active')
        }

        // Length
        remaining_length = CROW['max_length'] - status.length
        $(this).siblings('.btn-toolbar').children('.btn-group').children('.btn_status_length').html(status.length)
        if(CROW['max_length']){
            if(status.length>CROW['max_length'])
                $(this).parent().addClass('exceeded')
            else
                $(this).parent().removeClass('exceeded')
        }
    })
    
    // on short url button
    $(document).on('click', '.btn_status_length', function(){
        textarea = $(this).parents('.status_form').children('textarea')
        status = $(textarea).val()
        status = status.replace(/(http:\/\/[^ ]+)/g, crow.get_short_url)
        $(textarea).val(status)
    })

    // navbar tabs
    $('#nav-pages li a').click(function(e){
        e.preventDefault()
        $(this).tab('show')
    })
})
