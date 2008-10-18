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
    isLast: function(id) {
        if ($('#messages li:last').hasClass('system')) {
            return false;
        }
        return $('#messages li .author:last').hasClass('user' + id)
    },
    add: function(message, type){
        return $('<li/>').text(message).addClass(type)
    },
    sys: function(message, type){
        var msg = this.add(message, 'system ' + type)
        msg.appendTo('#messages')
    },
    write: function(user, message){
        var message = this.add(message)
        if (!Chat.isLast(user)) {
            $('<span/>').addClass('author user' + user).text(
                    User.name(user)+': ').prependTo(message)
        }
        if (Preved.me == user) message.addClass('mine')
        message.appendTo('#messages')
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
      theme: function(name){
          this.send('PUT', { theme: name })
      },
      user: function(name){
          this.send('PUT', name)
      },
      send: function(method, data){
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
      server: {
          receive: function(data){ this[data.command](data) },
          connect: function(params){
              User.add(params.user, params.name)
              Chat.sys(params.name + ' logged in.', 'in')
              if (params.user != Preved.me) {
                  Preved.play('/sounds/connect.mp3')
              }
          },
          disconnect: function(params){
              Chat.sys(User.name(params.user) + ' logged out.')
              User.remove(params.user, 'out')
              if (params.user != Preved.me) {
                  Preved.play('/sounds/disconnect.mp3')
              }
          },
          message: function(params){
              Chat.write(params.user, params.text)
              if (params.user != Preved.me) {
                  Preved.play('/sounds/message.mp3')
              }
          },
          user: function(params){
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
})
