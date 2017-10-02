# adapt-contents  

**adapt-contents** is an *extension* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework). It shares similar functionality to the core-bundled [Page-level-progress extension](https://github.com/adaptlearning/adapt-contrib-pageLevelProgress). **Please note** these extensions should not be present in the same course.

## Motivation behind adapt-contents

Contents was created as our team wasn't happy with the functionality of the page-level-progress extension. We did some internal testing and many learners couldn't identify that the page-level-progress icon was clickable as it element that is not seen outside of Adapt. Additionally, we had some clients who were requesting that there was a clearer layout of the page, so learners could understand how far through the page they were.

We weren't happy with the drawer which holds the Page Level Progress. We didn't like that it obscures the page with a shadow and prevents any interaction whilst it's open.


## Installation

*   With the [Adapt CLI](https://github.com/adaptlearning/adapt-cli) installed, run the following from the command line:  
`adapt install adapt-contents`

    Alternatively, this extension can also be installed by adding the following line of code to the *adapt.json* file:  
    `"adapt-contents": "*"`  
    Then running the command:  
    `adapt install`  
    (This second method will reinstall all plug-ins listed in *adapt.json*.)  

<div float align=right><a href="#top">Back to Top</a></div>

## Settings Overview

The extension shares many settings with Page Level Progress

### Attributes

**_contents** (object):  The Page Level Progress object that contains a value for **_isEnabled**.  

>**_isEnabled** (boolean): Turns **Page Level Progress** on and off. Acceptable values are `true` and `false`.

>**_showArticleTitles** (boolean): If true adds Article titles into the contents list. Only works in *course.json*

>**_showPagePosition** (boolean): If true the extension checks which components are currently in the viewport and highlights them in the contents list. Only works in *course.json*

### Accessibility
Several elements of **Page Level Progress** have been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **pageLevelProgress**, **pageLevelProgressIndicatorBar**, and **pageLevelProgressEnd**. These labels are not visible elements. They are utilized by assistive technology such as screen readers. Should the label texts need to be customised, they can be found within the **globals** object in [*properties.schema*](https://github.com/adaptlearning/adapt-contents/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

*   Do not use in combination with the Page-level-progress extension
*   Requires Framework version 2.1.0 +

----------------------------
**Version number:**  2.1.6   <a href="https://community.adaptlearning.org/" target="_blank"><img src="https://github.com/adaptlearning/documentation/blob/master/04_wiki_assets/plug-ins/images/adapt-logo-mrgn-lft.jpg" alt="adapt learning logo" align="right"></a>
**Framework versions:**  2.1     
**Author / maintainer:** [Simon Date](mailto:simon.date@kcl.ac.uk)    
**Accessibility support:** WAI AA   
**RTL support:** yes  
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge 12, IE 11, IE10, IE9, IE8, IE Mobile 11, Safari for iPhone (iOS 8+9), Safari for iPad (iOS 8+9), Safari 8, Opera    
