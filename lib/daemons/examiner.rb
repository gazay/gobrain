#!/usr/bin/env ruby

# You might want to change this
ENV["RAILS_ENV"] ||= "production"

require File.dirname(__FILE__) + "/../../config/environment"

$running = true
Signal.trap("TERM") do 
  $running = false
end

class Examiner
  include JuggernautJSON
  
  def refresh_rooms
    Room.all.each do |room|
      # Rails.logger.info "REFRESHING #{room.permalink}"
      check room
    end
  end
  
  def check(room)
    # Rails.logger.info "CHECKING #{room.permalink}"
    unless (clients = inside(room)) == (users = room.users.map(&:id).sort)
      Rails.logger.info "INSIDE #{room.permalink}: #{clients.inspect} vs #{users.inspect}"
      (clients - users).each {|client| subscribe client, room }
      (users - clients).each {|user| unsubscribe user, room }
    end     
  end
  
  def inside(room)
    Juggernaut.show_clients_for_channels([room.permalink]).map {|it| it['client_id'] }.sort
  end
  
  def subscribe(id, room)
    # Rails.logger.info "SUBSCRIBING TO #{id}:#{room}"
    @room = room
    @user = User.find id    
    @place = Place.create :user => @user, :room => @room
    connect
  end
  
  def unsubscribe(id, room)
    # Rails.logger.info "UNSUBSCRIBING FROM #{id}:#{room}"
    @room = room
    @user = User.find id
    places = Place.find_all_by_room_id_and_user_id @room, @user
    places.each do |place|
      @place = place.destroy
      disconnect
    end
  end  
end

examiner = Examiner.new

while($running) do
  # Rails.logger.info 'NEW ROUND'
  examiner.refresh_rooms  
end