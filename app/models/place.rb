class Place < ActiveRecord::Base
  belongs_to :user
  belongs_to :room
  
  validates_presence_of :user, :room
  
  default_value_for :name do |it|
    it.user.name
  end
end
