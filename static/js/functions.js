function escape_quotes(text){
    if(text){
        text = text.replace(/"/g, '❞')
        text = text.replace(/'/g, '❜')
        return text
    }
    return ''
}
function is_rtl(text){
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
}
function get_short_url(long_url, callable_success, callable_error, callable_always){
    $.getJSON(
        "http://api.bitly.com/v3/shorten?callback=?", 
        { 
            "format": "json",
            "apiKey": "R_dd2d4938df1b6e367fa42686912f75be",
            "login": "crowurls",
            "longUrl": long_url
        },
        function(response){
            if(response.status_code==200)
                callable_success(response.data.url);
            else
                callable_error(response.status_txt)
        }
    ).fail(function(){
        if(callable_error)
            callable_error('network failed')
    })
    .always(function(){
        if(callable_always)
            callable_always()
    });
}
