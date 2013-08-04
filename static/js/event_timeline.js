// This file is part of Crow.
// Copyright (C) 2013 Bijan Ebrahimi <bijanebrahimi@lavabit.com>
// 
// Crow is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Crow is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Crow.  If not, see <http://www.gnu.org/licenses/>.

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
    
    // on every textarea value change
    $(document).on('input propertychange', 'textarea', function(e){
        var textarea = $(this)
        var status = $(this).val()

        // Direction
        if(crow.is_rtl(status)){
            $(this).css('direction', 'rtl').css('textalign', 'right')
            $(this).parents('.status_form').find('.btn_status_rtl:first').addClass('active').siblings('.btn_status_ltr').removeClass('active')
        }else{
            $(this).css('direction', 'ltr').css('textalign', 'left')
            $(this).parents('.status_form').find('.btn_status_rtl:first').removeClass('active').siblings('.btn_status_ltr').addClass('active')
        }

        // Length
        $(this).parents('.status_form').children('.btn-toolbar').children('.btn-group').children('.btn_status_length').html(status.length)
        if(crow.server_info.length_limit>0){
            if(status.length>crow.server_info.length_limit)
                $(this).parents('.status_form').addClass('exceeded')
            else
                $(this).parents('.status_form').removeClass('exceeded')
        }
    })
    $(document).on('keypress', 'textarea', function(e){
        // Send
        var textarea = $(this)
        var status = $(this).val()
        if (e.keyCode == 13 && !$(this).parents('.status_form').hasClass('exceeded')) {
            if(status.length==0)
                return false
            var notice_id = $(textarea).attr('data-notice')
            $(textarea).attr('readonly', 'readonly').parents('.status_form').find('.btn_status_length').button('loading')
            crow.ajax_post('/notice/send', {'status': status, 'id': notice_id}, {
                'success': function(){
                    crow_template.notices([response.notice], true, true, $('#home .contents'))
                },
                'error': function(){},
                'fail': function(){},
                'always': function(){
                    $(textarea).removeAttr('readonly').val('').trigger('propertychange').parents('.status_form').find('.btn_status_length').button('reset')
                    if(notice_id>0)
                        $(textarea).parents('.notice_body').children('.notice_form').toggle()
                },
            })
        }
    })
    
    // on short url button
    $(document).on('click', '.btn_status_length', function(){
        var textarea = $(this).parents('.status_form').find('textarea')
        var status = $(textarea).val()
        $(textarea).val(crow.shorten_text(status)).trigger('propertychange')
    })
    $(document).on('click', '.btn_status_short_url', function(){
        var textarea = $(this).parents('.status_form').find('textarea')
        var status = $(textarea).val()
        var status = status.replace(/(https?:\/\/[^ ]+)/g, crow.get_short_url)
        $(textarea).val(status).trigger('propertychange')
    })
    $(document).on('click', '.btn_status_upload', function(){
        alert('sorry, not implemented yet')
    })

    // navbar tabs
    $('#nav-pages li a').click(function(e){
        e.preventDefault()
        $(this).tab('show')
    })

    // Notice's action
    $(document).on('click', '.notice_action .favorite', function(){
        var button = $(this)
        var notice_id = $(button).parents('.notice').attr('id').replace(/[^0-9]+/, '')
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
        var notice_id = $(button).parents('.notice').attr('id').replace(/[^0-9]+/, '')
        $(button).children('i').removeClass('icon-refresh').addClass('icon-ajax')
        crow.ajax_post('/notice/repeat', {'id': notice_id},{
            'success': function(response){
                crow_template.notices([response.notice], true, true, $('#home .contents'))
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
        var notice_id = $(button).parents('.notice').attr('id').replace(/[^0-9]+/, '')
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
        if(status.length==0)
            status = '@' + screen_name + ' '
        $(textarea).focus().val('').val(status)
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

    $('#replies .pager button').click(function(){
        $('#replies .pager button').button('loading')
        infinite_scroll_replies = true
        crow.get_user_replies(true)
    })
    $('#home .pager button').click(function(){
        $('#home .pager button').button('loading')
        infinite_scroll_timeline = true
        crow.get_user_timeline(true)
    })

    // Stream
    $(document).on('click', '#stream li a', function(e){
        e.preventDefault()
        if(!$(this).hasClass('empty')){
            e.stopPropagation()
        }
        crow.stream_remove($(this))
    })
    $(document).on('mouseenter', '.notice .notice_body', function(){
        var notice_id = $(this).parent().attr('id').replace(/[^0-9]+/, '')
        var stream_item = $('.stream-item a[href="#notice-' + notice_id + '"]')
        if(stream_item.length)
            crow.stream_remove(stream_item, true)
    })
})
