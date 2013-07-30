crow = {
    escape_quotes: function(text){
        if(text){
            text = text.replace(/"/g, '❞')
            text = text.replace(/'/g, '❜')
            return text
        }
        return ''
    },
    is_rtl: function(text){
        // modified version of http://stackoverflow.com/a/14824756
        if(!text)
            return false
        var rtl_regex = new RegExp('^[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]'),
            rtl_char_count = 0,
            ltr_char_count = 0;
        for(i=text.length-1; i>=0; i--){
            if(rtl_regex.test(text[i]))
                rtl_char_count += 1
            else
                ltr_char_count += 1
        }
        return (rtl_char_count>ltr_char_count)
    },
    get_short_url: function(long_url, callable_error){
        if(long_url.length<22)
            return long_url
        var short_url = long_url
        jQuery.ajax({
            url: "http://api.bitly.com/v3/shorten?callback=?&format=json&apiKey=R_dd2d4938df1b6e367fa42686912f75be&login=crowurls&longUrl=" + long_url,
            type: 'GET',
            dataType: 'html',
            async: false,
            cache: false,
            timeout: 5000,
            error: function(){
                if(callable_error)
                    callable_error()
            },
            success: function(response){
                response = response.replace(/^\?/, '')
                data = eval('(' + response + ')')
                if(data.status_code==200){
                    console.log(data)
                    short_url = data.data.url
                    return data.data.url
                }else if(callable_error){
                    callable_error()
                }
            }
        });
        return short_url
    },
    shorten_text: function(text){
        text = text.replace(/http:\/\//g, '')
        return text
    },
    shorten_html_link: function(html){
        function _replace(link){
            if(link.length>40)
                return link.substring(0, 20)+'...'+link.substring(link.length-18, link.length)
            return link
        }
        var new_html = html.replace(/>([^<]*)<\/a>/g, '>short<\a>')
        return 
    },
    
    ajax_post: function(url, data, callbacks){
        data['is_ajax'] = true
        var jqxhr = $.post(url, data, function(text_response){
            response = eval('(' + text_response + ')')
            if(response.success == true){
                if (callbacks['success'])
                    callbacks['success'](response);
                else
                    alert(response.success);
            }else{
                if (callbacks['error'])
                    callbacks['error'](response);
                else
                    alert(response.success);
            }
        }).always(function(){
            if (callbacks['always'])
                callbacks['always']();
        }).fail(function(){
            if (callbacks['failed'])
                callbacks['failed']();
        });
    },
    ajax_get: function(url, data, callbacks){
        jQuery.ajax({
                url: url,
                data: data,
                type: 'GET',
                dataType: 'json',
                async: true,
                cache: false,
                success: function(response){
                    if(response.success == true){
                        if (callbacks['success'])
                            callbacks['success'](response);
                    }else{
                        if (callbacks['error'])
                            callbacks['error'](response);
                    }
                },
                error: function(){
                    if(callbacks['fail'])
                        callbacks['fail']()
                },
                complete: function(){
                    if (callbacks['always'])
                        callbacks['always']();
                }
        })
    },

    get_user_info: function(){
        crow.ajax_get('/user/info', {}, {
            'success': function(response){
                var user = response.user
                $('#avatar').attr('src', user.profile_image_url)
                $('#avatar').parent().attr('title', crow.escape_quotes(user.description))
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){},
        })
    },
    get_user_timeline: function(previous_page){
        $('#loading').show()
        var previous_page = previous_page ? true : false
        crow.ajax_get('/user/timeline', {'previous_page': previous_page}, {
            'success': function(response){
                crow.user_notices = response.notices
                html=crow_template.notices(crow.user_notices)
                console.log(response)
                if(response.previous_page){
                    console.log('old')
                    $($(html).children('div')).appendTo('#home')
                    intinite_scroll = false
                    // setTimeout(crow.get_user_timeline(true), 20000)
                }else{
                    console.log('new')
                    $($(html).children('div')).prependTo('#home')
                    setTimeout(crow.get_user_timeline, 20000)
                }
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                $('#loading').hide()
                // if(!fetch_olds)
                    // setTimeout('crow.get_user_timeline(fetch_olds)', 20000)
            },
        })
    },
    
    get_server_info: function(){
        crow.ajax_get('/server/info', {}, {
            'success': function(response){
                crow.server_info = response.server
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){},
        })
    },
    
    
    server_info: {'length_limit': 0},
    user_info: {},
    user_notices: [],
}


