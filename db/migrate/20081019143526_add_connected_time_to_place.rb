class AddConnectedTimeToPlace < ActiveRecord::Migration
  def self.up
    add_column :places, :connected_time, :timestamp
  end

  def self.down
    remove_column :places, :connected_time
  end
end
