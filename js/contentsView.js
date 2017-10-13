define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

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
      'click .page-level-progress-item button': 'moveToComponent',
      'click .contents-page-title': 'accordionPressed'
    },

    accordionPressed: function(event) {
      var $toggleButton = $(event.currentTarget);
      var $accordionItem = $toggleButton.parent('.contents-page');
      if($accordionItem.hasClass('active')) {
        $accordionItem.find('.contents-page-entries').slideUp(500);
        $accordionItem.removeClass('active');
      } else {
        $accordionItem.find('.contents-page-entries').slideDown(500);
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
      _.each(Adapt.contentObjects.models, function(co, i) {
        if (co.attributes._id === Adapt.location._currentId) {
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
    },

    getEntriesModels: function(array, componentsOnly) {
      var entriesModels = [];
      _.each(array, function(item, index) {
        if (componentsOnly && item.get('_type') == 'article') return;
        entriesModels.push(item.attributes);
      });
      return entriesModels;
    },

    filterComponents: function(array) {
      var entriesModels = [];
      _.each(array, function(item, index) {
        if (item.attributes._type == 'article') return;
        entriesModels.push(item);
      });
      return entriesModels;
    },

    populateContents: function() {
      var plpTemplate = Handlebars.templates.contents;
      var context = this;
      $('html').find('body').append(this.$el.html(plpTemplate({
        'page': this.model.pages,
        '_globals': this.model._globals
      })));
    },

    listenForCompletition: function() {
      var context = this;
      var contentsModel = this.model.pages[this.getAdaptCoById()].contents;
      contentsModel = this.filterComponents(contentsModel);
      _.each(contentsModel, function(item, index) {
        var $PlpItem = $('.contents-page:eq(' + context.getAdaptCoById() + ')').find('.page-level-progress-indicator').get(index);
        item.on("change", function() {
          if (item.hasChanged("_isComplete")) {
            $($PlpItem).removeClass('page-level-progress-indicator-incomplete').addClass('page-level-progress-indicator-complete');
            if (context.checkPageComplete(contentsModel)) {
              Adapt.trigger('contents:pageComplete');
            }
          }
        });
      });
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
      $(window).on('resize scroll', function() {
        context.updateCurrentLocation(context, entriesModels);
      });
    },

    updateCurrentLocation: _.throttle(function(context, entriesModels) {
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + $(window).height() - 200;
      Adapt.log.debug(viewportTop, viewportBottom);
      _.findLastIndex(entriesModels, function(item, index) {
        var $PlpItem = $('.contents-page:eq(' + context.getAdaptCoById() + ')').find('.page-level-progress-item-title').get(index);
        if (context.isInViewport(item, viewportTop, viewportBottom)) {
          $('.contents-page:eq(' + context.getAdaptCoById() + ')').find('.page-level-progress-item-title').removeClass('highlight');
          $($PlpItem).addClass('highlight');
          return item;
        }
      });
    }, 100),

    isInViewport: function(entry, viewportTop, viewportBottom) {
      var $div;
      if (entry._type == 'article') {
        $div = $('.' + entry._id);
      } else {
        $div = $('.' + entry._id).find('.component-body');
      }
      var elementTop = $($div).offset().top;
      var elementBottom = elementTop + $($div).outerHeight();
      return elementBottom > viewportTop && elementTop < viewportBottom;
    },

    stopScrollListener: function() {
      this.remove();
      $(window).off('resize scroll');
    },

    checkDesktop: function() {
      if (!this.overlayMode) {
        this.openContents();
      }
    },

    openContents: function() {
      $('body').removeClass('toc-hide');
      var overlayMode = this.overlayMode;
      $('#wrapper').on('click', function() {
        if (overlayMode) {
          Adapt.trigger('contents:close');
        }
      });
    },

    closeContents: function() {
      $('body').addClass('toc-hide');
      $('#wrapper').off('click');
    }
  });

  Adapt.on('menuView:ready', function(){
    console.log('init');
    $(window).off('resize scroll');
  });

  return contentsView;
});
