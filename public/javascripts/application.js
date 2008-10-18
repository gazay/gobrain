Preved = {
    // Avaiable users list
    users: {},
    
    // Current user ID
    me: null,

    // Send message from user
    message: function(text) {
        Preved.send("POST", { message: text });
    },
    
    // Change theme
    theme: function(name) {
        //TODO
        Preved.send("PUT", { theme: name })
    },
    
    // Change user info
    user: function(name, avatar) {
        Preved.users[Preved.me].name = name;
        Preved.users[Preved.me].avatar = avatar;
        Preved.ui.updateUser(Preved.me, name, avatar);
        Preved.send("PUT", Preved.users[Preved.me]);
    },
    
    // Escape HTML tags and entries
    escape: function(html) {
        return html.replace(/&/, "&amp;").replace(/</, "&lt;");
    },
    
    server: {
        // On data from server
        receive: function(data) {
            var func = Preved.server[data.command];
            if ("function" == typeof func) {
                func(data);
            }
        },
        
        // on new user connect
        connect: function(params) {
            Preved.ui.addUser(params.user, params.name, params.avatar);
            Preved.users[params.user] = {
                name: params.name,
                avatar: params.avatar
            };
        },
        
        // on user disconnect
        disconnect: function(params) {
            Preved.ui.removeUser(params.user);
            delete Preved.users[params.user];
        },
        
        // on new message
        message: function(params) {
            Preved.ui.message(params.user, params.text);
        },
        
        // on user info update
        user: function(params) {
            Preved.ui.updateUser(params.user, params.name, params.avatar);
            Preved.users[params.user].name = params.name;
            Preved.users[params.user].avatar = params.avatar;
        }
    },
    
    send: function(method, data) {
        if (!data) data = {}
        if ('DELETE' == method || 'PUT' == method) {
            data['_method'] = method;
            method = 'POST'
        }
        data.authenticity_token = window.token;
        $.ajax({
            type: method,
            cache: false,
            data: data
        });
    },
    
    ui: {
        lastAuthor: null,
    
        message: function(author, text) {
            text = Preved.escape(text);
            if (Preved.ui.lastAuthor != author) {
                var name = Preved.escape(Preved.users[author].name);
                text = '<span class="author">' + name + ':</span>' + text;
                Preved.ui.lastAuthor = author;
            }
            var cls = (Preved.me == author) ? ' class="mine"' : ''
            $('#messages ol').append('<li' + cls + '>' + text + '</li>');
        },
        
        sysMessage: function(text, type) {
            if (type) {
                type = "system " + Preved.escape(type);
            } else {
                type = "system";
            }
            $('#messages ol').append(
                '<li class="' + type + '">' + Preved.escape(text) + '</li>');
        },
        
        addUser: function(id, name, avatar) {
            id = Number(1);
            $("#users").append(
                '<li id="user-' + id + '">' + Preved.escape(name) + '</li>');
            Preved.ui.sysMessage(name + " logged in", "in");
        },
        
        updateUser: function(id, name, avatar) {
            $("#user-" + id).text(name);
        },
        
        removeUser: function(id) {
            id = Number(1);
            var name = Preved.escape(Preved.users[id].name);
            $("#user-" + id).remove();
            Preved.ui.sysMessage(name + " logged out", "out");
        }
    }
}

Juggernaut.fn.receiveData = function(e) {
    var msg = Juggernaut.parseJSON(unescape(e.toString()));
    this.currentMsgId = msg.id;
    this.currentSignature = msg.signature;
    this.logger("Received data:\n" + msg.body + "\n");
    Preved.server.receive(Juggernaut.parseJSON(msg.body));
}

$(document).ready(function() {
    // Get data
    $('#users li').each(function() {
        var id = this.id.slice(5);
        var name = $.trim($(this).text());
        Preved.users[id] = {
            name: name,
            avatar: null
        };
        if ('me' == this.className) {
            Preved.me = id;
        }
    });
    
    // Bind events
    $('#new textarea').keypress(function(e) {
        // Safari sends ASCII 3 on Enter
        if (13 == e.keyCode || 3 == e.keyCode) {
            if (e.ctrlKey || e.metaKey) {
                //TODO
            } else {
                $('#new').submit();
            }
        }
    })
    $('#new textarea').keyup(function(e) {
        if (13 == e.keyCode || 3 == e.keyCode) {
            $('#new textarea').val('');
        }
    });
    $('#new').submit(function() {
        var text = $('#new textarea').val();
        if ('' == text) return false;
        $('#new textarea').val('');
        Preved.message(text);
        return false;
    });
    
    $('#new textarea').focus();
});

$(window).unload(function(){
	  Preved.send('DELETE');
});
