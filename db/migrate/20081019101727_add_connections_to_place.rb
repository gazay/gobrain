class AddConnectionsToPlace < ActiveRecord::Migration
  def self.up
    add_column :places, :connections, :integer, :default => 0
  end

  def self.down
    remove_column :places, :connections
  end
end
