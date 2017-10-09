define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var contentsView = Backbone.View.extend({

    className: 'contents',
    tagName: 'div',

    initialize: function() {
      this.setupListeners();
      this.listenTo(Adapt, 'pageView:postRender', this.render);
      if(Adapt.course.get('_contents')._showPagePosition) {
        this.listenTo(Adapt, 'pageView:ready', this.scrollHandler);
        this.listenTo(Adapt, 'router:location', this.stopScrollListener);
      }
    },

    checkOverlayMode: function() {
      if (Adapt.device.screenWidth >= 1025) {
        return false;
      }
      return true;
    },

    events: {
      'click .page-level-progress-item button': 'moveToComponent'
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

    moveToComponent: function(event) {
      if (event && event.preventDefault)
        event.preventDefault();
      var currentComponentSelector = '.' + $(event.currentTarget).attr('data-page-level-progress-id');
      var $currentComponent = $(currentComponentSelector);
      Adapt.scrollTo($currentComponent, {
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
      this.listenForCompletition();
    },

    getEntriesModels: function(array, componentsOnly) {
      console.log(array);
      var entriesModels = [];
      _.each(array, function(item, index) {
        if (componentsOnly && item.get('_type') == 'article') return;
        entriesModels.push(item.attributes);
      });
      console.log(entriesModels);
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
      var pages = this.model.pages;
      console.log(pages);
      var context = this;
      var contentArray = pages;
      console.log(contentArray);
      _.each(contentArray, function(item, index) {
        contentArray[index].entries = context.getEntriesModels(contentArray[index].entries, false);
      });
            console.log(contentArray);
      $('html').find('body').append(this.$el.html(plpTemplate({
        'page': contentArray,
        '_globals': this.model._globals
      })));
    },

    listenForCompletition: function() {
      console.log(this.model.pages[0].entries);
      var entriesModels = this.filterComponents(this.model.pages[0].entries.models);
      var context = this;
      console.log(entriesModels);
      _.each(entriesModels, function(item, index) {
        var $PlpItem = $('.page-level-progress-indicator').get(index);
        console.log($PlpItem);
        item.on("change", function() {
          if (item.hasChanged("_isComplete")) {
            console.log(entriesModels);
            $($PlpItem).removeClass('page-level-progress-indicator-incomplete').addClass('page-level-progress-indicator-complete');
            if(context.checkPageComplete(entriesModels)) {
              Adapt.trigger('contents:pageComplete');
            }
          }
        });
      });
    },

    checkPageComplete: function(entriesModels) {
      var returnValue = true;
        _.each(entriesModels, function(item, index) {
          if(!item.get('_isComplete')) {
            returnValue = false;
          }
        });
        return returnValue;
    },

    scrollHandler: function() {
      var context = this;
      var entriesModels = this.getEntriesModels(this.model.entries.models, false);
        $(window).on('resize scroll', function() {
          context.updateCurrentLocation(context, entriesModels);
        });
    },

    updateCurrentLocation: _.throttle(function(context, entriesModels) {
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + $(window).height();
      _.each(entriesModels, function(item, index) {
        var $PlpItem = $('.page-level-progress-item-title').get(index);
        if (context.isInViewport(item, viewportTop, viewportBottom)) {
          $($PlpItem).addClass('highlight');
        } else {
          $($PlpItem).removeClass('highlight');
        }
      });
    }, 50),

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

  return contentsView;
});
