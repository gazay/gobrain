require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Place do
  describe "should be valid" do
    it "with valid attributes" do
      Factory.build(:place).should be_valid
    end
  end

  describe "should be invalid" do
    
    it "without room" do
      Factory.build(:place, :without => :room).should_not be_valid
    end

    it "without user" do
      Factory.build(:place, :without => :user).should_not be_valid
    end    
  end
end
