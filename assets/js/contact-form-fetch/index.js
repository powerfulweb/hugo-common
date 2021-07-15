// for use with PWD endpoint
// on HTTP success, checks for JSON response and returns true on success
// requries class "is-hidden" of display: none !important

'use strict';
export default ({
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
  maxImageSize = 12,
  grecaptchaKey = '',
  grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) => {
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
      submitFetch();
    }
  };

  // no timeout function has been provided
  function submitFetch() {
    const form = id(formId);
    const formData = new FormData(form);

    fetch(formAction, {
      method: formMethod,
      body: formData,
    })
      .then(checkStatus)
      .then(jsonMessage => message(true, jsonMessage))
      .catch(handleError);
    
    function checkStatus(response) {
      return response.json()
        .then(json => {
          if (response.ok) {
            // response.status 200-299
            if (json.success) {
              // success: true
              return json.message;
            } else {
              // success: false
              //throw new Error(json);
              return Promise.reject(json);
            } 
          } else {
            // connection error, so no clean response message from server
            // response sent for debugging only
            //throw new Error(response);
            return Promise.reject(response);
          }
        })
    }

    function handleError(error) {
      // console.log('error:');
      // console.log(error);
      if (error.hasOwnProperty('success')) {
        // cases where handleResponse rejects promise
        message(false, error.message);
      } else {
        // cases where fetch rejects promise - network error and no response message received from server
        // uses fall back error message
        message(false); 
        // error.status &  error.message can be checked here
      }
    }

    // message function. fallback message provided here
    function message(status, statusMsg = 'Sorry a connection error has occured, please try again later.') {
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

 
}