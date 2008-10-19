class User < ActiveRecord::Base
  has_many :places, :dependent => :delete_all
  has_many :rooms, :through => :places
  
  validates_presence_of :name

  named_scope :inside, lambda {|room|
    { :conditions => ["places.room_id = ?", room.id], :include => :places }
  }

  default_value_for :name do
    Faker::Internet.user_name
  end
end
