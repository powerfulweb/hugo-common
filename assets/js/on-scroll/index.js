export function stickyCollapse({  //defaults
    distance = 50,
    parentId = 'js-navParent',
    collapseClass = 'is-collapsed',
    
  } = {}) {

  window.addEventListener('scroll', showOnScroll);

  function showOnScroll() {
    var div = document.getElementById(parentId);  //id of nav bar parent div
    if (document.body.scrollTop > distance || document.documentElement.scrollTop > distance) {
      div.classList.add(collapseClass);
    } else {
      div.classList.remove(collapseClass);
    }
  }
}

export function topNav({  //defaults
    distance = 300,
    parentId = 'js-topNav',
    hiddenClass = 'is-hidden',
  } = {}) {

  window.addEventListener('scroll', showOnScroll);
  const badge = document.getElementById(parentId);  //id of nav bar parent div
  const show = function (elem) {
    elem.classList.remove(hiddenClass);
  };
  const hide = function (elem) {
    elem.classList.add(hiddenClass);
  };
  function showOnScroll() {
    if (document.body.scrollTop > distance || document.documentElement.scrollTop > distance) {
      show(badge);
    } else {
      hide(badge);
    }
  }
}
