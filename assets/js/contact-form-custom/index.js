// for use with PWD endpoint
// on HTTP success, checks for JSON response and returns true on success
// requries class "is-hidden" of display: none !important

'use strict';
export function contactForm({
  // defaults
  formId = 'js-contactForm',
  formAction = '',
  formMethod = 'POST',
  inputNameId = 'js-contact-name',
  submitId = 'js-submit',
  statusId = 'js-statusMessage',
  alertClass = 'alert', // BS5
  successClass = 'alert-success', // BS5
  errorClass = 'alert-danger', // BS5
  hiddenClass = 'is-hidden', // custom css class dependency
  spinnerId = 'js-load',
  grecaptchaKey = '',
  grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) {
  function id(elem) {
    return document.getElementById(elem); //shorthand used throghout
  }

  //add event listener to load grecaptcha
  id(inputNameId).addEventListener(
    'focus',
    function gLoad() {
      const head = document.getElementsByTagName('head')[0];
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
        // grecaptcha calls onloadCallback() when loaded
      head.appendChild(script);
      // removed so script only loads once.
      this.removeEventListener('focus', gLoad);
    },
    false
  );

  // //add event listener to file fields and validate size
  // [...document.getElementsByTagName('input')].forEach(
  //   (element, index, array) => {
  //     if(element.getAttribute("type") == "file") {
  //       element.onchange = function() {
  //         if (this.value.length == 0 ) {
  //           this.setCustomValidity('');
  //           id(formId).classList.add('was-validated');
  //         } else {
  //           const fileSize =this.files[0].size / 1024 / 1024; // in MiB
  //           if (fileSize > maxImageSize) {
  //             this.setCustomValidity('Invalid field.');
  //             id(formId).classList.add('was-validated');
  //           } else {
  //             this.setCustomValidity('');
  //             id(formId).classList.add('was-validated');
  //           }
  //         }
  //       }
  //     }
  //   }
  // );

  //google recaptcha 2 invisible
  window.onloadCallback = () => {
    grecaptcha.render(submitId, {
      sitekey: grecaptchaKey,
      badge: grecaptchaLocation,
      callback: onSubmit,
      // when grecaptcha is triggered by click on submitId, it calls onSubmit
    });
    id(submitId).disabled = false;
  };

  // on submit event, called by recaptcha
  // performs js validation of form.
  window.onSubmit = () => {
    const form = id(formId);
    if (!form.checkValidity()) {
      //if not valid
      form.classList.add('was-validated'); //shows errors on failed fields
      grecaptcha.reset(); //reset grecaptcha as it only allows 1 click before being disabled
    } else {
      //if valid
      //hide button
      id(submitId).classList.add(hiddenClass);
      //show spinner
      id(spinnerId).classList.remove(hiddenClass);
      submitForm();
    }
  };
 
  //form submission and status display
  function submitForm() {
    const form = id(formId);
    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    //xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onreadystatechange = function () {
      if (xhr.readyState == (4 || XMLHttpRequest.DONE)) {
        if (xhr.status >= 200 && xhr.status < 400) {
          //loading finished //200-299 = success 300-399 = redirect
          var response = parseJSON(this.responseText);
          // console.log(this.responseText);
          if (response === undefined || response.success === undefined) {
            // php/json parse error - fall back message
            msg();
          } else if (response.success === true) {
            // php returns success === true
            msg(true, response.message); // success message
          } else if (response.success === false) {
            // php returns error
            msg(false, response.message); // error message
          }
        } else {
          // http error - display fallback error message
          msg();
        }
      }
    };
    xhr.send(formData);
  }
  // unpacks json data and catches error
  function parseJSON(json) {
    let parsed;
    try {
      parsed = JSON.parse(json);
      // console.log(parsed); //shows json response
    } catch (e) {
      // console.error(e);  //shows error
      // console.log(json); //shows non json response
      msg();
    }
    return parsed; // Could be undefined! // outputs as variable "json"
  }
  // status message function
  // defaults to error message unless msg(true) is called
  function msg(
    status = false,
    statusMsg = 'Sorry an error has occured, please try again later.'
  ) {
    // hide spinner
    id(spinnerId).classList.add(hiddenClass);
    // add text to status div
    id(statusId).innerHTML = statusMsg;
    // add alert class to status div
    id(statusId).classList.add(alertClass);

    if (status === true) {
      // success
      //hide form
      id(formId).classList.add(hiddenClass);
      // add success alert classes to status div
      id(statusId).classList.add(successClass);
      // remove hidden class on status div
      id(statusId).classList.remove(hiddenClass);
    } else {
      // error
      // add success alert classes to status div
      id(statusId).classList.add(errorClass);
      // remove hidden class on status div
      id(statusId).classList.remove(hiddenClass);
      // reset form
      id(formId).classList.remove('was-validated');
      id(formId).reset();
      // only reset alert/button when user focuses on name input
      id(inputNameId).addEventListener('focus', function () {
        //reset grecaptcha as it only allows 1 click before being disabled
        grecaptcha.reset();
        // hide alert
        id(statusId).classList.add(hiddenClass);
        // remove alert type class on alert
        id(statusId).classList.remove(errorClass);
        // show button
        id(submitId).classList.remove(hiddenClass);
      });
    }
  }
}
