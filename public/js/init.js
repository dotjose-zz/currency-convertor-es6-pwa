$(document).ready(function(){
  // fill dropdown option
  $.get("http://localhost:3000/currencies", function(data) {
    $.each(data.results, function(index, value) {
      $(".currency-list").append($("<option />").val(value.id).text(value.id));
      $('select').formSelect();
    });
  });
  // select default value
  $("select>option:eq(3)").find('option[value=""]').prop('selected', true);
});

// register service worker
(function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
