export function contactForm({  //defaults
  formID = 'js-contact-form',
  formAction = '',
  formMethod = 'POST',
  submitID = 'submit',
  successID = 'successMessage',
  errorID = 'errorMessage',
  grecaptchaKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // localhost testing 
  grecaptchaLocation = 'bottomright', // bottomright, bottomleft, or inline. use bottom left to avoid scroll to top widget
} = {}) {
 
  window.onSubmit = function (token) {
    console.log('submit clicked');
    var form = document.getElementById(formID);
    if (!form.checkValidity()) {   //if not valid
      console.log('validation failed, grecaptcha reset');
      grecaptcha.reset(); //reset grecaptcha as it only allows 1 click before being disabled
    } else { //if valid
      console.log('validation success');
      submitForm();
   
    }
    form.classList.add('was-validated'); //shows errors on failed fields
  };

  window.onloadCallback = function () {
    grecaptcha.render(submitID, {
      'sitekey': grecaptchaKey,
      'badge': grecaptchaLocation,
      'callback': onSubmit,
    });
    document.getElementById(submitID).disabled = false;
  };


  function submitForm() {
    const show = function (elem) {
      elem.classList.add('is-visible');
    };
    // Hide an element
    const hide = function (elem) {
      elem.classList.remove('is-visible');
    };
    const success = document.getElementById(successID);
    const error = document.getElementById(errorID);
    const form = document.getElementById(formID);
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
    var httpRequest = new XMLHttpRequest();
    httpRequest.open(formMethod, formAction);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) { //SUCCESS
                console.log('Successfully submitted the request');
                hide(form);
                show(success);
            } else { //ERROR
                console.log('Error while submitting the request');
                show(error);
            }
        }
    };
    httpRequest.send(parameters.join('&'));
  }

  // Function that loads scripts on form input focus
  function loadScriptsOnFocus() {
    console.log('captcha head script loaded');
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
    head.appendChild(script);
    // remove focus to avoid js error:
    document.getElementById('form_name').removeEventListener('focus', loadScriptsOnFocus);
  }

  document.getElementById('form_name').addEventListener('focus', loadScriptsOnFocus, false);
  //add event listener to load grecaptcha

}

//test