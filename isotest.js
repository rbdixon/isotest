Blocks = new Meteor.Collection("blocks");

if (Meteor.isClient) {
  var container = {};

  Template.container.rendered = function () {
    container = $(this.find("#container"));
  }

  Template.block.rendered = function () {
    var items = container.find(".item");
    // console.log("Running rendered for container with " + items.length + " blocks");
    if ((!container.hasClass("isotope")) && (items.length == Blocks.find().count())) {
      // This seems to run once per block. Wasteful.
      // console.log("Initialize isotope");
      // Initialize isotope
      container.isotope({
        itemSelector : '.item',
        layoutMode : 'fitRows',
        getSortData : {
          number : function( $elem ) {
            return parseInt( $elem.text(), 10 );
          }
        }
      });
      container.isotope({sortBy: "number"});
    } else if (container.hasClass("isotope")) {
      console.log("Updating isotope");
      container.isotope('addItems', $(this.find(".item:not(.isotope-item)")), function() {
        container.isotope({sortBy: "number"});
      });
    }
  }

  Template.container.blocks = function () {
    return Blocks.find();
  };

  Template.block.destroyed = function () {
    console.log("Running destroy for block " + this.data.num);
    container.isotope({sortBy: "number"});
  }
}

if (Meteor.isServer) {
  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function rejigger() {
    var i = getRandomInt(0, Blocks.find().count()-1);
    var num = getRandomInt(0,100);
    var item = Blocks.find().fetch()[i];
    var c = getRandomInt(0,2);

    if (c==0) {
      // Add
      console.log("Add");
      Blocks.insert({num: num});
    } else if (c==1) {
      // Remove
      console.log("Remove");
      if (item) {
        Blocks.remove(item._id);
      }
    } else if (c==2) {
      // Fiddle
      console.log("Fiddle");
      if (item) {
        Blocks.update(item._id, {num: num});
      }
    }
  }

  Meteor.startup(function () {
    // code to run on server at startup
    while (Blocks.find().count() < 10) {
      Blocks.insert({
        num: Blocks.find().count() + 1
      });
    }

    Meteor.setInterval(rejigger, 1000);
  });
}
