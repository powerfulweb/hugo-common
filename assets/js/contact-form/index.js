'use strict';
export function contactForm({  // defaults
  formId = 'js-contactForm',
  formAction = 'http://127.0.0.1/contact-php/3-process.php',  // for testing on localhost
  formMethod = 'POST',
  inputNameId = 'js-contact-name',
  submitId = 'js-submit',
  successId = 'js-successMessage',
  errorId = 'js-errorMessage',
  grecaptchaKey = '6LeuusIaAAAAANZ6WMa6Mu__my_irxdf9SjG77D2',  // for testing on localhost
  grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) {
 
  

  window.onSubmit = function () {
    // console.log('submit clicked');
    const form = document.getElementById(formId);
    if (!form.checkValidity()) {   //if not valid
      // console.log('validation failed, grecaptcha reset');
      grecaptcha.reset(); //reset grecaptcha as it only allows 1 click before being disabled
    } else { //if valid
      // console.log('validation success');
      submitForm();
   
    }
    form.classList.add('was-validated'); //shows errors on failed fields
  };

  window.onloadCallback = function () {
    grecaptcha.render(submitId, {
      'sitekey': grecaptchaKey,
      'badge': grecaptchaLocation,
      'callback': onSubmit,
    });
    document.getElementById(submitId).disabled = false;
  };


  function submitForm() {
    const show = function (elem) {
      elem.classList.add('is-visible');
    };
    const hide = function (elem) {
      elem.classList.remove('is-visible');
    };
    const success = document.getElementById(successId);
    const error = document.getElementById(errorId);
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
    var http = new XMLHttpRequest();
    http.open(formMethod, formAction);
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    http.onreadystatechange = function() {
      if (http.readyState === XMLHttpRequest.DONE) {
        if (http.status === 200) { //SUCCESS
          // console.log('Successfully submitted the req');
          hide(form);
          show(success);
        } else { //ERROR
          // console.log('Error while submitting the req');
          show(error);
        }
      }
    };
    http.onload = function () {
      console.log(this.response);
      // DO SOMETHING AFTER FORM SUBMISSION
    };
    http.send(parameters.join('&'));
  }

  // Function that loads scripts on form input focus
  function loadScriptsOnFocus() {
    // console.log('captcha head script loaded');
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
    head.appendChild(script);
    // remove focus to avoid js error:
    document.getElementById(inputNameId).removeEventListener('focus', loadScriptsOnFocus);
  }

  document.getElementById(inputNameId).addEventListener('focus', loadScriptsOnFocus, false);
  //add event listener to load grecaptcha

}

//test