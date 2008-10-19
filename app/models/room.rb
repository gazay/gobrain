class Room < ActiveRecord::Base
  has_many :places, :dependent => :delete_all
  has_many :users, :through => :places
  
  validates_presence_of :permalink
  validates_uniqueness_of :permalink
  
  default_value_for :theme, 'sky'
  
  def to_param
    permalink
  end
end
