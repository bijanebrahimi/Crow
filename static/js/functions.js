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
};
