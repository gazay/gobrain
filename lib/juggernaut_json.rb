module JuggernautJSON
  class Helper
    include Singleton
    include ERB::Util

    def self.h(data)
      instance.send :html_escape, data
    end
  end
    
  def escaped_json(data)
    data.inject({}) {|escaped_data,(k,v)| escaped_data.merge k => Helper.h(v) }.to_json
  end
  
  def send_json(data)
    data.merge! :command => caller.first[/`([^']*)'/, 1]
    Juggernaut.send_to_channel escaped_json(data), @room.permalink
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