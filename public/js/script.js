(() => {
  'use strict'

  // Fetch all forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission if invalid
  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      // This class triggers Bootstrap's red/green borders and icons!
      form.classList.add('was-validated');
    }, false);
  });
})();