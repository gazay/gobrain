require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe User do
  
  describe "should be valid" do
    it "with valid attributes" do
      Factory.build(:user).should be_valid
    end
  end

  describe "should be invalid" do
    
    it "with blank name" do
      Factory.build(:user, :name => '').should_not be_valid
    end
  end
end
