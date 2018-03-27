# adapt-contents  

**adapt-contents** is an *extension* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework). It shares similar functionality to the core-bundled [Page-level-progress extension](https://github.com/adaptlearning/adapt-contrib-pageLevelProgress). **Please note** these extensions should not be present in the same course.

## Motivation behind adapt-contents

Contents was created as our team wasn't happy with the functionality of the page-level-progress extension. We did some internal testing and many learners couldn't identify that the page-level-progress icon was clickable as it element that is not seen outside of Adapt. Additionally, we had some clients who were requesting that there was a clearer navigation of the page, so learners could understand how far through the whole course they were.

We weren't happy with the drawer which holds the Page Level Progress. We didn't like that it obscures the page with a shadow and prevents any interaction whilst it's open. We wanted to improve on the navigation from Adapt as well as the navigation found in other e-Learning Authoring Tools that we had experimented with.

## Installation

*   With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:  
`adapt install adapt-contents`

    Alternatively, this extension can also be installed by adding the following line of code to the *adapt.json* file:  
    `"adapt-contents": "*"`  
    Then running the command:  
    `adapt install`  
    (This second method will reinstall all plug-ins listed in *adapt.json*.)  

<div float align=right><a href="#top">Back to Top</a></div>

### Attributes

**_isEnabled** (boolean): Turns **Contents** on and off. Default - true.

**_showArticleTitles** (boolean): If true adds Article titles into the contents list. Default - false.

**_showPagePosition** (boolean): If true the extension checks which component is currently in the viewport and highlights it in the contents list. Default - true.

**_courseNavigation** (object): A feature that allows navigation between pages within the course.

> **_isEnabled** (boolean): If true all the pages within the course are listed in the Contents list. Default - true.

> **_landingPage** (boolean): The first page of the course acts as a landing page and acts as a single button. Default - true.

> **_allAccordions** (boolean): If enabled the page titles act as accordions instead of buttons. All enabled components within the page are shown and you can check progress and navigate directly to a component on another page. Default - false.

> **_circleProgress** (object): Uses [jquery-circle-progress](https://github.com/kottenator/jquery-circle-progress) to show the current progress of the page.
>  *  **_isEnabled** (boolean): If true enables the external library to display progress in a page.
>  *  **_color** (string): Assigns the color of the progress wheel. This will be overriden by a custom handlebars file in your theme.



### Accessibility
This extension has limited Accessibility support.
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

*   Do not use in combination with the Page-level-progress extension
*   Requires Framework version 2.1.0 +
*   The `_circleProgress` feature does not work on IE8 and has no fall back.

----------------------------
**Version number:**  2.1.6   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a>
**Framework versions:**  2.1     
**Author / maintainer:** [Simon Date](mailto:simon.date@kcl.ac.uk)    
**Accessibility support:** WAI AA   
**RTL support:** no  
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge 12, IE 11, IE10, IE9, IE8, IE Mobile 11, Safari for iPhone (iOS 8+9), Safari for iPad (iOS 8+9), Safari 8, Opera    
