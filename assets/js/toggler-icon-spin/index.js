//INSTRUCTION
// requires toggler-icon-spin.scss
// requires   <button id="js-navbarToggler"....   
// <span class="navbar-toggler-icon">&nbsp;</span> x 
//
// to call
// navbarTogglerSpin({
//   // defaults
//   navbarTogglerId: 'js-navbarToggler',
//   expandedClass: 'is-expanded',
// });
'use strict';
export function navbarTogglerSpin({  // defaults
  navbarTogglerId = 'js-navbarToggler',
  expandedClass = 'is-expanded'
} = {}) {
  function id(elem) {
    return document.getElementById(elem); //shorthand used throghout
  }

  const navbarToggler = id(navbarTogglerId);

  navbarToggler.addEventListener('click', function() {
    navbarToggler.classList.toggle(expandedClass);
  });

}