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

$(window).unload(function(){
	$.ajax({
		type: 'POST',
		data: {
			authenticity_token: window.token,
			_method: 'delete',
		}
	})
});