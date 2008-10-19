User = {
    el: function(id) {
        return $('#user' + id)
    },
    add: function(id, name) {
        if (!User.el(id).length) {
            user = $('<li/>').attr('id', "user" + id).html('<p>' + name + '</p>')
            user.appendTo('#users').hide().show(500)
        }
    },
    remove: function(id) {
        User.el(id).hide(500, function() {
            $(this).remove()
        })
    },
    rename: function(id, name) {
        $('#user' + id + ' p').text(name)
    },
    name: function(id) {
        return $('#user' + id + ' p').text()
    }
}
 
Chat = {
    maxName: null,
    isLast: function(id) {
        if ($('#messages li:last').hasClass('system')) {
            return false;
        }
        return $('#messages .author:last').hasClass('user' + id)
    },
    add: function(text) {
        var messages = $('#messages')[0]
        var scroll = messages.scrollHeight
        scroll -= messages.scrollTop + $('#messages').height()
        
        var message = $('<li />').html(Chat.format(text)).appendTo('#messages')
            .css('padding-left', Chat.maxName + 10)
        
        if (30 > scroll) messages.scrollTop = messages.scrollHeight
        return message
    },
    author: function(message, user) {
        author = $('<span/>').addClass('author user' + user)
        author.text(User.name(user)).prependTo(message)
        if (Chat.maxName < author.width()) {
            Chat.maxName = author.width()
            Style.rules.authors()
        } else {
            author.css('width', Chat.maxName)
        }
        return message
    },
    sys: function(text, type) {
        var message = this.add(text).addClass('system')
        if (type) message.addClass(type)
        return message
    },
    msg: function(user, text) {
        var message = Chat.add(text)
        if (!Chat.isLast(user)) Chat.author(message, user)
        if (Preved.me == user) message.addClass('mine')
        return message;
    },
    format: function(text) {
        return '<p>' + String(text).replace(/\n/, '</p><p>') + '</p>'
    },
    timer: null,
    time: function() {
        var now = new Date()
        if (0 != (now.getMinutes() % 5)) {
            clearInterval(Chat.timer)
            Chat.timerStarter = setInterval(Chat.startTimer, 1000)
            return;
        }
        $('#messages li:last.time').remove()
        var time = now.toTimeString().match(/(\d\d:\d\d):/)[1]
        Chat.sys(time, 'time')
    },
    timerStarter: null,
    startTimer: function() {
        var minutes = (new Date()).getMinutes()
        if (0 == (minutes % 5)) {
            clearInterval(Chat.timerStarter)
            Chat.time()
            Chat.timer = setInterval(Chat.time, 5 * 60 * 1000)
        }
    }
}

Style = {
    init: function() {
        Style.run('first')
        $(window).resize(function() {
            Style.run('resize')
        })
        Style.fontStandard = $('#about').width()
        setInterval(Style.checkFont, 500)
    },
    run: function(caller) {
        for (rule in Style.rules) {
            Style.rules[rule](caller)
        }
    },
    fontStandard: null,
    checkFont: function() {
        if ($('#about').width() != Style.fontStandard) {
            Style.fontStandard = $('#about').width()
            Style.run('font')
        }
    },
    rules: {
        messages: function(caller) {
            $('#messages').css('height', 
                $('#new').offset().top - $('#messages').offset().top)
        },
        authors: function(caller) {
            if ('resize' == caller) return
            if ('font' == caller || !Chat.maxName) {
                Chat.maxName = 0
                $('#messages .author').each(function(i) {
                    width = $(this).width()
                    if (Chat.maxName < width) Chat.maxName = width
                })
            }
            $('#messages li').css('padding-left', Chat.maxName + 10)
            $('#messages .author').css('width', Chat.maxName)
        }
    }
}

Preved = {
    me: $.cookie('user'),
    muted: function() {
        if ($.cookie('muted')) {
            Preved.mute()
            return true
        } else {
            Preved.unmute()
            return false
        }
    },
    message: function(text) {
        this.send('POST', { message: text })
    },
    theme: function(name) {
        this.send('PUT', { theme: name })
    },
    user: function(name){
        if (User.name(Preved.me) == name) {
            return
        }
        this.send('PUT', { name: name })
    },
    send: function(method, data) {
          if (!data) data = {}
          if ('PUT' == method) {
              data['_method'] = method
              method = 'POST'
          }
          $.ajax({
              type: method,
              data: data
          })
    },
    mute: function() {
        $('#settings .sounds').hide()
        $('#settings .muted').show()
        $.cookie('muted', true, { path: '/' })
    },
    unmute: function() {
        $('#settings .muted').hide()
        $('#settings .sounds').show()
        $.cookie('muted', null, { path: '/' })
    },
    server: {
        receive: function(data) {
            if (Preved.server[data.command]) {
                Preved.server[data.command](data)
            }
		    },
        connect: function(params) {
            User.add(params.user, params.name)
            Chat.author(Chat.sys('logged in.', 'in'), params.user)
            if (params.user != Preved.me) {
                Preved.play('/sounds/connect.mp3')
            }
        },
        disconnect: function(params) {
            Chat.author(Chat.sys('logged out.', 'out'), params.user)
            User.remove(params.user, 'out')
            if (params.user != Preved.me) {
                Preved.play('/sounds/disconnect.mp3')
            }
        },
        message: function(params) {
            Chat.msg(params.user, params.text)
            if (params.user != Preved.me) {
                Preved.play('/sounds/message.mp3')
            }
        },
        user: function(params) {
            Chat.sys(User.name(params.user) + ' is now ' + params.name + '.')
            User.rename(params.user, params.name)
        }
    }
}
 
Juggernaut.fn.receiveData = function(e) {
    var msg = Juggernaut.parseJSON(unescape(e.toString()))
    this.currentMsgId = msg.id
    this.currentSignature = msg.signature
    this.logger("Received data:\n" + msg.body + "\n")
    Preved.server.receive(Juggernaut.parseJSON(msg.body))
}

Juggernaut.fn.logger = function(msg) { //DEBUG
    if (this.options.debug && this.hasLogger) {
        console.log('Juggernaut: ' + msg + ' on ' + this.options.host + ':' + this.options.port)
    }
}
 
$(document).ready(function() {
    $('#new textarea').keyup(function(e) {
        if ((13 == e.keyCode || 3 == e.keyCode) && !e.shiftKey) {
            $('#new').submit()
        }
    })
    $('#new').submit(function() {
        var text = $('#new textarea').val()
        $('#new textarea').val('')
        if ('' == text) return false
        $('#new textarea').val('')
        Preved.message(text)
        return false
    })
    $('#new textarea').focus()
    
    $('input').mouseover(function() {
        $(this).addClass('hover')
    })
    $('input').mouseout(function() {
        $(this).removeClass('hover')
    })
    
    $('#settings a.muted').click(function() {
        Preved.unmute()
        return false
    })
    $('#settings a.sounds').click(function() {
        Preved.mute()
        return false
    })
    
    $('#settings select').change(function() {
        Preved.theme(this.options[this.selectedIndex].value.toLowerCase())
    })
    
    $('#users .me').mouseover(function() {
        if (0 != $('#users .renamer').length) {
            return
        }
        $('#users .rename').show()
    })
    $('#users .me').mouseout(function() {
        $('#users .rename').hide()
    })
    $('#users li .rename').click(function() {
        $(this).hide()
        $(this).nextAll('p, span').hide()
        $('<input type="text" />').addClass('renamer').appendTo($(this).parent())
            .val($(this).nextAll('p').text())
            .keyup(function(e) {
                if (13 == e.keyCode || 3 == e.keyCode) {
                    $(this).blur()
                }
            })
            .blur(function() {
                Preved.user($(this).val())
                $(this).prevAll('p, span').show()
                $(this).remove()
            }).focus()
    })
    $('#users li:not(.me) p').click(function() {
        $('#new textarea').val($(this).text() + ': ' + $('#new textarea').val())
            .focus()
    })
    
    $('<div />').attr('id', 'sound').appendTo('body')
    swfobject.embedSWF('/sounds/player.swf', 'sound',
        '0', '0', '8.0.0', '/juggernaut/expressinstall.swf',
        {useexternalinterface: true, enabled: true}, {AllowScriptAccess: 'always'}, {}
    )
    Preved.play = function(url) {
        if (Preved.muted()) {
            return false;
        }
        player = $('#sound')[0]
        player.SetVariable('method:setUrl', url);
        player.SetVariable('method:play', '')
    }
    
    Chat.timerStarter = setInterval(Chat.startTimer, 1000)
    
    Style.init()
})
