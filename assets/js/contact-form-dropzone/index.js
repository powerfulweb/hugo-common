// for use with PWD endpoint
// on HTTP success, checks for JSON response and returns true on success
// requries class "is-hidden" of display: none !important

'use strict';

//import Dropzone from 'dropzone/src/dropzone.js';
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
  // const formAction = formId.action;
  // const formMethod = formId.method;

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

  // function for serializing all inputs in a form
  var serializeArray = function (form) {
    var arr = [];
    Array.prototype.slice.call(form.elements).forEach(function (field) {
      if (!field.name || field.disabled || ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1) return;
      if (field.type === 'select-multiple') {
        Array.prototype.slice.call(field.options).forEach(function (option) {
          if (!option.selected) return;
          arr.push({
            name: field.name,
            value: option.value
          });
        });
        return;
      }
      if (['checkbox', 'radio'].indexOf(field.type) >-1 && !field.checked) return;
      arr.push({
        name: field.name,
        value: field.value
      });
    });
    return arr;
  };

  //google recaptcha 2 invisible
  window.onloadCallback = function () {
    grecaptcha.render(submitId, {
      'sitekey': grecaptchaKey,
      'badge': grecaptchaLocation,
      'callback': onSubmit,
    });
    document.getElementById(submitId).disabled = false;
  };



  // status message function
  // defaults to error message unless msg(true) is called
  let alertType;
  function msg(status, statusMsg) {
    if (status === true) { // success
      alertType = successClass;
      id(formId).classList.add(hiddenClass); //hide form
    } else { // error
      alertType = errorClass;
    }
    id(spinnerId).classList.add(hiddenClass); // hide spinner
    id(statusId).innerHTML = statusMsg;
    id(statusId).classList.add(alertClass);
    id(statusId).classList.add(alertType); // add success alert classes to message div
    id(statusId).classList.remove(hiddenClass); // remove hidden class on message div
    // reset form but dont reset alert/button until user focuses on name input
    id(formId).classList.remove('was-validated');
    id(formId).reset();
    id(inputNameId).addEventListener('focus', function() {
      //reset grecaptcha as it only allows 1 click before being disabled
      grecaptcha.reset();
      // hide alert
      id(statusId).classList.add(hiddenClass);
      // remove alert type class on alert
      id(statusId).classList.remove(alertType);
      // show button
      id(submitId).classList.remove(hiddenClass);
    });
  }

  function safelyParseJSON (json) {
    // unpacks json data and catches error
    let parsed;
    try {
      parsed = JSON.parse(json)
      // console.log(parsed); //shows json response
    } catch (e) {
      // console.error(e);  //shows error
      // console.log(json); //shows non json response
      const message = 'Sorry an error has occured, please try again later.';
      msg(false, message); // error message

    }
    return parsed // Could be undefined! // outputs as variable "json"
  }

  //form submission and status display
  function submitForm() {
    const form = id(formId);
    let formData = new FormData(form);   
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    //xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onreadystatechange = function() {
      if (xhr.readyState == (4 || XMLHttpRequest.DONE)) { 
        if (xhr.status >= 200 && xhr.status < 400) { //loading finished //200-299 = success 300-399 = redirect
          var response = safelyParseJSON(this.responseText);
          // console.log(this.responseText);
          if (response.success === true) { // php returns success === true
            msg(true, response.message); // success message
          } else {  // php returns error
            msg(false, response.message); // error message
          }
        } else { // http error - display fallback error message
          const message = 'Sorry the form is not available at the moment, please try again later.';
          msg(false, message); // error message
        }
      } 
    }
    xhr.send(formData);
  }

  let photoDropzone;
  Dropzone.options.jsPhotoDropzone = {
    url: formAction,
    method: formMethod,
    paramName: "photo", // The name that will be used to transfer the file
    uploadMultiple: true,
    autoProcessQueue: false,
    maxFiles: 6,
    parallelUploads: 6,
    acceptedFiles: 'image/*',
    resizeWidth: 800,
    addRemoveLinks: true,
    autoQueue: true,


    
    // The setting up of the dropzone
    init: function() {
      photoDropzone = this;

      // Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
      // of the sending event because uploadMultiple is set to true.
      this.on("sendingmultiple", function() {
        // Gets triggered when the form is actually being sent
        // THESE EVENTS ARE TRIGGERED BY GRECAPTCHA (hide button, show spinner)
        const formFields = serializeArray(id(formId));
        console.log(formFields);
        //formData.append();
      });
      this.on("sending", function() {
        // Gets triggered when the form is actually being sent
        // THESE EVENTS ARE TRIGGERED BY GRECAPTCHA (hide button, show spinner)
        const formFields = serializeArray(id(formId));
        console.log(formFields);
        console.log('single send');
        //formData.append();
      });
      this.on("successmultiple", function(files, response) {
        // Gets triggered when the files have successfully been sent.
        const message = 'Form submitted, we will be in touch with you shortly!';
        msg(true, message);
        console.log(response);
      });
      this.on("errormultiple", function(files, response) {
        // Gets triggered when there was an error sending the files.
        const message = 'Sorry there is a form error , please try again later.';
        msg(false, message);
        console.log(response);
      });
    }
  }

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
      // submit dropzone
      //photoDropzone.processQueue();
      if (photoDropzone.getQueuedFiles().length > 0) {                        
        photoDropzone.processQueue();  
        alert('process queue');
    } else {                       
        submitForm();
    }    
    }
  }

}