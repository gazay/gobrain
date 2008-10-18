class Place < ActiveRecord::Base
  belongs_to :user
  belongs_to :room
  
  validates_presence_of :user, :room
end
