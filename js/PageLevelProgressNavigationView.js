define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');

  var PageLevelProgressView = require('extensions/adapt-contents/js/PageLevelProgressView');

  var PageLevelProgressNavigationView = Backbone.View.extend({

    tagName: 'button',

    className: 'base page-level-progress-navigation',

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);
      this.listenTo(Adapt, 'router:location', this.updateProgressBar);
      this.listenTo(Adapt, 'pageLevelProgress:update', this.refreshProgressBar);
      this.listenTo(this.collection, 'change:_isInteractionComplete', this.updateProgressBar);
      this.listenTo(this.model, 'change:_isInteractionComplete', this.updateProgressBar);
      this.$el.attr('role', 'button');
      this.ariaText = '';

      if (Adapt.course.has('_globals') && Adapt.course.get('_globals')._extensions && Adapt.course.get('_globals')._extensions._pageLevelProgress && Adapt.course.get('_globals')._extensions._pageLevelProgress.pageLevelProgressIndicatorBar) {
        this.ariaText = Adapt.course.get('_globals')._extensions._pageLevelProgress.pageLevelProgressIndicatorBar + ' ';
      }

      this.render();

      _.defer(_.bind(function() {
        this.updateProgressBar();
      }, this));
    },

    events: {
      'click': 'onProgressClicked'
    },

    render: function() {
      console.log(components);
      var components = this.collection.toJSON();
      var data = {
        components: components,
        _globals: Adapt.course.get('_globals')
      };

      // the drawer
      $('body').append('<div class="contents"><div class="contents-inner"></div></div>');
      var components = this.collection.toJSON();
      var data = {
        components: components,
        _globals: Adapt.course.get('_globals')
      };
      var plpTemplate = Handlebars.templates['pageLevelProgress'];
      console.log(this.$el.html(plpTemplate(data)));
      $('.contents-inner').html(plpTemplate(data));

      // the button
      var template = Handlebars.templates['pageLevelProgressNavigation'];
      $('.navigation-drawer-toggle-button').after(this.$el.html(template(data)));
      return this;
    },

    refreshProgressBar: function() {
      var currentPageComponents = this.model.findDescendants('components').where({'_isAvailable': true});
      var availableChildren = completionCalculations.filterAvailableChildren(currentPageComponents);
      var enabledProgressComponents = completionCalculations.getPageLevelProgressEnabledModels(availableChildren);

      this.collection = new Backbone.Collection(enabledProgressComponents);
      this.updateProgressBar();
    },

    updateProgressBar: function() {
      var completionObject = completionCalculations.calculateCompletion(this.model);

      //take all assessment, nonassessment and subprogress into percentage
      //this allows the user to see if assessments have been passed, if assessment components can be retaken, and all other component's completion

      var completed = completionObject.nonAssessmentCompleted + completionObject.assessmentCompleted + completionObject.subProgressCompleted;
      var total = completionObject.nonAssessmentTotal + completionObject.assessmentTotal + completionObject.subProgressTotal;

      var percentageComplete = Math.floor((completed / total) * 100);

      this.$('.page-level-progress-navigation-bar').css('width', percentageComplete + '%');

      // Add percentage of completed components as an aria label attribute
      this.$el.attr('aria-label', this.ariaText + percentageComplete + '%');

      // Set percentage of completed components to model attribute to update progress on MenuView
      this.model.set('completedChildrenAsPercentage', percentageComplete);
    },

    onProgressClicked: function(event) {
      var $body = $('body');
      if ($body.hasClass('toc-hide')) {
        $body.removeClass('toc-hide');
      }
      else {
        $body.addClass('toc-hide');
      }

    }

  });

  return PageLevelProgressNavigationView;

});
