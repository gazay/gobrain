function update_chat(message){
	$('<div/>').appendTo('#chat').text(message)
};

function add_user(id, name){
	if (!$('#user-' + id).length) {
		$('<li/>').appendTo('#users').text(name).attr('id', 'user-' + id)
	}
};

function remove_user(id){
	if ($.cookie('user') != String(id)) {
		var name = $('#user-'+id).text();
		$('#user-'+id).remove();
		update_chat(name + ' logged out')		
	}
};

$(function(){
	$('.edit_room').ajaxForm()
});

Preved = {
    users: {},
    
    me: null,

    // Send message
    message: function(text) {
        Preved.ui.message(Preved.users[Preved.me].name, text);
        //TODO send
    },
    
    // Change place
    place: function(name) {
        //TODO
    },
    
    // Change user info
    user: function(name, avatar) {
        Preved.ui.updateUser(Preved.me, name, avatar);
        $.cookie("name", name);
        $.cookie("avatar", avatar);
        //TODO send
    },
    
    server: {
        // On data from server
        receive: function(data) {
            var func = Preved.server[data.command];
            if ("undefined" != data.command && "function" == func) {
                func(data);
            }
        },
        
        // on new user connect
        connect: function(params) {
            Preved.users[params.id] = {
                name: params.name,
                avatar: params.avatar
            };
            Preved.ui.addUser(params.id, params.name, params.avatar);
        },
        
        // on user disconnect
        disconnect: function(params) {
            delete Preved.users[params.id];
            Preved.ui.removeUser(params.id);
        },
        
        // on new message
        message: function(params) {
            var author = Preved.users[params.from].name;
            Preved.ui.message(author, params.text);
        },
        
        // on user info update
        user: function(params) {
            Preved.users[params.id].name = params.name;
            Preved.users[params.id].avatar = params.avatar;
            Preved.ui.updateUser(params.id, params.name, params.avatar);
        }
    },
    
    ui: {
        lastAuthor: null,
    
        message: function(author, text) {
            //TODO
        },
        
        addUser: function(id, name, avatar) {
            //TODO
        },
        
        updateUser: function(id, name, avatar) {
            //TODO
        },
        
        removeUser: function(id) {
            //TODO
        }
    }
}

Juggernaut.fn.receiveData = function(e) {
    var msg = Juggernaut.parseJSON(unescape(e.toString()));
    this.currentMsgId = msg.id;
    this.currentSignature = msg.signature;
    this.logger("Received data:\n" + msg.body + "\n");
    //TODO delete after remove all prototype code
    if ("object" == msg.body) {
        Preved.server.receive(msg.body);
    } else {
        eval(msg.body);
    }
}

$(window).unload(function(){
	$.ajax({
		type: 'POST',
		data: {
			authenticity_token: window.token,
			_method: 'delete',
		}
	})
});
