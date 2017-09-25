define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var contentsView = Backbone.View.extend({

    className: 'contents',
    tagName: 'div',

    initialize: function() {
      this.setupOnceListeners();
      this.render();
      this.listenTo(Adapt, 'router:location', this.stopScrollListener);
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

    setupOnceListeners: _.once(function() {
      this.listenTo(Adapt, 'contents:open', this.openContents);
      this.listenTo(Adapt, 'router:page sideView:close', this.checkDesktop);
      this.listenTo(Adapt, 'router:menu contents:close sideView:open', this.closeContents);

      this.listenTo(Adapt, "device:resize", function() {
        this.overlayMode = this.checkOverlayMode();
      });
      this.overlayMode = this.checkOverlayMode();
    }),

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
      this.createContents();
      if (this.overlayMode) {
        Adapt.trigger('contents:close');
      }
      this.populateContents();
      this.listenForCompletition();
      this.updateCurrentLocation();
    },

    createContents: _.once(function() {
      var template = Handlebars.templates.contents;
      $('html').find('body').append(this.$el.html(template()));
    }),

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
      var entriesModels = this.getEntriesModels(this.model.entries.models, false);
      $('.contents-inner').html(plpTemplate({
        'entries': entriesModels,
        '_globals': this.model._globals
      }));
    },

    listenForCompletition: function() {
      var entriesModels = this.filterComponents(this.model.entries.models);
      _.each(entriesModels, function(item, index) {
        var $PlpItem = $('.page-level-progress-indicator').get(index);
        item.on("change", function() {
          if (item.hasChanged("_isComplete")) {
            $($PlpItem).removeClass('page-level-progress-indicator-incomplete').addClass('page-level-progress-indicator-complete');
          }
        });
      });
    },

    updateCurrentLocation: function() {
      var entriesModels = this.getEntriesModels(this.model.entries.models, false);
      var context = this;
      $(window).on('resize scroll', function() {
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
      });
    },

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
