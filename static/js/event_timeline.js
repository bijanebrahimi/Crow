$(document).ready(function(){
    // on every textarea value change
    $(document).on('input propertychange', 'textarea', function(){
        status = $(this).val()
        console.log(status)
        if(crow.is_rtl(status)){
            $(this).css('direction', 'rtl').css('textalign', 'right')
        }else{
            $(this).css('direction', 'ltr').css('textalign', 'left')
        }
    })
})
