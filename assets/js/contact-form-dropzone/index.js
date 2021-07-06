// for use with PWD endpoint
// on HTTP success, checks for JSON response and returns true on success
// requries class "is-hidden" of display: none !important

'use strict';

//import Dropzone from 'dropzone/src/dropzone.js';
export function contactForm({  // defaults
  formId = 'js-contactForm',
  dropzoneId = 'js-photo-dropzone',
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
  // grecaptchaKey = '',
  // grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) {


  function id(elem) {
    return document.getElementById(elem); //shorthand used throghout
  }

  //add event listener to load grecaptcha
  id(inputNameId).addEventListener('focus', function gLoad(){
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.google.com/recaptcha/api.js';
    head.appendChild(script);
    // remove focus to avoid js error/loop
    this.removeEventListener('focus', gLoad);
    // enable submit button (for div recaptcha)
    id(submitId).disabled = false;
  }, false);

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

  // status message function
  // defaults to error message unless msg(true) is called
  let alertType;
  function msg(status, statusMsg) {
    if (status === true) { // success
      alertType = successClass;
      id(formId).classList.add(hiddenClass); //hide form
      id(dropzoneId).classList.add(hiddenClass); //hide dropzone
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
    //reset form and dropzone
    id(formId).reset();
    photoDropzone.removeAllFiles();
    id(inputNameId).addEventListener('focus', function() {
      //reset grecaptcha as it only allows 1 click before being disabled
      grecaptcha.reset();
      // hide alert
      id(statusId).classList.add(hiddenClass);
      // remove alert type class on alert
      id(statusId).classList.remove(alertType);
      // show button
      id(submitId).classList.remove(hiddenClass);
    }, false);
  }

  function safelyParseJSON (json) {
    // unpacks json data and catches error
    let parsed;
    try {
      parsed = JSON.parse(json)
      // console.log('paresed json response:');
      // console.log(parsed); //shows json response
    } catch (e) {
      // console.log('error:');
      // console.error(e);  //shows error
      // console.log('un-parsed JSON');
      // console.log(json); //shows non json response
      const message = 'Sorry an error has occured, please try again later.';
      msg(false, message); // error message

    }
    return parsed // Could be undefined! // outputs as variable "json"
  }

  //form submission and status display
  function submitForm() {
    const form = id(formId);
    const formData = new FormData(form);  
    // console.log('submitForm FormData:');
    // for (var entry of formData.entries()) {
    //   console.log(entry[0]+ ', ' + entry[1]); 
    // }
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == (4 || XMLHttpRequest.DONE)) { 
        if (xhr.status >= 200 && xhr.status < 400) { //loading finished //200-299 = success 300-399 = redirect
          const response = safelyParseJSON(this.responseText);
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
      this.on("sendingmultiple", function(file, xhr, formData) {
        // Gets triggered when the form is actually being sent
        // initial event triggered by window.onSubmit
        const formFields = serializeArray(id(formId));
        // console.log('serialised form fields:');
        // console.log(formFields);
        formFields.forEach(function(field){
          formData.append(field.name, field.value);
          // console.log('appended field:');
          // console.log(field.name, field.value);
        });
        // loop over formData
        console.log('dropzone FormData:');
        for (const value of formData.values()) {
          console.log(value);
        }
      });

      this.on("successmultiple", function(files, response) {
        // Gets triggered when the files have successfully been sent.
        msg(true, response.message);
      });
      this.on("errormultiple", function(files, response) {
        // Gets triggered when there was an error sending the files.
        console.log(response);
        if (typeof response.message  === 'undefined') {
          // only show this generic error is there is no response, 
          // as dropzone also assigns error messages to response
          if (message === 'undefined') {  
            const message = 'Sorry there is a connection error, please try again later.';
            msg(false,message);
          }
          
        } else {
          msg(false, response.message);
        }
      });
      this.on("maxfilesexceeded", function(file){
        this.removeFile(file);
        alert('Only 6 files can be uploaded!');
    });
    }
  }

  window.onSubmit = function (token) {
    // console.log('recaptcha token: ' + token);
    // hide submit button
    id(submitId).classList.add(hiddenClass);
    // show spinner
    id(spinnerId).classList.remove(hiddenClass);
    // submit dropzone if it contains files, else just submit form 
    if (photoDropzone.getQueuedFiles().length > 0) {                        
      photoDropzone.processQueue();  
    } else {                       
      submitForm();
    }    
  }

  //check for submit click - grecaptcha does not handle this
  id(submitId).addEventListener('click', function() {
    const form = id(formId);
    if (!form.checkValidity()) {   //if not valid
      //shows errors on failed fields
      form.classList.add('was-validated'); 
    } else { //if valid
      // call recaptcha (execute)
      grecaptcha.execute();
    }
  }, false);

}