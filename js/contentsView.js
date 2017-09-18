define(function(require) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var contentsView = Backbone.View.extend({

    className: 'contents',
    tagName: 'div',

    initialize: function() {
      this.setupOnceListeners();
      this.render();
    },

    checkOverlayMode: function() {
      if (Adapt.device.screenWidth > 1024) {
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
      this.populateContents(this.model);
      this.listenForCompletition();
    },

    createContents: _.once(function() {
      var template = Handlebars.templates.contents;
      $('html').find('body').append(this.$el.html(template()));
    }),

    populateContents: function(data) {
      var plpTemplate = Handlebars.templates.pageLevelProgress;
      $('.contents-inner').html(plpTemplate(data));
    },

    listenForCompletition: function() {
      var componentsPLP = Adapt.findById(Adapt.location._currentId).findDescendants('components').filter(function(model) {
        if (!model.get('_contents') || !model.get('_contents')._isEnabled)
          return false;
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

    checkDesktop: function() {
      if(!this.overlayMode){
        this.openContents();
      }
    },

    openContents: function() {
      $('body').removeClass('toc-hide');
      var overlayMode = this.overlayMode;
      $('#wrapper').on('click', function() {
        if(overlayMode) {
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
