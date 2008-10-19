User = {
    el: function(id) {
        return $('#user' + id)
    },
    count: function(id) {
        return User.el(id).data('count')
    },
    add: function(id, name){
        if (!User.el(id).length) {
            user = $('<li/>').attr('id', "user" + id).text(name)
            user.appendTo('#users').hide().show(500)
            User.el(id).data('count', 0)
        }
        user = User.el(id).data('count', User.count(id) + 1)
    },
    remove: function(id){
        User.el(id).data('count', User.count(id) - 1)
        if (User.cound(id) <= 0) {
            User.el(id).hide(500, function() {
                $(this).remove()
            })
        }
    },
    rename: function(id, name){
        User.el(id).text(name)
    },
    name: function(id){
        return User.el(id).text()
    }
}
 
Chat = {
    maxName: -10,
    isLast: function(id) {
        console.log($('#messages li'))
        if ($('#messages li:last').hasClass('system')) {
            return false;
        }
        return $('#messages .author:last').hasClass('user' + id)
    },
    write: function(text) {
        return $('<li />').html('<p>' + text + '</p>').appendTo('#messages')
            .css('padding-left', Chat.maxName + 10)
    },
    add: function(text) {
        return Chat.write(text).hide().fadeIn(200)
    },
    sys: function(text, type) {
        this.add(text).addClass('system ' + type)
    },
    msg: function(user, text) {
        var last = Chat.isLast(user)
        message = this.add(text)
        if (Preved.me == user) message.addClass('mine')
        if (!last) {
            author = $('<span/>').addClass('author user' + user)
            author.text(User.name(user)).prependTo(message)
            if (Chat.maxName < author.width()) {
                Chat.maxName = author.width()
                $('#messages li').css('padding-left', author.width() + 10)
                $('#messages .author').css('width', author.width())
            } else {
                author.css('width', Chat.maxName)
            }
        }
    },
    time: function() {
        var time = (new Date()).toTimeString().match(/(\d\d:\d\d):/)[1]
        Chat.write(time).addClass('time system')
    }
}

Style = {
    init: function() {
        Style.run()
        $(window).resize(Style.run)
        Style.fontStandard = $('#about').width()
        setInterval(Style.checkFont, 500)
    },
    run: function() {
        for (rule in Style.rules) {
            Style.rules[rule]()
        }
    },
    fontStandard: null,
    checkFont: function() {
        if ($('#about').width() != Style.fontStandard) {
            Style.fontStandard = $('#about').width()
            Style.run()
        }
    },
    rules: {
        messages: function() {
            $('#messages').css('height', 
                $('#new').offset().top - $('#messages').offset().top)
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
        this.send('PUT', name)
    },
    send: function(method, data) {
          if (!data) data = {}
          if ('DELETE' == method || 'PUT' == method) {
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
    escape: function(html) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    },
    server: {
        receive: function(data) {
            if ('connect' == data.command) {
                var user = data
                // Prevent incorrect order of events on refresh
                setTimeout(function() {
                    Preved.server.connect(user)
                }, 1000)
            } else {
                Preved.server[data.command](data)
            }
		    },
        connect: function(params) {
            User.add(params.user, Preved.escape(params.name))
            Chat.sys(Preved.escape(params.name) + ' logged in.', 'in')
            if (params.user != Preved.me) {
                Preved.play('/sounds/connect.mp3')
            }
        },
        disconnect: function(params) {
            Chat.sys(User.name(params.user) + ' logged out.')
            User.remove(params.user, 'out')
            if (params.user != Preved.me) {
                Preved.play('/sounds/disconnect.mp3')
            }
        },
        message: function(params) {
            //TODO debug in Opera
            Chat.msg(params.user, Preved.escape(params.text))
            if (params.user != Preved.me) {
                Preved.play('/sounds/message.mp3')
            }
        },
        user: function(params) {
            User.rename(params.user, Preved.escape(params.name))
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
    $('#users > li').data('count', 0)
    
    $('#new textarea').keypress(function(e) {
      // Safari sends ASCII 3 on Enter
        if (13 == e.keyCode || 3 == e.keyCode) {
            if (e.ctrlKey || e.metaKey) {
                //TODO
            } else {
                $('#new').submit()
            }
        }
    })
    $('#new textarea').keyup(function(e) {
        if (13 == e.keyCode || 3 == e.keyCode) {
            $('#new textarea').val('')
        }
    })
    $('#new').submit(function() {
        var text = $('#new textarea').val()
        if ('' == text) return false
        $('#new textarea').val('')
        Preved.message(text)
        return false
    })
    $('#new textarea').focus()
    
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
    
    setInterval(Chat.time, 5 * 60 * 1000)
    
    Style.init()
})

$(window).unload(function() {
    Preved.send('DELETE') //TODO debug
})
