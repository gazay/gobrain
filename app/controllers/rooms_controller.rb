class RoomsController < ApplicationController
  before_filter :find_room, :only => [:update, :destroy]
    
  def show
    @room = Room.find_or_create_by_permalink params[:id]
    @user = User.find_or_create_by_id cookies['user']
    Place.create(:user => @user, :room => @room)
    Juggernaut.send_to_channel "add_user(#{@user.id}, '#{h @user.name}')", @room.permalink
    save_to_cookie
  end

  def destroy
    @user = User.find cookies['user']
    Place.find(:first, :conditions=>{:user_id => @user.id, :room_id => @room.id}).destroy
    Juggernaut.send_to_channel "remove_user(#{@user.id})", @room.permalink
    render :nothing => true
  end
  
  def update
    Juggernaut.send_to_channel "update_chat('#{h params[:message]}')", @room.permalink
    render :nothing => true
  end
      
  private
  
  def find_room
    @room = Room.find_by_permalink params[:id]
  end
  
  def save_to_cookie
    cookies['user'] = @user.id.to_s
  end
  
  def h(code)
    help.escape_javascript code
  end
end
