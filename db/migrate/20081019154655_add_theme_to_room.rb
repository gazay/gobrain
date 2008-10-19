class AddThemeToRoom < ActiveRecord::Migration
  def self.up
    add_column :rooms, :theme, :string
  end

  def self.down
    remove_column :rooms, :theme
  end
end
