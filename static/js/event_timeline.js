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

$(document).ready(function(){
    // on load
    // crow.get_user_info()
    // crow.get_server_info()
    // crow.bind_shortcuts()
    crow.version_check()
    
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
    $(document).on('keypress', '#status-textarea', function(e){
        if(e.keyCode == 13 && !e.shiftKey){
            if ($('.typeahead').css('display') != 'block' && !$(this).parents('.status_form').hasClass('exceeded')) {
                crow.send_status()
            }
            return false
        }
    })
    $(document).on('click', '.btn_status_send', function(){
        if (!$('#status-textarea').parents('.status_form').hasClass('exceeded')) {
            crow.send_status()
        }
    })
    $(document).on('click', '.btn_status_reply', function(){
        $('#status-form').attr('data-notice', '').find('textarea').focus().val('').trigger('propertychange')
        $(this).remove()
    })
    
    // on short url button
    $(document).on('click', '.btn_status_squeeze', function(){
        var textarea = $(this).parents('.status_form').find('textarea')
        var status = $(textarea).val()
        $(textarea).focus().val('').val(crow.shorten_text(status)).trigger('propertychange')
    })
    $(document).on('click', '.btn_status_short_url', function(){
        var textarea = $(this).parents('.status_form').find('textarea')
        var status = $(textarea).val()
        var status = status.replace(/(https?:\/\/[^ ]+)/g, crow.get_short_url)
        $(textarea).val(status).trigger('propertychange')
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
        if($(button).hasClass('conversation_reply')){
            var notice_id = '#notice-'+($(button).parents('.notice').attr('id').replace(/[^0-9]+/, ''))
            // var notice = $(notice_id)
            if($(notice_id).length){
                $('#link-home').trigger('click')
                $(document).scrollTop($(notice_id).offset().top-50)
                return null
            }
        }
        var conversation_id = $(button).parents('.notice').attr('data-conversation')
        var conversation_container = $(button).parents('.notice')
        $(button).children('i').removeClass('icon-comment').addClass('icon-ajax')
        crow.ajax_post('/notice/conversation', {'conversation_id': conversation_id},{
            'success': function(response){
                if($(button).hasClass('conversation_reply')){
                    container = $('#home .contents')
                    var html = crow_template.notices(response.notices, true, false, $(container), false)
                    $('#link-home').trigger('click')
                    $(document).scrollTop($(notice_id).offset().top-50)
                }else{
                    container = $('<div></div>')
                    var html = crow_template.notices(response.notices, true, false, $(container), false)
                    $(conversation_container).replaceWith($(html).html())
                }
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                $(button).children('i').addClass('icon-comment').removeClass('icon-ajax')
            },
        })
    })
    $(document).on('click', '.notice_action .reply', function(){
        var notice = $(this).parents('.notice')
        var notice_id = $(notice).attr('id').replace(/[^0-9]+/, '')
        var notice_user = $(notice).attr('data-screenname')
        $('#status-form').attr('data-notice', notice_id).show()
        
        var textarea = $('#status-form').find('textarea')
        $(textarea).focus().val('').val('@' + notice_user +' ').trigger('propertychange')
        $('#status-recipient').html('<button class="btn btn-small btn_status_reply active" title="remove recipient">@' + notice_user + '</button>')
    })

    // Notice content
    $(document).on('click', 'a.attachment.more', function(e){
        e.preventDefault()
        var button = $(this)
        var notice_content = $(this).parents("span:first")
        var url = $(this).parents('p').siblings('.attachments.text-html:first').attr('href')
        var type = 'attachment'
        if(!url){
            url = $(this).attr('href')
            type = 'link'
        }
        
        button.attr('data-loading-text', 'loading').button('loading')
        crow.ajax_post('/notice/attachment', {'url': url, 'type': type}, {
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

    $('#replies .pager button').click(function(){
        $('#replies .pager button').button('loading')
        crow.get_user_replies(true)
    })
    $('#home .pager button').click(function(){
        $('#home .pager button').button('loading')
        crow.get_user_timeline(true)
    })

    // Stream
    $(document).on('click', '#stream li a', function(e){
        e.preventDefault()
        if(!$(this).hasClass('empty')){
            e.stopPropagation()
        }
        if(!$('#link-home').parent().hasClass('active')){
            $('#link-home').trigger('click')
        }
        crow.stream_remove($(this))
    })
    $(document).on('mouseenter', '.notice .notice_body', function(){
        var notice_id = $(this).parent().attr('id').replace(/[^0-9]+/, '')
        var stream_item = $('.stream-item a[href="#notice-' + notice_id + '"]')
        if(stream_item.length)
            crow.stream_remove(stream_item, true)
    })
    
    // Links
    $(document).on('click', 'a', function(e){
        e.preventDefault()
        if( (!$(this).hasClass('app-link') && (!$(this).hasClass('attachment') || !$(this).hasClass('more'))) ||
            ($(this).hasClass('app-link') && $(this).hasClass('attachments')) ||
            ($(this).hasClass('app-link') && $(this).attr('target')=='_blank')
        ){
            var href = $(this).attr('href')
            window.open(href, '_blank')
        }
    })
})
