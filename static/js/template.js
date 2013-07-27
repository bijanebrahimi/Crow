function _jquery_plugin_attach(html){
    if(!html)
        html = $('body')
    $(html).find('textarea').each(function(){
        if(!$(this).attr('data-mentions-input'))
            $(this).mentionsInput({
                onDataRequest:function (mode, query, callback) {
                    var data = SETTINGS['info']['user']['friends_list']
                    data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
                    callback.call(this, data);
                }
            });
    })
    $(html).find('.notice .notice-holder .content p > img.avatar').each(function(){
        $(this).popover({trigger:'click', html: true, placement: 'right', delay: 0, content: function(element){ return template_popover_user(this) }})
    })
}

function template_html_alert(type, text){
    return '<div class="alert alert-' + type + '"><a class="app-link close" data-dismiss="alert" href="#">x</a>' + text + '</div>'
}

function template_popover_user(element){
    console.log(element)
    description = $(element).attr('data-statusnet-description')
    url = $(element).attr('data-statusnet-url')
    avatar = $(element).attr('src')
    following = $(element).attr('data-statusnet-following')
    name = $(element).attr('data-statusnet-name')
    profile_url = $(element).attr('data-statusnet-profile-url')
    screen_name = $(element).attr('data-statusnet-screen-name')
    
    if(following=='true'){
        friendship = '<button class="btn btn-mini btn-danger">unfollow</button>'
    }else{
        friendship = '<button class="btn btn-mini btn-success">follow</button>'
    }
    
    return '<p style="direction:ltr;">\
                <a href="' + profile_url + '">' + screen_name + '</a>: \
                "<em>' + description + '</em>"\
            </p>\
            <span style="display:block">' + friendship + '</span>'
}

function _notice_time(notice){
    absolute_time = notice.created_at
    timestamp = Date.parse(notice.created_at) / 1000
    relative_time = notice.created_at
    return '<span data-livestamp="' + timestamp + '">' + relative_time + '</span>'
    // return '<abbr class="timeago" datetime="' + absolute_time + '">' + relative_time + '</abbr>'
}
function _notice_data_attributes(notice, unique_conversation){
    data_attributes = ''
    if (unique_conversation)
        data_attributes = 'data-conversation=' + notice.statusnet_conversation_id
    // if(!in_conversation)
    // data_attributes = 'data-conversation=' + notice.statusnet_conversation_id
    data_attributes += ' data-notice=' + notice.id
    return data_attributes
}
function _notice_replies_holder(unique_conversation){
    if (unique_conversation){
        return '<div class="replies-holder"></div>'
    }
    return ''
}
function _notice_source(source){
    return 'from ' + source
}
function _notice_context(notice){
    // TODO: remove this function
    return ''
    html_context = ''
    if(notice.in_reply_to_status_id || notice.in_reply_to_user_id)
        html_context = 'in context'
    return html_context
}
function _notice_favorites(notice){
    if(notice.favorited == true)
        return '<br><span class="favoriteds">you liked it</span>'
    return '';
    // html_metadata = ''
    // class_favorite = ''
    // if(notice.favorited == true){
        // return '<br><span class="favoriteds">you liked it</span>'
        // class_favorite = 'favorited'
        // html_metadata_favs = ['You']
        // html_metadata = ''
        // for(i=html_metadata_favs.length-1; i>=0; i--){
            // seperator = ''
            // console.log(html_metadata_favs.length, i, html_metadata_favs[i])
            // 
            // if(i != 0){
                // if(i-1 != 0)
                    // seperator = ', '
                // else
                    // seperator = ' and '
            // }
            // html_metadata =  html_metadata + html_metadata_favs[i] + seperator
        // }
        // html_metadata = '<span class="favoriteds">' + html_metadata + ' liked it</span>'
    // }
}
function _notice_repeated(notice){
    if(notice.retweeted_status){
        return '<br><span class="repeated"> repeated by ' + notice.user.screen_name + '</span>'
    }
    return '';
}
function _notice_metadata(notice){
    return '<div class="metadata">\
                ' + _notice_time(notice) + '\
                ' + _notice_source(notice.source) + '\
                ' + _notice_context(notice) + '\
                ' + _notice_favorites(notice) + '\
                ' + _notice_repeated(notice) + '\
            </div>'
}
function _notice_action(notice, unique_conversation){
    notice_favorited = ''
    action_load_conversation = ''
    if(notice.favorited == true)
        notice_favorited = 'favorited'
    if(unique_conversation && notice.in_reply_to_status_id)
        action_load_conversation = '<a href="#" title="Load The Conversation" class="app-link label conversation">\&#x213A;</a>'
    return '<div class="action hide">\
                ' + action_load_conversation + '\
                <a href="#" title="Repeat this notice" class="app-link label repeat">\&#x21BB;</a>\
                <a href="#" title="Reply to this notice" class="app-link label reply">\&#x21B2;</a>\
            </div>'
    // <a href="#" title="Favorite this notice" class="label favorite ' + notice_favorited + '">\&#x2665;</a>
}
function _notice_form(notice){
    return '<div class="notice-form">\
                <div>\
                    <textarea data-notice="' + notice.id + '" data-screenname="' + notice.user.screen_name + '" data-text="' + notice.text + '"></textarea>\
                </div>\
                <div class="btn-group">\
                    <button class="btn" disabled="disabled">140</button>\
                    <button class="btn send" data-loading-text="Sending ...">Send</button>\
                    <button class="btn dropdown-toggle" data-toggle="dropdown">\
                        <span class="caret"></span>\
                    </button>\
                    <ul class="dropdown-menu">\
                        <li class="status-plugin-shorturl"><a class="app-link" href="#"><i class="icon icon-plus"></i> Shorten my links</a></li>\
                        <li class="status-plugin-forcertl"><a class="app-link" href="#"><i class="icon icon-plus"></i> Force RTL</a></li>\
                    </ul>\
                </div>\
            </div>'
}
function _notice_attachments(notice){
    attachments = ''
    if (notice.attachments){
        console.log('attachment', notice.attachments)
        for(j=0; j<notice.attachments.length; j++){
            // console.log(notice.attachments[j])
            // TODO: check for other types of attachments, like videos maybe?
            mimetype = notice.attachments[j].mimetype
            if (mimetype.match(/^image/)){
                attachments += '<a class="app-link" target=_blank href="' + notice.attachments[j].url + '"><img class="thumbnails" src="' + notice.attachments[j].url + '"></a>'
            }else if (mimetype.match(/^text/)){
                attachments += '<a class="app-link hide attachments text-html" href="' + notice.attachments[j].url + '"><i class="icon icon-file"></i> show more</a>'
                // attachments += '<button class="btn btn-mini btn-info">more</button>'
            }else{
                attachments += '<a class="app-link attachments" href="' + notice.attachments[j].url + '"><i class="icon icon-file"></i> ' + notice.attachments[j].url + '</a>'
            }
        }
    }
    return attachments
}

function template_html_stream_notice(notice){
    return '<li class="stream-item">\
                <a class="app-link" tabindex="-1" href="#status-home-' + notice.id + '" title="' + notice.text + '">\
                    <img class="icon" src="' + notice.user.profile_image_url + '" width=24px>\
                    ' + notice.user.screen_name + ', ' + _notice_time(notice) + '\
                </a>\
            </li>'
}
function template_update_stream_count(){
    $('#status-streams > a i').html(SETTINGS['stream_count'])
    document.title = SETTINGS['app']['title']
    if(SETTINGS['stream_count'])
        document.title += '(' + SETTINGS['stream_count'] + ')';

}

function template_html_timeline_notice(notice, unique_conversation){
    text_class = ''
    if(notice.is_rtl)
        text_class = 'rtl'
    return '<div id="status-home-' + notice.id + '" class="notice span12" ' + _notice_data_attributes(notice, unique_conversation) + '>\
                <div class="notice-holder pull-right span12">\
                    <div class="content pull-left"><b>' + notice.user.screen_name + '</b>\
                        <p class="' + text_class + '">\
                            <img class="avatar" data-title="' + notice.user.name + '" data-statusnet-description="' + notice.user.description + '" data-statusnet-url="' + notice.user.url + '" data-statusnet-name="' + notice.user.name + '" data-statusnet-following="' + notice.user.following + '" data-statusnet-profile-url="' + notice.user.statusnet_profile_url + '" data-statusnet-screen-name="' + notice.user.screen_name + '" rel="popover" src="' + notice.user.profile_image_url + '">\
                            <span">' + notice.statusnet_html + '</span>\
                        </p>\
                        ' + _notice_attachments(notice) + '\
                    </div>\
                    <span class="info">' + _notice_metadata(notice) + _notice_action(notice, unique_conversation) + '</span>\
                    ' + _notice_form(notice) + '\
                </div>\
                ' + _notice_replies_holder(unique_conversation) + '\
            </div>'
}
function template_timeline_notices(notices, html){
    stream = true
    if (!html){
        html = $('<div></div>')
        stream = false
    }
    if(notices.length>0){
        for (i = notices.length-1; i >=0 ; i--) {
            notice = notices[i]
            if($(html).find('.notice[data-notice=' + notice.id + ']').length){
                continue
            }else{
                conversation_object = $(html).find('.notice[data-conversation=' + notice.statusnet_conversation_id + ']')
                if(conversation_object.length){
                    notice_html = template_html_timeline_notice(notice, false)
                    $(conversation_object).children('.replies-holder').append(notice_html)
                }else{
                    notice_html = template_html_timeline_notice(notice, true)
                    $(html).prepend(notice_html)
                }
                if(stream){
                    SETTINGS['stream_count'] += 1
                    $('#status-streams ul').prepend(template_html_stream_notice(notice))
                    // $('#status-streams ul > li.divider:first-child').after(template_html_stream_notice(notice))
                }
            }
        }
        template_update_stream_count()
        _jquery_plugin_attach(html)
    }
    return html
}
