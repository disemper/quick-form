(function( $ ){

  $.fn.quickForm = function( options= {}) {

    const {
      wrapperClass = 'field-wrapper',
      tooltipClass = 'tooltips',
      tooltips = true,
      clear = true,
      messages: {
        messageEmpty = 'Поле обязательно для заполнения',
        messageMin = 'Минимальное кол-во символов: {n}'
      } = {},
      validators = false,
      privacyCheckbox = true,
      submitButton = '[type="submit"]',
      googleCaptcha3 = false,
      validate = function(){},
      beforeSend = function(){},
      success = function(){},
      rejected = function(){},
      error = function(){},
    } = options ;

    return this.each(function() {
      var ths = $(this);

      const inputFields = ths.find('input:not([type="hidden"], [type="checkbox"], [type="radio"]), textarea')
        .on('input', function () {
          const field = $(this);
              field.removeClass('is-invalid is-valid');
          if (isEmpty(field) && isRequired(field)) {
            setErrorField(field);
          } else {
            field.addClass('is-valid');
            hideTooltip(field);
          }
        });

      inputFields.each(wrapping);
      if (tooltips) {
        createTooltips(inputFields);
      }
      if (privacyCheckbox) {
        controlPrivacy(ths);
      }

      ths.on('submit', function (e) {
        e.preventDefault();
        const form = $(this);
        const button = form.find(submitButton);
        const url = form.attr('action');
        const method = form.attr('method') || 'POST';
        let data = new FormData(form[0]);

        if (validation(form)) {

          if(googleCaptcha3) {
            if (RECAPTCHA_KEY !=='None') {
              grecaptcha.execute(RECAPTCHA_KEY, {action: 'generic'}).then(token => {
                data['g-recaptcha-response'] = token;
                sendAjax();
              });
            } else {
              sendAjax();
            }
          } else {

            beforeSend();

            button.prop('disabled', true);

            sendAjax();

          }

          function sendAjax() {
            $.ajax(url, {
              method: method,
              data: data,
              processData: false,
              contentType: false,
              success: function (result) {
                if (result.status === "success") {
                  clearForm(form);
                  success();
                } else {
                  for (const errorName in result.errors) {
                    const field = form.find('[name="'+ errorName +'"]');
                    setErrorField(field, result.errors[errorName][0]);
                  }
                  error();
                }
                button.prop('disabled', false);
              },
              error: function () {
                rejected();
                button.prop('disabled', false);
              }
            });
          }
        }
      });

    });

    function validation(form) {
      let errors = false;
      const values = {};

      form.find('input:not([type="hidden"], [type="checkbox"], [type="radio"]), textarea').each(function () {
        const field = $(this);
        const value = field.val();
        const fieldName = field.attr('name');
        values[fieldName] = value;

        if (isRequired(field) && isEmpty(field)) {
          setErrorField(field);
          errors = true;
          return;
        }
        if (!isEmpty(field) && isMin(field)) {

          const reg = /\{\w+\}/;
          newMessageMin = messageMin.replace(reg, field.attr('minlength'));

          setErrorField(field, newMessageMin);

          errors = true;
          return;
        }

        if (validators) {

          if (validators[fieldName]) {
            for (const method in validators[fieldName]) {
              const func = validators[fieldName][method];
              if (func(value)) {
                setErrorField(field, func(value));
                errors = true;
                return;
              }
            }
          }
        }

      });

      const validateResult = validate(values);

      if (validateResult) {
        for (fieldName in validateResult) {
          const field = form.find('[name="'+ fieldName +'"]');
          setErrorField(field, validateResult[fieldName]);
        }
        errors = true;
      };

      return !errors;
    }

    function isEmpty(field) {
      let value = field.val();
      value = (value || '').trim();
      return (value === '');
    }
    function isMin(field) {
      const value = field.val();
      const minLength = field.attr('minlength');
      if (minLength) {
        return value.length < +minLength;
      }
    }

    function isRequired(field) {
      return (field.attr('required'))
    }

    function wrapping(){
      const field = $(this);
      field.wrap('<div class="'+ wrapperClass +'"></div>');
    }

    function createTooltips(inputFields) {
      inputFields.each(function () {
        const field = $(this);
        const tooltip = '<span class="'+ tooltipClass +'"></span>';
        field.parent().append(tooltip);
        genTooltipMessage(field);
        hideTooltip(field);
      })
    }

    function hideTooltip(field) {
      field.parent().find('.' + tooltipClass).fadeOut(0);
    }
    function showTooltip(field) {
      field.parent().find('.' + tooltipClass).fadeIn(200);
    }

    function genTooltipMessage(field, message) {
      const tooltip = field.parent().find('.' + tooltipClass);
      if (message) {
        tooltip.html(message)
      } else if (isRequired(field)) {
        tooltip.html(messageEmpty);
      } else {
        tooltip.html('');
      }
    }

    function setErrorField(field, message) {
      field.addClass('is-invalid');
      genTooltipMessage(field, message);
      showTooltip(field);
    }

    function controlPrivacy(form) {
      const button = form.find(submitButton);
      const checkbox = form.find(privacyCheckbox)
        .on('change', function () {
          const check = $(this).prop('checked');
          button.prop('disabled', !check);
        });
      if (checkbox.length && checkbox.prop('checked') !== true) {
        button.prop('disabled', true);
      }
    }

    function clearForm(form) {
      if (clear) {
        form.trigger('reset');
        controlPrivacy(form);
        form.find('input, textarea').removeClass('is-valid is-invalid');
      }
    }

  };
})( jQuery );