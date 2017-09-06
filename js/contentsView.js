define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var contentsView = Backbone.View.extend({
    initialize: function() {
      console.log(this);
      this.createContents();
      this.populateContents(this.model);
      this.listenForCompletition();
    },

    createContents: _.once(function() {
      $('body').append('<div class="contents"><div class="contents-inner"></div></div>');
    }),

    populateContents: function(data) {
      var plpTemplate = Handlebars.templates['pageLevelProgress'];
      $('.contents-inner').html(plpTemplate(data));
    },

    listenForCompletition: function() {
      var componentsPLP = Adapt.findById(Adapt.location._currentId).findDescendants('components').filter(function(model) {
        if (!model.get('_contents') || !model.get('_contents')._isEnabled)
          return false;
        return true;
      });
      _.each(componentsPLP, function(component, index) {
        component.on("change", function() {
          if (component.hasChanged("_isComplete")) {
            var $PlpItem = $('.page-level-progress-indicator').get(index);
            $($PlpItem).removeClass('page-level-progress-indicator-incomplete').addClass('page-level-progress-indicator-complete');
          }
        });
      });
    },

    placeInContents: function() {}

  });

  Adapt.on('router:menu', function() {
    Adapt.trigger('contents:close');
  });

  Adapt.on('router:page', function() {
    Adapt.trigger('contents:open');
  });

  $('body').on('click', '.page-level-progress-item button', function(event) {
    console.log('scroll to ' + event.currentTarget);
    if (event && event.preventDefault)
      event.preventDefault();
    var currentComponentSelector = '.' + $(event.currentTarget).attr('data-page-level-progress-id');
    var $currentComponent = $(currentComponentSelector);
    Adapt.scrollTo($currentComponent, {duration: 400});
  });

  return contentsView;
});

// function createContents() {
//   $('body').append('<div class="contents"><div class="contents-inner"></div></div>');
// }
//
// function populateContents(data) {
//   var plpTemplate = Handlebars.templates['pageLevelProgress'];
//   $('.contents-inner').html(plpTemplate(data));
// }
//
// function listenForCompletition() {
//   var componentsPLP = Adapt.findById(Adapt.location._currentId).findDescendants('components').filter(function(model) {
//     if (!model.get('_contents') || !model.get('_contents')._isEnabled)
//       return false;
//     return true;
//   });
//
//   _.each(componentsPLP, function(component, index) {
//     component.on("change", function() {
//       if (component.hasChanged("_isComplete")) {
//         var $PlpItem = $('.page-level-progress-indicator').get(index);
//         $($PlpItem).removeClass('page-level-progress-indicator-incomplete').addClass('page-level-progress-indicator-complete');
//       }
//     });
//   });
// }
//

//
// return {createContents: createContents, listenForCompletition: listenForCompletition, populateContents: populateContents};
