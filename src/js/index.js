
$(document).ready(function () {

  const options = {
    wrapperClass: 'form__field-wrapper',    //default - "field-wrapper"
    tooltipClass: 'form__error-message',    //default - "tooltips"
    tooltip: true,                          //default - true
    messages: {
      messageEmpty: 'Поле должно быть заполнено',
      messageMin: 'Поле должно содержать минимум {n} символа',
    },
    clear: true,                            //default - true
    privacyCheckbox: '#checkbox-1',         //default - false | checkbox .class/#id or false
    submitButton: '.form__button',          //default - "[type="submit"]"-- | submit button .class/#id
    //googleCaptcha3: true,                 //default - false
    validators: {
      'phone': [validatePhone, validatePhone2],
      'password-1': [validatePassword],
    },
    validate: function(values){
      const errors = {};
      const pass1 = (values['password-1'] || '').trim();
      const pass2 = (values['password-2'] || '').trim();
      if (pass1 !== '' && pass2 !== '') {
        if (pass1 !== pass2) {
          errors['password-2'] = 'Пароли не совпадают';
        }
      }

      if (Object.keys(errors).length) {
        return errors;
      }
    },
    beforeSend: function() {
      console.log('Делаем что-то перед отправкой');
    },
    error: function(){
      console.log('Прилетели ошибки');
    },
    success: function() {
      alert('Успех! Форма отправлена!');
    },
    rejected: function() {
      alert('Алярм! Форма не отправлена!');
    }

  };

  $('.form').quickForm(options);

  function validatePhone(value) {
    console.log('Проверка корректности номера - 1') ;
  }
  function validatePhone2(value) {
    console.log('Проверка корректности номера - 2');
  }

  function validatePassword(value) {
    console.log('Проверка корректности пароля');
  }

});

