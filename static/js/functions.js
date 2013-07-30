function escape_quotes(text){
    text = text.replace(/"/g, '❞')
    text = text.replace(/'/g, '❜')
    
    return text
}
