(function ($) {
    $(function(){
        var $win = $(window),
        $body = $('body'),
        $nav = $('.subnav'),
        navHeight = $('.navbar').first().height(),
        subnavHeight = $('.subnav').first().height(),
        subnavTop = $('.subnav').length && $('.subnav').offset().top - navHeight,
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
    // Load Essentials
    get_info()
    
    // Login Page
    $('#login-btn').click(function(){
        button = this
        $(button).button('loading')
        username = $('input[name=username]').val()
        password = $('input[name=password]').val()
        $('.well .alert').fadeOut(200).remove()
        ajax_post(SETTINGS['api']['login'],
                  {'username': username, 'password': password},
                  {'success': function(response){
                        window.location = response.redirect
                   },
                   'error': function(response){
                        $(template_html_alert('error', response['error'])).hide().appendTo('.well').fadeIn(600)
                   },
                   'failed': function(){
                        $(template_html_alert('error', response['error'])).hide().appendTo('.well').fadeIn(600)
                    },
                   'always': function(){
                        $(button).button('reset')
                   },
                  })
    });
    
    // Plugins
    $('#status-plugin-shorturl').click(function(e){
        e.stopPropagation()
        e.preventDefault()
        button = $(this)
        status = $('#status-textarea').val()
        $(button).find('.icon').addClass('icon-loading')
        
        ajax_post(SETTINGS['api']['plugin_short_url'],
                  {'status': status},
                  {'success': function(response){ $('#status-textarea').val(response.status) },
                   'error': function(response){},
                   'failed': function(){},
                   'always': function(){ $(button).find('.icon').removeClass('icon-loading') },
                  })
    })
    $('#status-plugin-bidi').click(function(e){
        e.stopPropagation()
        e.preventDefault()
        button = $(this)
        status = $('#status-textarea').val()
        $(button).find('.icon').addClass('icon-loading')
        
        ajax_post(SETTINGS['api']['plugin_force_url'],
                  {'status': status, 'action': 'force'},
                  {'success': function(response){
                        if(response.rtl && response.status)
                            $('#status-textarea').val(response.status)
                    },
                   'error': function(response){},
                   'failed': function(){},
                   'always': function(){ $(button).find('.icon').removeClass('icon-loading') },
                  })
    })
    $('#status-textarea').keyup(function(e){
        if (e.keyCode == 32) {
            status = $(this).val()
            ajax_post(SETTINGS['api']['plugin_force_url'],
                      {'status': status, 'action': 'check'},
                      {'success': function(response){
                            if(response.rtl)
                                $('#status-textarea').css('direction', 'rtl')
                            else
                                $('#status-textarea').css('direction', 'ltr')
                        },
                       'error': function(response){},
                       'failed': function(){},
                       'always': function(){},
                      })
        }
    });
    
    // Status TexArea
    $('#status-textarea').keyup(function(e){
        if (SETTINGS['status_length_limit'] > 0){
            status = $(this).val();
            $('#status-length-limit').html(SETTINGS['status_length_limit'] - status.length)
        }
    });
    $('#status-textarea').keypress(function(e){
        if (e.keyCode == 13) {
            // $('#status-send-btn').trigger('click')
            return false
        }
    })
    
    // Load The Conversation
    $(document).on('click', '.action .conversation', function(e){
        e.preventDefault()
        var conversation = $(this).parent().parent().parent().parent().attr('data-conversation')
        $('#timeline-navbar .navbar-inner ul li a img.loading').fadeIn(200)
        ajax_post(SETTINGS['api']['conversation'],
                      {'conversation': conversation},
                      {'success': function(response){
                            DEBUG = response
                            html = template_timeline_notices(response.conversation)
                            $('.notice[data-conversation=' + conversation + ']').replaceWith(html)
                        },
                       'error': function(response){
                           console.log(response)
                        },
                       'failed': function(){},
                       'always': function(){
                            $('#timeline-navbar .navbar-inner ul li a img.loading').fadeOut(200)
                        },
                      })
    });
    
    // Notice Action
    $(document).on('mouseenter', '.notice .notice-holder', function(){
        $(this).children('.info').children('.action').removeClass('hide')
    })
    $(document).on('mouseleave', '.notice .notice-holder', function(){
        $(this).children('.info').children('.action').addClass('hide')
    })
    
    // Send Status
    $('#status-send-btn').click(function(){
        // TODO: check for form to be filled first
        button = this;
        $(button).button('loading');
        status = $('textarea#status-textarea').val();
        ajax_post(SETTINGS['api']['update'],
                  {'status': status},
                  {'success': function(response){
                        DEBUG = response
                        html = $('#timeline-content')
                        template_timeline_notices(response.notice, html)
                        $('textarea#status-textarea').val('')
                   },
                   'error': function(response){
                       console.log(response)
                       // $(bs_html_alert('error', response['error'])).insertAfter('.well > legend');
                   },
                   'failed': function(){
                       $(bs_html_alert('error', 'network failed')).insertAfter('.well > legend');
                    },
                   'always': function(){
                       $(button).button('reset');
                   },
                  })
    });
    
    // Notice Action
    $(document).on('click', '.action .reply', function(e){
        e.preventDefault()
        notice = $(this).parent().parent().parent().parent().attr('data-notice')
        reply_form = $(this).parent().parent().parent().children('.notice-form')
        reply_textarea = $(reply_form).children('textarea')
        
        screen_name = $(reply_textarea).attr('data-screenname')
        if($(reply_textarea).attr('data-action') == 'reply' || !$(reply_textarea).is(":visible"))
            $(reply_form).toggle()
        $(reply_textarea).val('@'+screen_name+' ').attr('data-action', 'reply')
        
        DEBUG = $(this)
    })
    $(document).on('click', '.action .repeat', function(e){
        e.preventDefault()
        $('#timeline-navbar .navbar-inner ul li a img.loading').fadeIn(200)
        if (confirm('Are you sure you want to Repeat this notice?')) {
            notice = $(this).parent().parent().parent().parent().attr('data-notice')
            ajax_post(SETTINGS['api']['repeat'],
                      {'notice': notice},
                      {'success': function(response){
                            DEBUG = response
                            html = $('#timeline-content')
                            template_timeline_notices(response.notice, html)
                       },
                       'error': function(response){
                           console.log(response)
                       },
                       'failed': function(){ },
                       'always': function(){
                           $('#timeline-navbar .navbar-inner ul li a img.loading').fadeOut(200)
                       },
                      })
        }
    })
    $(document).on('keyup', '.notice-form textarea', function(){
        if (SETTINGS['status_length_limit'] > 0){
            status = $(this).val();
            $(this).siblings('.btn-group').children('.btn[disabled="disabled"]').html(SETTINGS['status_length_limit'] - status.length)
        }
    })
    $(document).on('keypress', '.notice-form textarea', function(e){
        if (e.keyCode == 13) {
            if($(this).attr('data-action') == 'repeat'){
                
            }else{
                
            }
            // $('#status-send-btn').trigger('click')
            return false
        }
    })
    $(document).on('click', '.notice-form .btn-group .btn', function(e){
        button = this;
        $(button).button('loading');
        textarea = $(button).parent().siblings('textarea')

        action = $(textarea).attr('data-action')
        status = $(textarea).val()
        notice = $(textarea).attr('data-notice')
        ajax_post(SETTINGS['api'][action],
                  {'status': status, 'notice': notice},
                  {'success': function(response){
                        DEBUG = response
                        html = $('#timeline-content')
                        template_timeline_notices(response.notice, html)
                        $(textarea).val('')
                   },
                   'error': function(response){
                       console.log(response)
                       // $(bs_html_alert('error', response['error'])).insertAfter('.well > legend');
                   },
                   'failed': function(){
                       $(bs_html_alert('error', 'network failed')).insertAfter('.well > legend');
                    },
                   'always': function(){
                       $(button).button('reset');
                   },
                  })
    })
    
    $(document).on('click', '#status-streams ul li a', function(e){
        e.preventDefault()
        e.stopPropagation()
        if($(this).hasClass('empty')){
            $('#status-streams ul li.stream-item').remove()
            SETTINGS['stream_count'] = 0
            template_update_stream_count()
        }else{
            if(!$(this).parent().hasClass('clicked')){
                $(this).parent().addClass('clicked')
                SETTINGS['stream_count'] -= 1
                template_update_stream_count()
            }
            element_id = $(this).attr('href')
            element_top = $(element_id).offset().top - 50
            $(document).scrollTop(element_top)
            
            $(element_id).animate({opacity: 0.3}, 500, function(){ $(this).css('opacity', 1) })
        }
    })

    $('a.brand').click(function(e){
        e.preventDefault()
        $('body').animate({scrollTop: 0}, '500', 'swing')
    })
})
