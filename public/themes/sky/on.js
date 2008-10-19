Rocket = {
    blocked: false,
    step: 0,
    up: false,
    fly: false,
    startFalling: null,
    hide: true,
    winner: false,
    stepSize: 70,
    stepsToWin: 5,
    start: function(step) {
        if (Rocket.up) return
        
        $('#rocket .click').hide()
        $('#rocket .next').hide()
        
        $('#rocket .body').show()
        $('#rocket .fire').show()
        
        if (Rocket.fly) {
            $('#rocket:animated').stop()
            Rocket.step -= Math.floor(
                ((new Date()).getTime() - Rocket.startFalling) / 4500)
        }
        if (step) {
            Rocket.step = Number(step)
        } else {
            Preved.broadcast('start', Rocket.step)
        }
        
        Rocket.up = true
        Rocket.fly = true
        Rocket.step += 1
        
        Style.stop()
        $('#rocket').animate({
            bottom: Rocket.step * Rocket.stepSize
        }, 3000, null, function() {
            Rocket.up = false
            if (Rocket.stepsToWin == Rocket.step) {
                $('#rocket .win').show()
                Rocket.winner = true
            }
            Rocket.fall()
        })
        setTimeout(function() {
            $('#rocket .fire').hide()
        }, 1500)
        
        Rocket.blocked = false
    },
    fall: function() {
        Rocket.startFalling = (new Date()).getTime()
        $('#rocket').animate({
            bottom: 0
        }, (Rocket.step * 4500), null, function() {
            Rocket.fly = false
            Rocket.step = 0
            Style.start()
            if (Rocket.hide) {
                $('#rocket .body').fadeOut(400)
            }
            Rocket.blocked = false
            if ($('#rocket .next').is(':visible')) {
                $('#rocket .next').hide()
                $('#rocket .click').show()
            }
            Rocket.winner = false
            $('#rocket .win').fadeOut(400)
        })
    }
}

$(document).ready(function() {
    $('body').css('background', '#87c1cc url(/themes/sky/background.jpg) 0 0 no-repeat')
    
    $('<div />').appendTo('body').attr('id', 'rocket-trace')
        .css('position', 'absolute')
        .css('width', 87).css('height', '100%')
        .css('padding-left', '60px')
        .css('top', 0).css('left', 0)
    $('<div />').appendTo('#rocket-trace').attr('id', 'rocket')
        .css('position', 'absolute')
        .css('width', 87).css('height', 211)
        .css('bottom', 0).css('left', 60)
        .css('margin-bottom', '10px')
    $('<div />').appendTo('#rocket').attr('class', 'fire')
        .css('position', 'absolute')
        .css('width', 41).css('height', 67)
        .css('bottom', 0).css('left', 24)
        .css('background', 'url(/themes/sky/fire.png) 0 0 no-repeat').hide()
    $('<div />').appendTo('#rocket').attr('class', 'body')
        .css('position', 'absolute')
        .css('width', 87).css('height', 162)
        .css('top', 0).css('left', 0)
        .css('cursor', 'pointer')
        .css('background', 'url(/themes/sky/rocket.png) 0 0 no-repeat').hide()
    
    $('<div />').appendTo('#rocket').attr('class', 'click')
        .text('Click me!')
        .css('position', 'absolute')
        .css('width', '100%').css('top', 170)
        .css('text-align', 'center')
        .css('background-color', '#ffc').hide()
    $('<div />').appendTo('#rocket').attr('class', 'next')
        .text('Now your friend must click ;)')
        .css('position', 'absolute')
        .css('width', '100%').css('top', 167)
        .css('text-align', 'center')
        .css('background-color', '#ffc').hide()
    $('<div />').appendTo('#rocket').attr('class', 'win')
        .text('WIN!')
        .css('position', 'absolute')
        .css('width', '100%').css('top', 167)
        .css('text-align', 'center')
        .css('background-color', '#cfc').hide()
    
    Style.add('rocket', function(caller) {
        $('#rocket-trace').css('padding-right', 
            ($('#messages').offset().left - 147) + 'px')
        if ('resize' == caller || 'init' == caller) {
            Rocket.stepSize = $(window).height() - $('#rocket').height()
            Rocket.stepSize /= Rocket.stepsToWin
        }
    })
    
    $('#rocket-trace').mouseover(function() {
        $('#rocket .body').show()
        
        if (!Rocket.blocked) {
            $('#rocket .click').show()
        }
        Rocket.hide = false
    })
    $('#rocket-trace').mouseout(function() {
        if (!Rocket.fly) {
            $('#rocket .body').hide()
            $('#rocket .click').hide()
            $('#rocket .next').hide()
        }
        Rocket.hide = true
    })
    $('#rocket').mouseover(function() {
        if (Rocket.blocked && !Rocket.win) $('#rocket .next').show()
    })
    $('#rocket').mouseout(function() {
        $('#rocket .next').hide()
    })
    $('#rocket').click(function() {
        //if (!Rocket.blocked) {
            Rocket.start()
            Rocket.blocked = true
        //}
    })
    
    Preved.server.add('start', Rocket.start)
})
