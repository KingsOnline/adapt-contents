define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');
  var contentsView = require('./contentsView');

  var contentsNavigationView = Backbone.View.extend({

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
      'click': 'onContentsClicked'
    },

    render: function() {
      var data = {
        pages: this.collection,
        _globals: Adapt.course.get('_globals')
      };
      new contentsView({model: data});

      var navTemplate = Handlebars.templates.contentsNavigation;
      $('.navigation-inner').append(this.$el.html(navTemplate(data)));
      return this;
    },

    onContentsClicked: function(event) {
      event.preventDefault();
      if ($('body').hasClass('toc-hide')) {
        Adapt.trigger('contents:open');
        Adapt.trigger('sideView:close');
      } else {
        Adapt.trigger('contents:close');
      }
    }
  });

  return contentsNavigationView;
});
