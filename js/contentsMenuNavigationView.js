define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');
  var contentsView = require('./contentsView');

  var contentsMenuNavigationView = Backbone.View.extend({

    tagName: 'button',

    className: 'base contents-navigation contents-navigation-icon',

    initialize: function() {
      this.remove();
      this.listenTo(Adapt, 'router:location', this.remove);
      var template = Handlebars.templates.contentsProgressBarNavigation;
      $('.navigation-inner').append(this.$el.html(template({showLabel: Adapt.course.get('_contents')._progressBar._showPercentage})));
      this.postRender();
    },

    postRender: function() {
      var total = this.getPages();
      var completed = this.getCompletedPages();
      var percentageComplete = Math.floor((completed / total) * 100);
      this.$('.contents-progress-navigation-bar').css('width', percentageComplete + '%');
      $('.contents-progress-navigation-prompt-percent').text(percentageComplete);
      this.$el.attr('aria-label', this.ariaText + percentageComplete + '%');
    },

    getCompletedPages: function() {
      var completedPages = 0;
      _.each(Adapt.contentObjects.models, function(model) {
        if (model.get('_isComplete'))
          completedPages++;
      });
      return completedPages;
    },

    getPages: function() {
      return Adapt.contentObjects.length;
    }
  });

  return contentsMenuNavigationView;
});
