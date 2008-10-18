Preved = {
    users: {},
    
    // Current user ID
    me: null,

    // Send message from user
    message: function(text) {
        Preved.ui.message(Preved.my.name, text);
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
            var func = Preved.in[data.command];
            if ("undefined" != data.command && "function" == func) {
                func(data);
            }
        },
        
        // on new user connect
        connect: function(params) {
            Preved.ui.addUser(params.id, params.name, params.avatar);
            Preved.users[params.id] = {
                name: params.name,
                avatar: params.avatar
            };
        },
        
        // on user disconnect
        disconnect: function(params) {
            Preved.ui.removeUser(params.id);
            delete Preved.users[params.id];
        },
        
        // on new message
        message: function(params) {
            Preved.ui.message(params.from, params.text);
        },
        
        // on user info update
        user: function(params) {
            Preved.ui.updateUser(params.id, params.name, params.avatar);
            Preved.users[params.id].name = params.name;
            Preved.users[params.id].avatar = params.avatar;
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
            url: '',
            cache: false,
            data: data
        });
    },
    
    ui: {
        lastAuthor: null,
    
        message: function(author, text) {
            if (Preved.ui.lastAuthor != author) {
                var name = Preved.escape(Preved.users[author].name);
                text = '<span class="author">' + name + '</span>';
                Preved.ui.lastAuthor = author;
            }
            var cls = (Preved.me == author) ? ' class="mine"' : ''
            $('#messages ol').append(
                '<li' + cls + '>' + Preved.escape(text) + "</li>");
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
            id = Preved.escape(id);
            $("#users").append(
                '<li id="user-' + id + '">' + Preved.escape(name) + '</li>');
            Preved.ui.sysMessage(name + " logged in", "in");
        },
        
        updateUser: function(id, name, avatar) {
            $("#user-" + id).text(name);
        },
        
        removeUser: function(id) {
            id = Preved.escape(id);
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
    Preved.server.receive(msg.body);
}

$(document).ready(function() {
    //TODO
});

$(window).unload(function(){
	  Preved.send('DELETE');
});
