function ajax_post(url, data, callbacks){
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
}

function get_info(){
    $('#timeline-navbar .navbar-inner ul li a img.loading').fadeIn(200)
    ajax_post(SETTINGS['api']['info'],
        {},
        {'success': function(response){
            SETTINGS['info']['user'] = response.user
            SETTINGS['info']['server'] = response.server
            console.log(response)
            
            $('#timeline-navbar .navbar-inner .brand .avatar').attr('src', SETTINGS['info']['user'].avatar)
            // SETTINGS['status_length_limit'] = response.server.length_limit
            $('#status-length-limit').html(SETTINGS['info']['server']['length_limit'])
            
            // $("textarea").autoSuggest(SETTINGS['info']['user']['friends'],
                // {selectedItemProp: "screen_name",
                 // searchObjProps: "screen_name"});
        },
        'error': function(response){
            console.log(response)
        },
        'failed': function(){},
        'always': function(){
            $('#timeline-navbar .navbar-inner ul li a img.loading').fadeOut(200)
            timeline_update(20000, 'refresh')
        }})

}

function timeline_update(seconds, event){
    var interval = seconds
    if(!event)
        event = ''
    $('#timeline-navbar .navbar-inner ul li a img.loading').fadeIn(200)
    ajax_post(SETTINGS['api']['home'], {'event': event},
              {'success': function(response){
                    DEBUG = response
                    html = $('#timeline #timeline-container #timeline-content')
                    html = template_timeline_notices(response.home_timeline, html)
               },
               'error': function(response){
                    console.log(response['error'])
               },
               'failed': function(){ },
               'always': function(){
                    $('#timeline-navbar .navbar-inner ul li a img.loading').fadeOut(200)
                    // console.log('updating [' + intervalinterval + ']')
                    if(interval)
                        setTimeout(function(){ console.log('updating...'); timeline_update(interval); }, interval)
               }})
}
