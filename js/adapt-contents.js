define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');

  var PageLevelProgressMenuView = require('extensions/adapt-contents/js/PageLevelProgressMenuView');
  var contentsNavigationView = require('extensions/adapt-contents/js/contentsNavigationView');

  function setupPageLevelProgress(pageModel, contentsList) {
    new contentsNavigationView({
      model: pageModel,
      collection: contentsList
    });
  }

  // This should add/update progress on menuView
  Adapt.on('menuView:postRender', function(view) {

    if (view.model.get('_id') == Adapt.location._currentId) return;

    // do not proceed until pageLevelProgress enabled on course.json
    if (!Adapt.course.get('_contents') || !Adapt.course.get('_contents')._isEnabled) {
      return;
    }

    var pageLevelProgress = view.model.get('_contents');
    var viewType = view.model.get('_type');

    // Progress bar should not render for course viewType
    if (viewType == 'course') return;

    if (pageLevelProgress && pageLevelProgress._isEnabled) {
      var completionObject = completionCalculations.calculateCompletion(view.model);

      //take all non-assessment components and subprogress info into the percentage
      //this allows the user to see if the assessments are passed (subprogress) and all other components are complete

      var completed = completionObject.nonAssessmentCompleted + completionObject.subProgressCompleted;
      var total = completionObject.nonAssessmentTotal + completionObject.subProgressTotal;

      var percentageComplete = Math.floor((completed / total) * 100);

      view.model.set('completedChildrenAsPercentage', percentageComplete);

      view.$el.find('.menu-item-inner').append(new PageLevelProgressMenuView({
        model: view.model
      }).$el);

    }

  });

  // This should add/update progress on page navigation bar
  Adapt.on('router:page', function() {

    // do not proceed until pageLevelProgress enabled on course.json
    if (!Adapt.course.get('_contents') || !Adapt.course.get('_contents')._isEnabled) {
      return;
    }


    var contentObjects = [];

    if (!Adapt.course.get('_contents')._courseNavigation || !Adapt.course.get('_contents')._courseNavigation._isEnabled) {
      contentObjects.push(Adapt.contentObjects._byAdaptID[Adapt.location._currentId][0]);
    } else {
      contentObjects = Adapt.contentObjects.models;
    }
    var contentsList = [];

    _.each(contentObjects, function(item, index) {
      var contents;
      var pageModel = item;
      var currentPageComponents = pageModel.findDescendants('components').where({
        '_isAvailable': true
      });
      var availableComponents = completionCalculations.filterAvailableChildren(currentPageComponents);
      var pageComponents = completionCalculations.getPageLevelProgressEnabledModels(availableComponents);
      if (Adapt.course.get('_contents')._showArticleTitles) {
        contents = completionCalculations.generateListWithTitles(pageModel.findDescendants('articles').models, pageComponents);
      } else {
        contents = pageComponents;
      }
      contentsList.push({
        "contentObject": contentObjects[index],
        "contents": contents
      });
    });

    if (contentsList.length > 0) {
      setupPageLevelProgress(Adapt.contentObjects._byAdaptID[Adapt.location._currentId][0], contentsList);
    }

  });

});
