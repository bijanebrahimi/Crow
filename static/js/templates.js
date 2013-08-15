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

crow_template = {
    alert: function(type, text){
        return '<div class="alert alert-' + type + '"><a class="app-link close" data-dismiss="alert" href="#">x</a>' + text + '</div>'
    },

    stream: function(notice){
        function _time(notice){
            var notice_timestamp = Date.parse(notice.created_at) / 1000
            return '<span class="time" data-livestamp="' + notice_timestamp + '"></span> '
        }
        function _reply(notice){
            if(notice.in_reply_to_user_id==crow.user_info.id)
                return 'mentioned'
            else
                return ''
        }
        return '<li class="stream-item ' + _reply(notice) + '">\
                    <a class="app-link" tabindex="-1" href="#notice-' + notice.id + '" title="' + crow.escape_quotes(notice.text) + '">\
                        <img class="icon" src="' + notice.user.profile_image_url + '" width=24px>\
                        ' + notice.user.screen_name + ', ' + _time(notice) + '\
                    </a>\
                </li>'
    },
    streams: function(notices){
        if(notices.length>0)
            for (var i=notices.length-1; i>=0 ; i--){
                stream_html = crow_template.stream(notices[i])
                $('#stream').prepend(stream_html)
            }
    },

    notice: function(notice, is_reply){
        function _time(notice){
            var notice_timestamp = Date.parse(notice.created_at) / 1000
            return '<span class="time" data-livestamp="' + notice_timestamp + '"></span> '
        }
        function _notice_id(notice, is_reply){
            if (is_reply)
                return 'reply-' + notice.id
            else
                return 'notice-' + notice.id
        }
        function _notice_direction(notice){
            var notice_direction = ''
            if(crow.is_rtl(notice.text))
                notice_direction = 'rtl'
            return notice_direction
        }
        function _notice_source(notice){
            if(notice.source)
                return '<span class="source"> from ' + notice.source + '</span>'
            return ''
        }
        function _notice_favorited(notice){
            if(notice.favorited == true)
                return '<br><span class="favorited">you liked it</span>'
            return '';
        }
        function _notice_actions(notice, is_reply){
            var html = '<button title="Repeat this notice" class="btn btn-mini repeat"><i class="icon icon-white icon-refresh"></i></button>\
                        <button title="Reply to this notice" class="btn btn-mini reply"><i class="icon icon-white icon-share-alt"></i></button>\
                        <button title="Favorite this notice" class="btn btn-mini favorite ' + (notice.favorited ? 'active' : '') + '"><i class="icon icon-white icon-star"></i></button>\
                        '
            if(notice.in_reply_to_status_id||notice.in_reply_to_screen_name||notice.in_reply_to_user_id){
                if(!is_reply)
                    html += '<button title="Load this conversation" class="btn btn-mini conversation"><i class="icon icon-white icon-comment"></i></button>'
                else
                    html += '<button title="Go to this notice" class="btn btn-mini conversation conversation_reply"><i class="icon icon-white icon-chevron-left"></i></button>'
            }
            return html
        }
        function _notice_html_content(notice){
            return notice.statusnet_html
        }
        function _notice_attachments(notice){
            var attachments = ''
            if (notice.attachments){
                for(var j=0; j<notice.attachments.length; j++){
                    var mimetype = notice.attachments[j].mimetype
                    if (mimetype.match(/^image/)){
                        attachments += '<a class="app-link" target=_blank href="' + notice.attachments[j].url + '"><img class="thumbnails" src="' + notice.attachments[j].url + '"></a>'
                    }else if (mimetype.match(/^text/)){
                        var link = notice.attachments[j].url
                        var matched = link.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)/)
                        if(matched){
                            if(matched[2]=='youtube.com')
                                var v = link.match(/v=([^&]+)/)[1]
                            else
                                var v = link.match(/\/([^\/]*)*$/)[1]
                            var thumbnail = "http://i" + (Math.ceil(Math.random()*4)) + ".ytimg.com/vi/" + v + "/1.jpg"
                            attachments += '<a class="app-link" target=_blank href="' + notice.attachments[j].url + '"><img class="thumbnails" src="' + thumbnail + '"></a>'
                        }else{
                            attachments += '<a class="app-link hide attachments text-html" href="' + notice.attachments[j].url + '"><i class="icon icon-file"></i> show more</a>'
                        }
                    }else{
                        attachments += '<a class="app-link attachments" href="' + notice.attachments[j].url + '"><i class="icon icon-file"></i> ' + notice.attachments[j].url + '</a>'
                    }
                }
            }
            return attachments
        }
        var notice_html = '<div id="' + _notice_id(notice, is_reply) + '" data-screenname="' + notice.user.screen_name + '" class="notice" data-conversation="' + notice.statusnet_conversation_id + '">\
                    <div class="notice_body">\
                        <div class="notice_content">\
                            <strong>' + notice.user.screen_name + '</strong>\
                            <p class="' + _notice_direction(notice) + '">\
                                <a class="avatar" href="' + notice.user.statusnet_profile_url + '"><img src="' + notice.user.profile_image_url + '"><a/>\
                                <span>' + _notice_html_content(notice) + '</span>\
                            </p>\
                            ' + _notice_attachments(notice) + '\
                        </div>\
                        <div class="notice_meta">\
                            ' + _time(notice) + '\
                            ' + _notice_source(notice) + '\
                            ' + _notice_favorited(notice) + '\
                        </div>\
                        <div class="notice_action">\
                            ' + _notice_actions(notice, is_reply) + '\
                        </div>\
                    </div>\
                    <div class="notice_replies"></div>\
                </div>'
                        // <div class="notice_form">' + crow_template.status_form(notice.id, notice.user.screen_name) + '</div>
        notice_element = $(notice_html)
        crow.plugin_mention($(notice_element).find('textarea'))
        return notice_element
    },
    notices: function(notices, conversation, prepend, container, is_reply){
        if(!notices.length){
            return false
        }
        if(!container){
            var container = $('<div>1</div>')
        }
        for (var i=notices.length-1; i>=0 ; i--) {
            var notice = notices[i]

            // Skip already existing notices
            if(!is_reply && $(container).find('#notice-' + notice.id).length){
                continue
            }else if(is_reply && $(container).find('#reply-' + notice.id).length){
                continue
            }

            // Add new profiles to friend list
            crow.friend_add(notice.user)

            var notice_html = crow_template.notice(notice, is_reply)
            
            if(conversation){
                var conversation_parent = $(container).find('.notice[data-conversation=' + notice.statusnet_conversation_id + ']:first')
                var conversation_parent_id = $(conversation_parent).attr('id')
                if(conversation_parent_id){
                    var conversation_parent_id = parseInt(conversation_parent_id.replace('notice-', ''))
                    if(parseInt(conversation_parent_id)>parseInt(notice.id)){
                        var tmp_array = conversation_parent.find('.notice')
                        $(conversation_parent).children('.notice_replies').html('')
                        tmp_array.push($(conversation_parent))
                        tmp_array = tmp_array.sort(crow.sort_notices)
                        
                        $(conversation_parent).replaceWith($(notice_html))
                        for(var j=0; j<tmp_array.length; j++){
                            $(notice_html).children('.notice_replies').append(tmp_array[j])
                        }
                    }else{
                        var tmp_array = conversation_parent.find('.notice')
                        tmp_array.push(notice_html)
                        tmp_array = tmp_array.sort(crow.sort_notices)
                        $(conversation_parent).children('.notice_replies').html('')
                        for(var j=0; j<tmp_array.length; j++){
                            $(conversation_parent).children('.notice_replies').append(tmp_array[j])
                        }
                    }
                }else{
                    if(prepend)
                        $(notice_html).prependTo(container)
                    else
                        $(notice_html).appendTo(container)
                }
            }else{
                if(prepend)
                    $(notice_html).prependTo(container)
                else
                    $(notice_html).appendTo(container)
            }
        }
        return container
    },
}
