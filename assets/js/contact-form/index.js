'use strict';
export function contactForm({  // defaults
  formId = 'js-contactForm',
  formAction = 'http://127.0.0.1/contact-php/3-process.php',  // for testing on localhost
  formMethod = 'POST',
  inputNameId = 'js-contact-name',
  submitId = 'js-submit',
  statusId = 'js-statusMessage',
  alertClass = 'alert',
  successClass = 'alert-success',
  errorClass = 'alert-danger',
  hiddenClass = 'is-hidden',
  spinnerId = 'js-load',
  successId = 'js-successMessage', //to depreciate
  errorId = 'js-errorMessage', //to depreciate
  grecaptchaKey = '6LeuusIaAAAAANZ6WMa6Mu__my_irxdf9SjG77D2',  // for testing on localhost
  grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) {
  function id(elem) {
    return document.getElementById(elem); //shorthand used throghout
  }

  
  //add event listener to load grecaptcha
  document.getElementById(inputNameId).addEventListener('focus', loadScriptsOnFocus, false);
  function loadScriptsOnFocus() {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
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
    const form = document.getElementById(formId);
    if (!form.checkValidity()) {   //if not valid
      form.classList.add('was-validated'); //shows errors on failed fields
      grecaptcha.reset(); //reset grecaptcha as it only allows 1 click before being disabled
    } else { //if valid
      console.log('validation success');
      //hide button
      id(submitId).classList.add(hiddenClass);
      //show spinner 
      id(spinnerId).classList.remove(hiddenClass);
      submitForm();
    }
  };

  // status message function
  const successMsg = 'Thank you for submitting your enquiry, we will be in touch with you soon.';
  const errorMsg = 'Sorry the form is not available at the moment, please try again later.';
  function msg(type) {
    let alertType = errorClass;
    let msg = errorMsg
    if (type === 'success') {
      alertType = successClass;
      msg = successMsg
    }
    id(spinnerId).classList.add(hiddenClass); // hide spinner
    id(statusId).innerHTML = msg;
    id(statusId).classList.add(alertClass);
    id(statusId).classList.add(alertType); // add success alert classes to message div
    id(statusId).classList.remove(hiddenClass); // remove hidden class on message div
  }

  //form submission and status display
  function submitForm() {
    const form = document.getElementById(formId);
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
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    console.log('form opened');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {  //polyfill for xhr.onload
        if (xhr.status >= 200 && xhr.status < 400) { //200-299 = success 300-399 = redirect
          id(formId).classList.add(hiddenClass); //hide form
          console.log('message called');
          msg('success');
        } else { //ERROR
          msg('error');
        }
      }
    };
    // xhr.onload = function () {
    //   console.log(this.response);
    //   // DO SOMETHING AFTER FORM SUBMISSION
    //   //response {"success":true,"result":"success"}
    // };
    xhr.send(parameters.join('&'));
  };
}

