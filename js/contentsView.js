define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var completionCalculations = require('./completionCalculations');
  var circleProgress = require('libraries/circle-progress');

  var contentsView = Backbone.View.extend({

    className: 'contents',
    tagName: 'div',

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);
      this.setupListeners();
      this.listenTo(Adapt, 'pageView:postRender', this.render);
      if (Adapt.course.get('_contents')._showPagePosition) {
        this.listenTo(Adapt, 'pageView:ready', this.scrollHandler);
        this.listenTo(Adapt, 'router:location', this.stopScrollListener);
      }
      this.listenTo(Adapt, 'menuView:ready', this.offScrolllistener);
    },

    checkOverlayMode: function() {
      return Adapt.device.screenWidth <= 1025;
    },

    events: {
      'click .contents-item button': 'moveToComponent',
      'click .contents-landing-page-title': 'goToLandingPage',
      'click .contents-page-title': 'pageTitlePressed'
    },

    goToLandingPage: function(event) {
      Adapt.navigateToElement(Adapt.contentObjects.models[0].get('_id'), {
        duration: 400
      });
    },

    pageTitlePressed: function(event) {
      if (Adapt.course.get('_contents')._courseNavigation._allAccordions) {
        this.accordionPressed(event);
      } else {
        Adapt.navigateToElement($(event.currentTarget)[0].dataset.pageId, {
          duration: 400
        });
      }

    },

    accordionPressed: function(event) {
      var $toggleButton = $(event.currentTarget);
      var $accordionItem = $toggleButton.parent('.contents-page');
      if ($accordionItem.hasClass('active')) {
        $accordionItem.find('.contents-page-entries').slideUp(300);
        $accordionItem.removeClass('active');
      } else {
        $accordionItem.find('.contents-page-entries').slideDown(300);
        $accordionItem.addClass('active');
      }
    },

    setupListeners: function() {
      this.listenTo(Adapt, 'contents:open', this.openContents);
      this.listenTo(Adapt, 'router:page sideView:close', this.checkDesktop);
      this.listenTo(Adapt, 'router:menu contents:close sideView:open', this.closeContents);
      this.listenTo(Adapt, "device:resize", function() {
        this.overlayMode = this.checkOverlayMode();
      });
      this.overlayMode = this.checkOverlayMode();
    },

    getAdaptCoById: function() {
      var position = -1;
      _.find(this.model.pages, function(co, i) {
        if (co.contentObject.attributes._id === Adapt.location._currentId) {
          position = i;
          return;
        }
      });
      return position;
    },

    moveToComponent: function(event) {
      if (event && event.preventDefault)
        event.preventDefault();
      var currentComponentSelector = '.' + $(event.currentTarget).attr('data-page-level-progress-id');
      var $currentComponent = $(currentComponentSelector);
      Adapt.navigateToElement(currentComponentSelector, {
        duration: 400
      });
      if (this.overlayMode) {
        Adapt.trigger('contents:close');
      }
    },

    render: function() {
      if (this.overlayMode) {
        Adapt.trigger('contents:close');
      }
      this.populateContents();
      $('.contents-page:eq(' + this.getAdaptCoById() + ')').addClass('active');
      $('.contents-page:eq(' + this.getAdaptCoById() + ')').find('.contents-page-entries').show();
      this.listenForCompletition();
      if (Adapt.course.get('_contents')._courseNavigation._circleProgress._isEnabled) {
        this.drawProgressCircle();
      }
    },

    drawProgressCircle: function() {
      var pages;
      var landingPage = Adapt.course.get('_contents')._courseNavigation._landingPage;

      if (landingPage) {
        pages = this.model.pages.slice();
        pages.splice(0, 1);
      } else {
        pages = this.model.pages;
      }

      _.each(pages, function(page, index) {
        var completion = completionCalculations.calculateCompletion(page.contentObject);
        $('.contents-page-title-progress:eq(' + index + ')').circleProgress({
          value: completion.nonAssessmentCompleted / completion.nonAssessmentTotal
        });
        if (completion.nonAssessmentCompleted / completion.nonAssessmentTotal == 1) {
          var fill = $('.contents-page-title-progress:eq(' + index + ')').data('circle-progress').size / 2;
          $('.contents-page-title-progress:eq(' + index + ')').circleProgress({
            "thickness": fill
          });
        }
      });
    },

    getEntriesModels: function(array, componentsOnly) {
      var entriesModels = [];
      _.each(array, function(item, index) {
        if (componentsOnly && item.get('_type') == 'article')
          return;
        entriesModels.push(item.attributes);
      });
      return entriesModels;
    },

    filterComponents: function(array) {
      var entriesModels = [];
      _.each(array, function(item, index) {
        if (item.attributes._type == 'article')
          return;
        entriesModels.push(item);
      });
      return entriesModels;
    },

    populateContents: function() {
      var plpTemplate;
      if (Adapt.course.get('_contents')._courseNavigation._landingPage) {
        plpTemplate = Handlebars.templates.contentsLandingPage;
      } else {
        plpTemplate = Handlebars.templates.contents;
      }
      var context = this;
      $('html').find('body').append(this.$el.html(plpTemplate({
        'settings': Adapt.course.get('_contents'),
        'page': this.model.pages,
        '_globals': this.model._globals
      })));
    },

    listenForCompletition: function() {
      var context = this;
      var coNumber = context.getAdaptCoById();
      var landingPage = Adapt.course.get('_contents')._courseNavigation._landingPage;
      var circleNumber = coNumber;
      var pages;

      if (landingPage) {
        circleNumber--;
        if (coNumber == 0) {
          return;
        }
        pages = this.model.pages.slice();
        pages.splice(0, 1);
      } else {
        pages = this.model.pages;
      }

      var contentsModel = pages[circleNumber].contents;
      var circleProgress = Adapt.course.get('_contents')._courseNavigation._isEnabled && Adapt.course.get('_contents')._courseNavigation._circleProgress._isEnabled;
      contentsModel = this.filterComponents(contentsModel);
      _.each(contentsModel, function(item, index) {
        var $PlpItem = $('.contents-page:eq(' + coNumber + ')').find('.contents-progress-indicator').get(index);
        item.on("change", function() {
          if (item.hasChanged("_isComplete")) {
            $($PlpItem).removeClass('contents-progress-indicator-incomplete').addClass('contents-progress-indicator-complete');
            if (circleProgress) {

              $('.contents-page-title-progress:eq(' + circleNumber + ')').circleProgress('value', context.getPageProgress(pages[circleNumber].contentObject));
            }

            if (context.checkPageComplete(contentsModel)) {
              Adapt.trigger('contents:pageComplete');
              if (circleProgress) {
                var fill = $('.contents-page-title-progress:eq(' + circleNumber + ')').data('circle-progress').size / 2;
                $('.contents-page-title-progress:eq(' + circleNumber + ')').circleProgress({
                  "thickness": fill
                });
              }
            }
          }
        });
      });
    },

    getPageProgress: function(page) {
      var completion = completionCalculations.calculateCompletion(page);
      return (completion.nonAssessmentCompleted + completion.assessmentCompleted) / (completion.nonAssessmentTotal + completion.assessmentTotal);
    },

    checkPageComplete: function(entriesModels) {
      var returnValue = true;
      _.each(entriesModels, function(item, index) {
        if (!item.get('_isComplete')) {
          returnValue = false;
          return;
        }
      });
      return returnValue;
    },

    scrollHandler: function() {
      var context = this;
      var entriesModels = this.getEntriesModels(this.model.pages[this.getAdaptCoById()].contents, false);
      Adapt.contentsTimer = setInterval(function() {
        context.updateCurrentLocation(context, entriesModels);
      }, 250);
    },

    updateCurrentLocation: function(context, entriesModels) {
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + $(window).height() - (Adapt.device.screenHeight / 2); // approximates what the learner is currently looking at
      _.findLastIndex(entriesModels, function(item, index) {
        var $PlpItem = $('.contents-page:eq(' + context.getAdaptCoById() + ')').find('.contents-item-title').get(index);
        if (context.isInViewport(item, viewportTop, viewportBottom)) {
          $('.contents-page:eq(' + context.getAdaptCoById() + ')').find('.contents-item-title').removeClass('highlight');
          $($PlpItem).addClass('highlight');
          return item;
        }
      });
    },

    isInViewport: function(entry, viewportTop, viewportBottom) {
      var $div;
      if (entry._type == 'article') {
        $div = $('.' + entry._id);
      } else {
        $div = $('.' + entry._id).find('.component-inner');
      }
      var hidden = $($div).closest('.block-inner').css('visibility') === 'hidden';
      var elementTop = $($div).offset().top;
      var elementBottom = elementTop + $($div).outerHeight();
      return (elementBottom > viewportTop && elementTop < viewportBottom) && !hidden;
    },

    stopScrollListener: function() {
      this.remove();
      $(window).off('scroll.contents');
    },

    checkDesktop: function() {
      if (!this.overlayMode) {
        this.openContents();
      }
    },

    openContents: function() {
      var overlayMode = this.overlayMode;
      $('body').removeClass('contents-hide');
      if(overlayMode) {
        console.log('shadow');
        $('.contents').css("z-index", "501" ); // appears over shadow
        $('#shadow').removeClass('display-none');
      }
      $('#shadow').on('click', function() {
        if (overlayMode) {
          Adapt.trigger('contents:close');
        }
      });
    },

    closeContents: function() {
      $('body').addClass('contents-hide');
      $('#shadow').addClass('display-none');
      $('.contents').css("z-index", "unset" );
      $('#shadow').off('click');
    }
  });

  Adapt.on('router:page router:menu', function() {
    clearInterval(Adapt.contentsTimer);
  });

  return contentsView;
});
