define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');
  var contentsView = require('./contentsView');

  var PageLevelProgressNavigationView = Backbone.View.extend({

    tagName: 'button',

    className: 'base contents-navigation',

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);

      this.$el.attr('role', 'button');
      this.ariaText = '';

      if (Adapt.course.has('_globals') && Adapt.course.get('_globals')._extensions && Adapt.course.get('_globals')._extensions._contents && Adapt.course.get('_globals')._extensions._contents.pageLevelProgressIndicatorBar) {
        this.ariaText = Adapt.course.get('_globals')._extensions._contents.pageLevelProgressIndicatorBar + ' ';
      }
      this.render();
    },

    events: {
      'click': 'onContentsClicked',
    },


    render: function() {
      var components = this.collection.toJSON();
      var data = {
        components: components,
        _globals: Adapt.course.get('_globals')
      };

      new contentsView({model: data});

      var navTemplate = Handlebars.templates.contentsNavigation;
      $('.navigation-inner').append(this.$el.html(navTemplate(data)));
      return this;
    },

    setupPLPListener: function() {
      var componentsPLP = Adapt.findById(Adapt.location._currentId).findDescendants('components').filter(function(model) {
        if (!model.get('_contents') || !model.get('_contents')._isEnabled) return false;
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

    onContentsClicked: function(event) {
      if ($('body').hasClass('toc-hide')) {
        Adapt.trigger('contents:open');
      } else {
        Adapt.trigger('contents:close');
      }
    }
  });

  return PageLevelProgressNavigationView;
});
