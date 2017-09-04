define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');

  var contentsView = require('./contentsView');

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

      if (Adapt.course.has('_globals') && Adapt.course.get('_globals')._extensions && Adapt.course.get('_globals')._extensions._contents && Adapt.course.get('_globals')._extensions._contents.pageLevelProgressIndicatorBar) {
        this.ariaText = Adapt.course.get('_globals')._extensions._contents.pageLevelProgressIndicatorBar + ' ';
      }

      this.render();

      _.defer(_.bind(function() {
        this.updateProgressBar();
      }, this));
    },

    events: {
      'click': 'onProgressClicked',
    },


    render: function() {
      console.log(components);
      var components = this.collection.toJSON();
      var data = {
        components: components,
        _globals: Adapt.course.get('_globals')
      };

      // the drawer
      contentsView.createContents(data);

      contentsView.listenForCompletition();

      // the button
      var navTemplate = Handlebars.templates['pageLevelProgressNavigation'];
      $('.navigation-drawer-toggle-button').after(this.$el.html(navTemplate(data)));
      return this;
    },

    refreshProgressBar: function() {
      var currentPageComponents = this.model.findDescendants('components').where({
        '_isAvailable': true
      });
      var availableChildren = completionCalculations.filterAvailableChildren(currentPageComponents);
      var enabledProgressComponents = completionCalculations.getPageLevelProgressEnabledModels(availableChildren);

      this.collection = new Backbone.Collection(enabledProgressComponents);
      this.updateProgressBar();
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
      if ($('body').hasClass('toc-hide')) {
        Adapt.trigger('contents:open');
      } else {
        Adapt.trigger('contents:close');
      }
    }
  });



  Adapt.on('contents:open', function() {
    $('body').removeClass('toc-hide');
  });

  Adapt.on('contents:close', function() {
    $('body').addClass('toc-hide');
  });

  Adapt.on('sideView:open', function() {
    $('body').addClass('toc-hide');
  });

  Adapt.on('sideView:close', function() {
    $('body').removeClass('toc-hide');
  });

  return PageLevelProgressNavigationView;

});
