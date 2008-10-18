class RoomsController < ApplicationController
  include JuggernautJSON
  
  skip_before_filter :verify_authenticity_token
  
  before_filter :find_room_and_user,  :only => [:destroy, :update, :create]
  before_filter :find_place,          :only => [:destroy, :update]
  before_filter :destroy_place,       :only => :destroy
  before_filter :update_place,        :only => :update
  before_filter :init_place,          :only => :show
  
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
    user
    render :nothing => true
  end
      
  private
    
  def find_room_and_user
    @room = Room.find_by_permalink params[:id]
    @user = User.find cookies['user']
  end

  def init_place
    @room   = Room.find_or_create_by_permalink params[:id]
    @user   = User.find_or_create_by_id cookies['user']
    @place  = Place.create(:user => @user, :room => @room)
  end
  
  def find_place
    @place = Place.find(:first, :conditions=>{:user_id => @user.id, :room_id => @room.id})
  end
  
  def update_place
    @place.update_attributes!(:name => params[:name])
    @user.update_attributes!(:name => params[:name])
  end
  
  def destroy_place
    @place.destroy
  end  
  
  def save_to_cookie
    cookies['user'] = @user.id.to_s
  end  
end
