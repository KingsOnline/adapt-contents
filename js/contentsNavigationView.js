define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');
  var contentsView = require('./contentsView');

  var contentsNavigationView = Backbone.View.extend({

    tagName: 'button',

    className: 'base contents-navigation contents-navigation-icon',

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);

      this.$el.attr('role', 'button');
      this.ariaText = '';

      if (Adapt.course.has('_globals') && Adapt.course.get('_globals')._extensions && Adapt.course.get('_globals')._extensions._contents && Adapt.course.get('_globals')._extensions._contents.pageLevelProgressIndicatorBar) {
        this.ariaText = Adapt.course.get('_globals')._extensions._contents.pageLevelProgressIndicatorBar + ' ';
      }
      this.render();
      if(!Adapt.course.get('_contents')._progressBar._isEnabled) return;
      this.updateProgressBar();
    },

    events: {
      'click': 'onContentsClicked'
    },

    render: function() {
      var data = {
        pages: this.collection,
        _globals: Adapt.course.get('_globals')
      };
      new contentsView({
        model: data
      });
      var navTemplate;
      if(Adapt.course.get('_contents')._progressBar._isEnabled) {
        navTemplate = Handlebars.templates.contentsProgressBarNavigation;
        this.listenTo(Adapt, 'contents:componentComplete', this.updateProgressBar);
      } else {
        navTemplate = Handlebars.templates.contentsNavigation;
      }
      $('.navigation-inner').append(this.$el.html(navTemplate({showLabel: Adapt.course.get('_contents')._progressBar._showPercentage})));
      return this;
    },

    updateProgressBar: function() {
      var currentPageComponents = _.filter(this.model.findDescendantModels('components'), function(comp) {
          return comp.get('_isAvailable') === true;
      });
      var availableChildren = completionCalculations.filterAvailableChildren(currentPageComponents);
      var enabledProgressComponents = completionCalculations.getPageLevelProgressEnabledModels(availableChildren);
      var currentPageModel = Adapt.findById(Adapt.location._currentId);
      var calculations = completionCalculations.calculateCompletion(currentPageModel);
      var complete = calculations.nonAssessmentCompleted + calculations.assessmentCompleted;
      var total = calculations.nonAssessmentTotal + calculations.assessmentTotal;
      var percentageComplete = complete / total * 100;
      console.log(percentageComplete)
      this.$('.contents-progress-navigation-bar').css('width', percentageComplete + '%');

      // Add percentage of completed components as an aria label attribute
      this.$el.attr('aria-label', this.ariaText +  percentageComplete + '%');

      // Set percentage of completed components to model attribute to update progress on MenuView
      this.model.set('completedChildrenAsPercentage', percentageComplete);
      $('.contents-progress-navigation-prompt-percent').text(percentageComplete);
    },

    onContentsClicked: function(event) {
      event.preventDefault();
      if (!($('body').hasClass('contents-show'))) {
        Adapt.trigger('contents:open');
        Adapt.trigger('sideView:close');
      } else {
        Adapt.trigger('contents:close');
      }
    }
  });

  return contentsNavigationView;
});
