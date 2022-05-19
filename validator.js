function Validator (options){

    //Define getParent function
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            };
            element = element.parentElement;
        }
    };
    // Define selectorRules để lưu các rule
    var selectorRules = {};
    
    //Define Validate function
    function validate(inputElement, rule) {
        var erroElement = getParent(inputElement, options.parentClass).querySelector(options.erroTag);
        var erroMessage;
    
        var rules = selectorRules[rule.selector];
    
        for (var i =0; i < rules.length; ++i){
            switch (inputElement.type){
                case 'checkbox':
                case 'radio':
                    erroMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    erroMessage = rules[i](inputElement.value);
            }
           
            if (erroMessage) break;
        }
    
        if (erroMessage) {
            erroElement.innerText = erroMessage;
            getParent(inputElement, options.parentClass).classList.add('invalid');
        } else {
            erroElement.innerText ='';
            getParent(inputElement, options.parentClass).classList.remove('invalid');
        }
        return !erroMessage;
    }
    
    
        // Query đến form
    var formElement = document.querySelector(options.form);
    if (formElement) {
        // Lặp qua từng rule để lấy selector
        options.rules.forEach(function(rule){
    
        // Lưu các rule vào selectorRules
        if (Array.isArray(selectorRules[rule.selector])){
            selectorRules[rule.selector].push(rule.test);
        } else {
            selectorRules[rule.selector] = [rule.test];
        };
    
        //Query đến input tag
        var inputElements = formElement.querySelectorAll(rule.selector);
       
        Array.from(inputElements).forEach(function(inputElement){
    
        // Query đến form thông báo lỗi
        var erroElement = getParent(inputElement, options.parentClass).querySelector(options.erroTag);
        
        // Lắng nghe Event
            inputElement.onblur = function () {
                validate(inputElement, rule);
            }
            
            inputElement.oninput = function () {
                erroElement.innerText ='';
                getParent(inputElement, options.parentClass).classList.remove('invalid');
            }
        })
        })
        
        formElement.onsubmit = function (e) {
            var isFormValid = true;
            e.preventDefault()
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            })
            if(isFormValid) {
                var enableForms = formElement.querySelectorAll('[name]');
                var formValue = Array.from(enableForms).reduce(function(values, input){
                    switch (input.type){
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')){
                                if (!Array.isArray(values[input.name])){
                                    values[input.name] = '';
                                }
                                return values;
                            }
                            if (!Array.isArray(values[input.name])){
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value;
                    }
                    return values;
                },{})
                options.onsubmit(formValue);
            } else {
                console.log('Có lỗi')
            }
        }
    }
    };
    
    Validator.isRequired = function (selector){
        return {
            selector: selector,
            test: function (value) {
                return value ? undefined : 'Vui lòng nhập thông tin vào trường này';
            }
        }
    };
    
    Validator.isEmail = function (selector){
        return {
            selector: selector,
            test: function (value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined : 'Vui lòng nhập đúng email';
            }
        }
    };
    
    Validator.minLength = function (selector, min){
        return {
            selector: selector,
            test: function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        }
    };
    
    Validator.isConfirm = function (selector, getConfirm){
        return {
            selector: selector,
            test: function (value) {
                return value === getConfirm() ? undefined : 'Vui lòng nhập lại đúng thông tin';
            }
        }
    };