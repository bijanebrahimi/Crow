$(document).ready(function(){
    // on every textarea value change
    $(document).on('input propertychange', 'textarea', function(){
        status = $(this).val()

        // Direction
        if(crow.is_rtl(status)){
            $(this).css('direction', 'rtl').css('textalign', 'right')
            $(this).siblings('.btn-toolbar').find('.btn_status_rtl:first').addClass('active').siblings('.btn_status_ltr').removeClass('active')
        }else{
            $(this).css('direction', 'ltr').css('textalign', 'left')
            $(this).siblings('.btn-toolbar').find('.btn_status_rtl:first').removeClass('active').siblings('.btn_status_ltr').addClass('active')
        }

        // Length
        MAX_LENGTH = 140
        remaining_length = MAX_LENGTH - status.length
        $(this).siblings('.btn-toolbar').children('.btn-group').children('.btn_status_length').html(remaining_length)
        if(remaining_length<0)
            $(this).parent().addClass('exceeded')
        else
            $(this).parent().removeClass('exceeded')
    })
    
    // on short url button
    $(document).on('click', '.btn_status_length', function(){
        textarea = $(this).parents('.status_form').children('textarea')
        status = $(textarea).val()
        status = status.replace(/(http:\/\/[^ ]+)/g, crow.get_short_url)
        $(textarea).val(status)
    })
})
