crow_template = {
    status_form: function(notice_id, screen_name){
        return '<div class="status_form">\
                    <div class="btn-toolbar">\
                        <div class="btn-group">\
                            <button class="btn btn-small btn_status_ltr active" title="indicates status is left to right"><i class="icon icon-align-left"></i></button>\
                            <button class="btn btn-small btn_status_length" title="click to tries shorten text">0</button>\
                            <button class="btn btn-small btn_status_rtl" title="indicates status is right to left"><i class="icon icon-align-right"></i></button>\
                        </div>\
                        <div class="btn-group">\
                            <button class="btn btn-small btn_status_short_url" title="click to shorten all urls"><i class="icon icon-share"></i></button>\
                        </div>\
                        <div class="btn-group">\
                            <button class="btn btn-small btn_status_upload" title="upload image <NOT IMPLEMENTED YET>"><i class="icon  icon-picture"></i></button>\
                        </div>\
                    </div>\
                    <textarea data-notice="' + notice_id + '" data-screen-name="' + (screen_name ? screen_name : '') + '" placeholder="Your Status"></textarea>\
                </div>'
    },
    navbar: function(){
        return '<div class="navbar">\
                    <div class="navbar-inner">\
                        <div class="container">\
                            <a class="app-link brand" href="#">\
                                <img id="avatar" class="thumbnail" src="/static/img/favicon.png">\
                            </a>\
                            <ul class="nav" id="nav-pages">\
                                <li class="active"><a class="app-link" href="#home">home</a></li>\
                                <li class=""><a class="app-link" href="#replies">replies</a></li>\
                            </ul>\
                            <ul class="nav pull-right">\
                                <li>\
                                    <a class="app-link" href="#">\
                                        <img id="loading" src="/static/img/ajax.gif">\
                                    </a>\
                                </li>\
                                <li class="dropdown" id="status-streams">\
                                    <a href="#" role="button" class="app-link dropdown-toggle" data-toggle="dropdown">\
                                        <b class="icon icon-comment"></b>\
                                        <i></i>\
                                    </a>\
                                    <ul class="dropdown-menu" role="menu" aria-labelledby="drop3">\
                                        <li class="divider"></li>\
                                        <li><a class="app-link empty" tabindex="-1" href="#"><i class="icon icon-trash"></i>Empty</a></li>\
                                    </ul>\
                                </li>\
                            </ul>\
                        </div>\
                    </div>\
                </div>'
    },

    alert: function(type, text){
        return '<div class="alert alert-' + type + '"><a class="app-link close" data-dismiss="alert" href="#">x</a>' + text + '</div>'
    },

    notice: function(notice){
        function _time(notice){
            var notice_timestamp = Date.parse(notice.created_at) / 1000
            return '<span class="time" data-livestamp="' + notice_timestamp + '"></span> '
        }
        function _notice_id(notice){
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
        function _notice_actions(notice){
            return '<button title="Repeat this notice" class="btn btn-mini repeat"><i class="icon icon-white icon-refresh"></i></button>\
                    <button title="Reply to this notice" class="btn btn-mini reply"><i class="icon icon-white icon-share-alt"></i></button>\
                    <button title="Favorite this notice" class="btn btn-mini favorite ' + (notice.favorited ? 'active' : '') + '"><i class="icon icon-white icon-star"></i></button>\
                    <button title="Load this conversation" class="btn btn-mini conversation"><i class="icon icon-white icon-eye-open"></i></button>'
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
                        attachments += '<a class="app-link hide attachments text-html" href="' + notice.attachments[j].url + '"><i class="icon icon-file"></i> show more</a>'
                    }else{
                        attachments += '<a class="app-link attachments" href="' + notice.attachments[j].url + '"><i class="icon icon-file"></i> ' + notice.attachments[j].url + '</a>'
                    }
                }
            }
            return attachments
        }
        return '<div id="' + _notice_id(notice) + '" class="notice">\
                    <div class="notice_body">\
                        <div class="notice_content">\
                            <strong>' + notice.user.screen_name + '</strong>\
                            <p class="' + _notice_direction(notice) + '">\
                                <img class="avatar" src="' + notice.user.profile_image_url + '">\
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
                            ' + _notice_actions(notice) + '\
                        </div>\
                        <div class="notice_form">' + crow_template.status_form(notice.id, notice.user.screen_name) + '</div>\
                    </div>\
                </div>'
    },
    notices: function(notices){
        if(!notices.length)
            return false
        var html = $('<div></div>')
        for (var i=0; i<notices.length ; i++) {
            var notice = notices[i]
            var notice_html = $(crow_template.notice(notice))
            $(notice_html).appendTo(html)
        }
        return html
    },
    
}
