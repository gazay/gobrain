module JuggernautJSON

  def send_json(data)
    data.merge! :command => caller.first[/`([^']*)'/, 1]
    Juggernaut.send_to_channel data.to_json, @room.permalink
  end
  
  def connect
    send_json :user => @user.id, :name => @place.name
  end
  
  def disconnect
    send_json :user => @user.id
  end
  
  def message
    send_json :user => @user.id, :text => params[:message]
  end
  
  def user
    send_json :user => @user.id, :name => @place.name
  end
end