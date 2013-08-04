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
            ltr_regex = new RegExp('^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF'+'\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF]'),
            rtl_char_count = 0,
            ltr_char_count = 0;
        for(i=text.length-1; i>=0; i--){
            if(rtl_regex.test(text[i]))
                rtl_char_count += 1
            else if(ltr_regex.test(text[i]))
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
        text = text.trim()
        text = text.replace(/ {2,}/g, ' ')          // removes extra spaces
        text = text.replace(/\.{2,}/g, '…')         // &#x2026;
        text = text.replace(/\?{2,}/g, '⁇')         // &#x2047;
        text = text.replace(/\?+\!+/g, '⁈')         // &#x2048;
        text = text.replace(/\!+\?+/g, '⁉')         // &#x2049;
        text = text.replace(/\!+/g, '!')            // removes duplicated exclamation marks
        text = text.replace(/\?+/g, '?')            // removes duplicated question marks
        text = text.replace(/https?\:\/\//g, '')    // removes http:// https://
        text = text.replace(/ +([\.\)\]])/g, '$1')  // 
        text = text.replace(/([\(\[]) +/g, '$1')  // 
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
    
    plugin_mention: function(element){
        $(element).mention({
            delimiter: '@',
            emptyQuery: true,
            sensitive : true,
            queryBy: ['username'],
            typeaheadOpts: {
                items: 10 // Max number of items you want to show
            },
            users: crow.user_info.friends
        });
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

    sort_notices: function(notice_a, notice_b){
        notice_a_id = parseInt($(notice_a).attr('id').replace(/[^0-9]+/, ''))
        notice_b_id = parseInt($(notice_b).attr('id').replace(/[^0-9]+/, ''))
        
        return notice_a_id - notice_b_id
    },
    friend_by_username: function(friend_username){
        return $.grep(crow.user_info.friends, function(e){ return e.username == friend_username; })
    },
    friend_add: function (user){
        if(!crow.friend_by_username(user.screen_name)){
            crow.user_info.friends.push({'username': user.screen_name, 'name': user.name, 'image': user.profile_image_url})
        }
    },

    stream_update: function(notice){
        streams_count = $('#stream li').length - 2
        $('#notice-streams > a').html('<b class="icon icon-comment"></b> ' + streams_count + '')
    },
    stream_add: function(notices, prepend){
        if(notices.length>0){
            for (var i=notices.length-1; i>=0 ; i--){
                if(notices[i].user.id==crow.user_info.id){
                    // Skip self posted dents in stream
                    continue
                }
                stream_html = crow_template.stream(notices[i])
                if(prepend)
                    $(stream_html).insertAfter('#stream .divider')
                else
                    $(stream_html).appendTo('#stream')
            }
            crow.stream_update()
        }
    },
    stream_remove: function(stream_element, stay){
        if($(stream_element).hasClass('empty')){
            $('#stream li.stream-item').remove()
            crow.stream_update()
        }else{
            if(!stay){
                var element_id = $(stream_element).attr('href')
                var element_top = $(element_id).offset().top - 50
                $(document).scrollTop(element_top)
                
                $(element_id).children('.notice_body').animate({opacity: 0.3}, 500, function(){
                    $(this).css('opacity', 1)
                })
            }
            $(stream_element).parent().remove()
            crow.stream_update()
        }
    },
    

    get_user_timeline: function(previous_page, fresh_results){
        $('#loading').show()
        var previous_page = previous_page ? true : false
        crow.ajax_get('/user/timeline', {'previous_page': previous_page, 'fresh_results': fresh_results}, {
            'success': function(response){
                crow.user_replies = response.notices
                if(response.previous_page){
                    var html = crow_template.notices(crow.user_replies, true, false, $('#home .contents'), false)
                    infinite_scroll_timeline = false
                    
                    crow.stream_add(crow.user_replies, false)
                }else{
                    // crow_template.streams(crow.user_replies)
                    crow.stream_add(crow.user_replies, true)
                    
                    var html = crow_template.notices(crow.user_replies, true, true, $('#home .contents'), false)
                    $($(html).children('div')).prependTo('#home .contents')
                    setTimeout(crow.get_user_timeline, 20000)
                }
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                if(previous_page)
                    $('#home .pager button').button('reset')
                else{
                    $('#loading').hide()
                    $('#home .pager button').show()
                }
            },
        })
    },
    get_user_replies: function(previous_page, fresh_results){
        $('#loading').show()
        var previous_page = previous_page ? true : false
        crow.ajax_get('/user/replies', {'previous_page': previous_page, 'fresh_results': fresh_results}, {
            'success': function(response){
                crow.user_replies = response.notices
                if(response.previous_page){
                    var html = crow_template.notices(crow.user_replies, false, false, $('#replies .contents'), true)
                    infinite_scroll_replies = false
                }else{
                    var html = crow_template.notices(crow.user_replies, false, true, $('#replies .contents'), true)
                    $($(html).children('div')).prependTo('#replies .contents')
                    setTimeout(crow.get_user_replies, 20000)
                }
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){
                if(previous_page)
                    $('#replies .pager button').button('reset')
                else{    
                    $('#replies .pager button').show()
                    $('#loading').hide()
                }
            },
        })
    },
    get_user_info: function(){
        crow.ajax_get('/user/info', {}, {
            'success': function(response){
                crow.user_info = response.user
                $('#avatar').attr('src', crow.user_info.profile_image_url)
                $('#avatar').parent().attr('title', crow.escape_quotes(crow.user_info.description))
                crow.plugin_mention($('textarea'))
                
                crow.get_user_timeline(false, true)
                crow.get_user_replies(false, true)
            },
            'error': function(response){},
            'fail': function(){},
            'always': function(){},
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


