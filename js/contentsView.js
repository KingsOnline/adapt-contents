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

    events: {
      'click .page-level-progress-item button': 'moveToComponent'
    },

    setupOnceListeners: _.once(function() {
      this.listenTo(Adapt, 'router:page contents:open sideView:close', this.openContents);
      this.listenTo(Adapt, 'contents:close router:menu sideView:open', this.closeContents);
    }),

    moveToComponent: function(event) {
      if (event && event.preventDefault)
        event.preventDefault();
      var currentComponentSelector = '.' + $(event.currentTarget).attr('data-page-level-progress-id');
      var $currentComponent = $(currentComponentSelector);
      Adapt.scrollTo($currentComponent, {
        duration: 400
      });
    },

    render: function() {
      this.createContents();
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

    openContents: function() {
      $('body').removeClass('toc-hide');
    },

    closeContents: function() {
      $('body').addClass('toc-hide');
    }
  });

  return contentsView;
});
