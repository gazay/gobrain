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
    connect if @place.connections == 1
    save_to_cookie
  end

  def destroy
    disconnect if @place.connections == 0
    render :nothing => true
  end

  def create
    message
    render :nothing => true
  end
  
  def update
    user
    render :nothing => true
  end
      
  private

  def init_place
    @room = Room.find_or_create_by_permalink params[:id]
    @user = User.find_by_id cookies['user']
    if not @user
        @user = User.find_or_create_by_id cookies['user']
        @new_user = true
    end
    
    @place = Place.find_by_room_id_and_user_id(@room, @user) || 
    @place = Place.create(:user => @user, :room => @room)
    
    @place.increment!(:connections)
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
    @place.decrement!(:connections)
  end  
  
  def update_place
    @place.update_attributes!(:name => params[:name])
    @user.update_attributes!(:name => params[:name])
  end
    
  def save_to_cookie
    cookies['user'] = @user.id.to_s
  end  
end
