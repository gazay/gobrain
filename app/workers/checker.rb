class Checker < Workling::Base 
  def wait(options)
    sleep 10
    place = Place.find options[:place_id]
    
    logger.error place.user.id, place.room.permalink
    
    if !Juggernaut.client_in_channel?(place.user.id, place.room.permalink) and place.connections > 0
      place.decrement! :connections

      data = { :command => 'disconnect', :user => place.user.id }
      json = data.inject({}) {|escaped_data,(k,v)| escaped_data.merge k => JuggernautJSON::Helper.h(v) }.to_json
      
      Juggernaut.send_to_channel json, place.room.permalink
    end
  end
end
