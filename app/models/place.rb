class Place < ActiveRecord::Base
  belongs_to :user
  belongs_to :room
  
  validates_presence_of :user, :room
  
  default_value_for(:name) {|it| it.user.name }
  default_value_for(:connected_time) { Time.now.utc }  
  default_value_for(:connections) { 1 }
end
