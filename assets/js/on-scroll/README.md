# onscroll
assets submodule


Library for shrinking nav menu and show scroll to top button on scroll down 


scroll to top button needs to have class="toggle-content" or toggle-content-icon-fade (toggle-content-fade is not compadible with svg with border and bg)

## IMPLEMENTATION


```
//import js
import { stickyCollapse, topNav } from '@powerfulwebdesign/on-scroll';
//init (defaults)
stickyCollapse({
  distance: 50,
  parentId: 'jsNavParent',
  collapseClass: 'sticky-collapse',
});
topNav({
  distance: 300,
  parentId: 'jsTopNav',
});
``

Requied CSS
```
require('@powerfulwebdesign/contact-form/visibility.css');   //for use with module bundler e.g. webpack
@import "@powerfulwebdesign/contact-form/visibility.css";   // for use with sass/scss 

```

 
