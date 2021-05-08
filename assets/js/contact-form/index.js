// for use with unstatic endpoint
// on HTTP success, checks for JSON response and returns true on success
// requries class "is-hidden" of display: none !important;

'use strict';
export function contactForm({  // defaults
  formId = 'js-contactForm',
  formAction = '',  // for testing on localhost
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
  document.getElementById(inputNameId).addEventListener('focus', loadScriptsOnFocus, false);
  function loadScriptsOnFocus() {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
    head.appendChild(script);
    // remove focus to avoid js error/loop
    document.getElementById(inputNameId).removeEventListener('focus', loadScriptsOnFocus);
  }
  
  //google recaptcha 2 invisible
  window.onloadCallback = function () {
    grecaptcha.render(submitId, {
      'sitekey': grecaptchaKey,
      'badge': grecaptchaLocation,
      'callback': onSubmit,
    });
    document.getElementById(submitId).disabled = false;
  };

  // on submit event, called by recaptcha
  window.onSubmit = function () { 
    const form = id(formId);
    if (!form.checkValidity()) {   //if not valid
      form.classList.add('was-validated'); //shows errors on failed fields
      grecaptcha.reset(); //reset grecaptcha as it only allows 1 click before being disabled
    } else { //if valid
      //hide button
      id(submitId).classList.add(hiddenClass);
      //show spinner 
      id(spinnerId).classList.remove(hiddenClass);
      submitForm();
    }
  };

  // status message function
  // defaults to error message unless msg(true) is called
  function msg(status) {
    let alertType = errorClass;
    let statusMsg = 'Sorry the form is not available at the moment, please try again later.'
    if (status === true) { // success message
      alertType = successClass;
      statusMsg = 'Thank you for submitting your enquiry, we will be in touch with you soon.'
      id(formId).classList.add(hiddenClass); //hide form
    } 
    id(spinnerId).classList.add(hiddenClass); // hide spinner
    id(statusId).innerHTML = statusMsg;
    id(statusId).classList.add(alertClass);
    id(statusId).classList.add(alertType); // add success alert classes to message div
    id(statusId).classList.remove(hiddenClass); // remove hidden class on message div
  }

  function safelyParseJSON (json) {
    // unpacks json data and catches error
    let parsed;
    try {
      parsed = JSON.parse(json)
      console.log(parsed); //shows json response
    } catch (e) {
      // console.error(e);  //shows error
      // console.log(json); //shows non json response
      //const message = 'Sorry an error has occured, please try again later.';
      msg(false); // error message
    }
    return parsed // Could be undefined! // outputs as variable "json"
  }

  //form submission and status display
  function submitForm() {
    const form = id(formId);
    // Gather form data
    let formData = new FormData(form);
    // Array to store the stringified and encoded key-value-pairs.
    let parameters = []
    for (let pair of formData.entries()) {
        parameters.push(
            encodeURIComponent(pair[0]) + '=' +
            encodeURIComponent(pair[1])
        );
    }
    // AJAX 
    let response;
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == (4 || XMLHttpRequest.DONE)) { 
        if (xhr.status >= 200 && xhr.status < 400) { //loading finished //200-299 = success 300-399 = redirect
          //response = JSON.parse(this.responseText);
          response = safelyParseJSON(this.responseText);
          if (response.success === true) { // php returns success === true
            msg(true); // success message
          } else {  // php returns error
            msg(false); // error message
          }
        } else { // http error
          msg(false); // error message
        }
      } 
    }; // end function
    xhr.send(parameters.join('&')); 
  };
}

