'use strict';
export function contactForm({  // defaults
  formId = 'js-contactForm',
  formAction = '',  
  formMethod = 'POST',
  inputNameId = 'js-contact-name',
  submitId = 'js-submit',
  spinnerId = 'js-load',
  successId = 'js-successMessage',
  errorId = 'js-errorMessage',
  grecaptchaKey = '',  
  hiddenClass = 'is-hidden',
  grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) {
 
  
  function el(elem) {
    return document.getElementById(elem);  //shorthand used throghout
  };
  function show(elem) {
    //return elem.classList.add('is-visible'); //removed css dependency
    //return elem.style.display = "block";
    return elem.classList.remove(hiddenClass); 
  };
  function modText(elem,msg) {
    return elem.innerText = msg;
  };
  function hide(elem) {
    //return elem.classList.remove('is-visible');
    //return elem.style.display = "none";
    return elem.classList.add(hiddenClass); 
  };
  const form = el(formId);

  window.onSubmit = function () {
    
    if (!form.checkValidity()) {   //if not valid
      grecaptcha.reset(); //reset grecaptcha as it only allows 1 click before being disabled
    } else { //if valid
      const spinner = el(spinnerId);
      const submit = el(submitId);
      show(spinner);  
      hide(submit);
      submitForm();
      console.log('submit form function called');
    }
    form.classList.add('was-validated'); //shows errors on failed fields
  };

  window.onloadCallback = function () {
    grecaptcha.render(submitId, {
      'sitekey': grecaptchaKey,
      'badge': grecaptchaLocation,
      'callback': onSubmit,
    });
    el(submitId).disabled = false;
    console.log('submit enabled');
  };

  function submitForm() {

    const success = el(successId);
    const error = el(errorId);
    const msgSent = 'Thank you for your message, we will be in touch with you shortly.';
    const unavailable = 'Sorry the form is not available at the moment, please try again later';
    // Gather form data
    let formData = new FormData(form);
    // Array to store the stringified and encoded key-value-pairs.
    let parameters = []
    for (let pair of formData.entries()) {
      parameters.push(
        encodeURIComponent(pair[0]) + '=' +
        encodeURIComponent(pair[1])
      );
    };
    var xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status !== 200) { // error - form not available
          modText(error, unavailable)
          show(error);
        }
      };
    }
    xhr.onload = function () {
      if (this.response == 1) { //success
        console.log('php returned success');
        modText(success, msgSent);
        show(success);
        hide(form);
      } else if (this.response == 0) { //error
        console.log('php returned error');
        modText(error, unavailable);
        show(error);
      } else {  //no php response, may never time out
        console.log('no php response');
        modText(error, unavailable);
        show(error);
      }
    };
    xhr.send(parameters.join('&'));
  };

  

  // Function that loads scripts on form input focus
  function loadScriptsOnFocus() {
    // console.log('captcha head script loaded');
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
    head.appendChild(script);
    // remove focus to avoid js error:
    el(inputNameId).removeEventListener('focus', loadScriptsOnFocus);
    console.log('event listener removed captcha loaded');
  }

  el(inputNameId).addEventListener('focus', loadScriptsOnFocus, false);
  console.log('event listener added');
  //add event listener to load grecaptcha

}
