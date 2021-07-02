// for use with PWD endpoint
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


  // select inputs. range over file inputs. check size. add field.setCustomValidity("Invalid field."); or field.setCustomValidity("");
  // and add was-validated to form this should enact the bs validation messages. otherwise hack with "is-invalid" class on file input (there will still be a green tick)

  // Filevalidation = () => {
  //   const fi = document.getElementsByTagName
  //   // Check if any file is selected.
  //   if (fi.files.length > 0) {
  //     for (const i = 0; i <= fi.files.length - 1; i++) {

  //         const fsize = fi.files.item(i).size;
  //         const file = Math.round((fsize / 1024));
  //         // The size of the file.
  //         if (file >= 4096) {
  //             alert(
  //               "File too Big, please select a file less than 4mb");
  //         } else if (file < 2048) {
  //             alert(
  //               "File too small, please select a file greater than 2mb");
  //         } else {
  //             document.getElementById('size').innerHTML = '<b>'
  //             + file + '</b> KB';
  //         }
  //     }
  //   }
  // }
  function resetAlert() {
    // remove event listener
    document.getElementById(inputNameId).removeEventListener('focus', resetAlert);
    //reset grecaptcha as it only allows 1 click before being disabled
    grecaptcha.reset(); 
    // reset bs form validation state
    id(formId).classlist.remove('was-validated');
    // hide alert
    id(statusId).classList.add(hiddenClass); 
    // show button 
    id(submitId).classList.remove(hiddenClass); 
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
  let alertType;
  function msg(status, statusMsg) {
    if (status === true) { // success 
      alertType = successClass;
      //id(formId).classList.add(hiddenClass); //hide form
    } else { // error
      alertType = errorClass;
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
      // console.log(parsed); //shows json response
    } catch (e) {
      // console.error(e);  //shows error
      // console.log(json); //shows non json response
      const message = 'Sorry an error has occured, please try again later.';
      msg(false, message); // error message
    }
    return parsed // Could be undefined! // outputs as variable "json"
  }
  

  //const progressBar = document.getElementById("progress");
  //form submission and status display
  function submitForm() {
    const form = id(formId);
    let formData = new FormData(form);   
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == (4 || XMLHttpRequest.DONE)) { 
        if (xhr.status >= 200 && xhr.status < 400) { //loading finished //200-299 = success 300-399 = redirect
          var response = safelyParseJSON(this.responseText);
          // console.log(this.responseText);
          if (response.success === true) { // php returns success === true
            msg(true, response.message); // success message
            //msg(true, 'temp success msg'); // success message
            //reset form and reset alert/button on name input focus
            form.reset();
            document.getElementById(inputNameId).addEventListener('focus', resetAlert, false);
          } else {  // php returns error
            msg(false, response.message); // error message
          }
        } else { // http error
          const message = 'Sorry the form is not available at the moment, please try again later.';
          msg(false, message); // error message
        }
      } 
    }; // end function

    //progress bar
    // xhr.upload.onprogress = function (e) {
    //   if (e.lengthComputable) {
    //       progressBar.max = e.total;
    //       progressBar.value = e.loaded;
    //   }
    // }
    // xhr.upload.onloadstart = function (e) {
    //     progressBar.value = 0;
    // }
    // xhr.upload.onloadend = function (e) {
    //     progressBar.value = e.loaded;
    // }
    // xhr.send(parameters.join('&')); 
    xhr.send(formData);
    // console.log(parameters.join('&'));b
  }
};



