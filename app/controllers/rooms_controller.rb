class RoomsController < ApplicationController
  include JuggernautJSON
  
  skip_before_filter :verify_authenticity_token
  
  before_filter :init_place,    :only => :show
  before_filter :destroy_place, :only => :destroy
  before_filter :find_place,    :only => [:create, :update]  
  before_filter :update_place,  :only => :update
  
  def index
    redirect_to "/#{Faker::Internet.domain_word}"
  end
  
  def show    
    connect
    save_to_cookie
  end

  def destroy
    disconnect
    render :nothing => true
  end

  def create
    message
    render :nothing => true
  end
  
  def update
    if params[:name]
      user
    elsif params[:theme]
      theme
    elsif params[:broadcast]
      broadcast
    else
      raise ActiveRecord::RecordNotFound
    end
    render :nothing => true
  end
      
  private

  def alive?
    Juggernaut.client_in_channel?(@user.id, @room.permalink)
  end
  
  def init_place
    @room = Room.find_or_create_by_permalink params[:id]
    @user = User.find_or_initialize_by_id cookies['user']
    @new_user = true if @user.new_record?
    @user.save!
    
    @place = Place.find_by_room_id_and_user_id(@room, @user) || 
    @place = Place.create(:user => @user, :room => @room)    
  end
    
  def find_place
    @room = Room.find_by_permalink params[:id]
    @user = User.find cookies['user']
    raise unless @place = Place.find_by_room_id_and_user_id(@room, @user)
  end

  def destroy_place
    @user = User.find params[:client_id]
    @room = Room.find_by_permalink params[:channels].first
    @place = Place.find_by_room_id_and_user_id(@room, @user)
    @place.destroy
  end  
  
  def update_place
    if params[:name]
      @place.update_attributes!(:name => params[:name])
      @user.update_attributes!(:name => params[:name])
    elsif params[:theme]
      @room.update_attributes!(:theme => params[:theme])
    end
  end
    
  def save_to_cookie
    cookies['user'] = @user.id.to_s
  end  
end
