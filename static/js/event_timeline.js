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
    // global vars
    infinite_scroll_timeline = false
    infinite_scroll_replies = false
    
    // on load
    crow.get_user_info()
    crow.get_server_info()
    crow.get_user_timeline(false)
    crow.get_user_replies(false)
    
    // on every textarea value change
    $(document).on('input propertychange', 'textarea', function(e){
        var textarea = $(this)
        var status = $(this).val()

        // Direction
        if(crow.is_rtl(status)){
            $(this).css('direction', 'rtl').css('textalign', 'right')
            $(this).siblings('.btn-toolbar').find('.btn_status_rtl:first').addClass('active').siblings('.btn_status_ltr').removeClass('active')
        }else{
            $(this).css('direction', 'ltr').css('textalign', 'left')
            $(this).siblings('.btn-toolbar').find('.btn_status_rtl:first').removeClass('active').siblings('.btn_status_ltr').addClass('active')
        }

        // Length
        $(this).siblings('.btn-toolbar').children('.btn-group').children('.btn_status_length').html(status.length)
        if(crow.server_info.length_limit>0){
            if(status.length>crow.server_info.length_limit)
                $(this).parent().addClass('exceeded')
            else
                $(this).parent().removeClass('exceeded')
        }
    })
    $(document).on('keypress', 'textarea', function(e){
        // Send
        if (e.keyCode == 13 && !$(this).parents('.status_form').hasClass('exceeded')) {
            var textarea = $(this)
            var status = $(this).val()
            var notice_id = $(textarea).attr('data-notice')
            $(textarea).attr('readonly', 'readonly')
            crow.ajax_post('/notice/send', {'status': status, 'id': notice_id}, {
                'success': function(){
                    crow_template.notices([response.notice], true, false, $('#home .contents'))
                },
                'error': function(){},
                'fail': function(){},
                'always': function(){
                    $(textarea).removeAttr('readonly').val('').trigger('propertychange')
                    if(notice_id>0)
                        $(textarea).parents('.notice_body').children('.notice_form').toggle()
                },
            })
        }
    })
    
    // on short url button
    $(document).on('click', '.btn_status_length', function(){
        var textarea = $(this).parents('.status_form').children('textarea')
        var status = $(textarea).val()
        // var status = status.replace(/(http:\/\/[^ ]+)/g, crow.get_short_url)
        $(textarea).val(crow.shorten_text(status))
    })
    $(document).on('click', '.btn_status_short_url', function(){
        var textarea = $(this).parents('.status_form').children('textarea')
        var status = $(textarea).val()
        var status = status.replace(/(http:\/\/[^ ]+)/g, crow.get_short_url)
        $(textarea).val(status)
    })

    // navbar tabs
    $('#nav-pages li a').click(function(e){
        e.preventDefault()
        $(this).tab('show')
    })

    // Notice's action
    $(document).on('click', '.notice_action .favorite', function(){
        var button = $(this)
        var notice_id = $(button).parents('.notice').attr('id').replace('notice-', '')
        var notice_action = $(button).hasClass('active') ? 'destroy' : 'create'
        $(button).children('i').removeClass('icon-star').addClass('icon-ajax')
        crow.ajax_post('/notice/fav', {'id': notice_id, 'action': notice_action},{
            'success': function(response){
                notice_html = $(crow_template.notice(response.notice))
                $(button).parents('.notice_body').replaceWith($(notice_html).children('.notice_body'))
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                $(button).children('i').addClass('icon-star').removeClass('icon-ajax')
            },
        })
    })
    $(document).on('click', '.notice_action .repeat', function(){
        var button = $(this)
        var notice_id = $(button).parents('.notice').attr('id').replace('notice-', '')
        $(button).children('i').removeClass('icon-refresh').addClass('icon-ajax')
        crow.ajax_post('/notice/repeat', {'id': notice_id},{
            'success': function(response){
                notice_html = $(crow_template.notice(response.notice))
                $('#home').prepend(notice_html)
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                $(button).children('i').addClass('icon-refresh').removeClass('icon-ajax')
            },
        })
    })
    $(document).on('click', '.notice_action .conversation', function(){
        var button = $(this)
        var notice_id = $(button).parents('.notice').attr('id').replace('notice-')
        $(button).children('i').removeClass('icon-eye-open').addClass('icon-ajax')
        crow.ajax_post('/notice/reply', {'id': notice_id},{
            'success': function(response){
                
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                $(button).children('i').addClass('icon-eye-open').removeClass('icon-ajax')
            },
        })
    })
    $(document).on('click', '.notice_action .reply', function(){
        var notice_form = $(this).parents('.notice_body').children('.notice_form')
        var textarea = $(notice_form).children('.status_form').find('textarea')
        var status = $(textarea).val()
        var screen_name = $(textarea).attr('data-screen-name')
        $(notice_form).toggle()
        $(textarea).val('@' + screen_name + ' ')
    })

    // Notice content
    $(document).on('click', 'a.attachment.more', function(e){
        e.preventDefault()
        var button = $(this)
        var notice_content = $(this).parents("span:first")
        var url = $(this).parents('p').siblings('.attachments.text-html:first').attr('href')
        
        button.attr('data-loading-text', 'loading').button('loading')
        crow.ajax_post('/notice/attachment', {'url': url}, {
            'success': function(response){
                $(notice_content).replaceWith(response.content)
            },
            'error': function(response){},
            'failed': function(){},
            'always': function(){
                button.button('reset')
            },
        })
    })

    // Visual effects
    $('a.brand').click(function(e){
        e.preventDefault()
        $('body').animate({scrollTop: 0}, '500', 'swing')
    })

    // Infinite scroll
    // $(window).scroll(function () { 
        // if ($(window).scrollTop() >= $(document).height() - $(window).height() - 500) {
            // var home_page = $('#nav-pages').find('a[href="#home"]').parent().hasClass('active')
            // if(home_page && !infinite_scroll_timeline){
                // infinite_scroll_timeline = true
                // crow.get_user_timeline(true)
            // }else if(!infinite_scroll_replies){
                // infinite_scroll_replies = true
                // crow.get_user_replies(true)
            // }
        // }
    // });
    $('#replies .well button').click(function(){
        $('#replies .well button').button('loading')
        infinite_scroll_replies = true
        crow.get_user_replies(true)
    })
    $('#home .well button').click(function(){
        $('#home .well button').button('loading')
        infinite_scroll_timeline = true
        crow.get_user_timeline(true)
    })
})
