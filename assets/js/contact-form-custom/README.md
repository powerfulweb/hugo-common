# contact-form
under development - not intended for public use

Library for AJAX vanilla js submission of contact form

form needs to have class="toggle-content is-visible" or "toggle-content-fade" (Shown by default)
success/error messages need to have class="toggle-content" (hidden by default)

## IMPLEMENTATION EXAMPLE
```
//defaults

import { contactForm } from '@powerfulwebdesign/contact-form';

contactForm({
  formID: 'contactForm',
  successID: 'successMessage',
  errorID: 'errorMessage',
  formAction: '',
  submitButtonID: 'submit',
  grecaptchaKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // localhost testing 
  grecaptchaLocation: 'bottomright', // bottomright, bottomleft, or inline.
});

```
Requied CSS
```
require('@powerfulwebdesign/contact-form/visibility.css');   //for use with module bundler e.g. webpack
@import "@powerfulwebdesign/contact-form/visibility.css";   // for use with sass/scss 

```