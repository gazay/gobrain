rooster = function() {
    Preved.play('/themes/road/rooster.mp3')
}

$(document).ready(function() {
    $('body').css('background', '#7ca2ab url(/themes/road/background.jpg) no-repeat 0 100%')
    Style.add('full body', function() {
        $('body').css('height', $(document).height())
    })
    
    $('<div />').appendTo('body').attr('id', 'rooster')
        .css('position', 'absolute')
        .css('bottom', 25).css('left', 0)
        .css('width', 140).css('height', 115)
        .css('cursor', 'pointer')
        .click(function() {
            Preved.broadcast('rooster')
        })
      
    Preved.server.add('rooster', rooster)
})
