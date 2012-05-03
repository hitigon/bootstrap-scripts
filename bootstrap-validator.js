/**
 * bootstrap-validator.js v1.0.0
 *
 * May 2012, @hitigon
 * 
 * Just think it as a light version of jQuery Validation Plugin. :)
 * Most of it is modified from jQuery Validation Plugin, thanks Jörn Zaefferer for creating such a great plugin.
 * You can read more information about it from blow URLs:
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * P.S: I will update the differeces bewteen them later.
 */

!function($) {

	"use strict"

	var Validate = function (element, options) {
    	this.$element = $(element);
    	this.options = $.extend({}, $.fn.validator.defaults, options);
    	this.init();
  	};

  	Validate.prototype = {

  		constructor: Validate,

  		init: function() {

  			var that = this;

  			this.msgList = {};

  			function delegate(event) {

  				var validator = that,
  					eventType = 'on' + event.type;

  				try {
  					$.fn.validator.events[eventType].call(validator, event, $(this));
  				} catch(e) {
  					console.log('Oooops, something is really wrong.');
  					throw e;
  				}
  				
  			}

  			this.$element.on(
  				"focusin focusout keyup",
  				"[type='text'], [type='password'], [type='file'], select, textarea",
  				delegate
  				).on(
  				"click",
  				"[type='radio'], [type='checkbox'], select, option",
  				delegate
  				);
  		},

  		form: function() {
  			var elements = this.getElements();
  			
  			for (var i = 0; i < elements.length; i++) {
  				this.element($(elements[i]), false);
  			}

  			return this.valid();
  		},

  		element: function(element, event) {
  			
  			var result = this.check(element),
  				id = element.attr('id');
  			
  			this.lastElement = element[0];

  			if (result) {
  				delete this.msgList[id];
  				this.hideMsg(element);

  				if (!event || event.type != 'keyup') {
  					this.checkHandler(element);
  				}
  			}
  			this.showMsgs();
  			return result;
  		},

  		check: function(element) {
  			var rules = this.getRules(element);
  			for (var i = 0; i < rules.length; i++) {
  				try {
  					
  					var value = element.val(),
  						id = element.attr('id'),
  						param = this.getParam(rules[i]),
  						result = $.fn.validator.methods[rules[i]].call(this, element, value, param);
  					
  					if (!result) {
  						this.msgList[id] = this.getMessage(rules[i]);
  						return false;
  					}
  				} catch(e) {
  					console.log("Oooops, something is really wrong.");
  					throw e;
  				}
  			}
  			return true;
  		},

  		checkHandler: function(element) {
  			var rules = this.getRules(element);
  			for (var i = 0; i < rules.length; i++) {
  				var handler = this.getHandler(rules[i]);
  				if (handler) {
  					handler.call(this, element, rules[i]);
  				}
  			}
  		},

  		valid: function() {
  			for (var msg in this.msgList) {
  				return false;
  			}
  			return true;
  		},

  		showMsgs: function() {
  			var errorClass = this.options.errorClass,
  				targetClass = '.' + this.options.targetClass,
  				msgClass = '.' + this.options.msgClass;

  			for (var item in this.msgList) {
  				$('#' + item).parent(targetClass).addClass(errorClass)
  							.children(msgClass).removeClass('hide').text(this.msgList[item]);
  			}	
  		},

  		hideMsg: function(element) {
  			var errorClass = this.options.errorClass,
  				targetClass = '.' + this.options.targetClass,
  				msgClass = '.' + this.options.msgClass;
			element.parent(targetClass).removeClass('error').
					children(msgClass).addClass('hide').text('');
  		},

  		isOptional: function(element) {
  			return !$.fn.validator.methods.required.call(this, element, element.val());
  		},

  		getRules: function(element) {
  			var ruleList = $(element).data('rules');
  			return ruleList.split('\ ');
  		},

  		getParam: function(rule) {
  			return this.options[rule];
  		},

  		getHandler: function(rule) {
  			return this.options[rule + 'Handler'];
  		},

  		getMessage: function(rule) {
  			return this.formatMessage($.fn.validator.messages[rule], rule);
  		},

  		getElements: function() {
  			return this.$element.find("input, select, textarea").
  								not(":submit, :reset, :image, [disabled]");
  		},

  		getLength: function(element, value) {
  			var elem = element[0]
  			
  			switch( elem.nodeName.toLowerCase() ) {
			case 'select':
				return $('option:select', elem).length;
			case 'input':
				if (elem.type == 'password') {
					return value.length;
				} 
				if (this.checkable(element)) {
					return element.filter(':checked').length;
				}
				return $.trim(value).length;
			}
  		},

  		checkable: function(element) {
			return /radio|checkbox/i.test(element[0].type);
		},

  		formatMessage: function(source, rule) {
  			var param = this.getParam(rule);

  			if (param) {
  				if (param.constructor != Array) {
  					param  = [ param ];
  				}
  				$.each(param, function(i, n) {
					source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
				});
  			}
  			return source;
  		},
  	};

  	
	$.fn.validator = function(option) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('validate'),
		        options = typeof option == 'object' && option;
	     	if (!data) $this.data('validate', (data = new Validate(this, options)));
	     	$this.submit(function(event) {
	     		event.preventDefault();
	     		if (data.form() && options.submitHandler) {
	     			return options.submitHandler.call(this);
	     		} else {
	     			return false;
	     		}
	     	})
		});
	};
	
	
	$.fn.validator.methods = {
		
		required: function(element, value) {
	  		return this.getLength(element, value) > 0;
	  	},
	  	
	  	email: function(element, value) {
	  		return this.isOptional(element) || /^((([a-z]|\d|[\-\_]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
	  	},

	  	url: function(element, value) {
	  		return this.isOptional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
	  	},

	  	date: function(element, value) {
	  		return this.isOptional(element) || !/Invalid|NaN/.test(new Date(value));
	  	},

	  	number: function(element, value) {
			return this.isOptional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},

	  	digits: function(element, value) {
			return this.isOptional(element) || /^\d+$/.test(value);
		},

	  	minlength: function(element, value, param) {
	  		return this.isOptional(element) || value.length >= param;
	  	},

	  	maxlength: function(element, value, param) {
	  		return this.isOptional(element) || value.length <= param;
	  	},

	  	rangelength: function(element, value, param) {
	  		return this.isOptional(element) || (value.length >= param[0] && value.length <= param[1]);
	  	},

	  	min: function(element, value, param) {
	  		return this.isOptional(element) || value >= param;
	  	},

	  	max: function(element, value, param) {
	  		return this.isOptional(element) || value <= param;
	  	},

	  	range: function(element, value, param) {
	  		return this.isOptional(element) || (value >= param[0] && value <= param[1]);
	  	},

	  	username: function(element, value, param) {
	  		return this.isOptional(element) || ((value.length >= param[0] && value.length <= param[1]));
	  	},

	  	password: function(element, value, param) {
	  		return this.isOptional(element) || value.length >= param;
	  	},

	  	repassword: function(element, value, param) {
	  		return this.isOptional(element) || $(param).val() == value;
	  	},

	  	image: function(element, value, param) {

	  	},

	  	strict: function(element, value) {
	  		return this.isOptional(element) || /^([a-z]|[0-9]|\_)+$/i.test(value);
	  	}
	};

	$.fn.validator.events = {

		onfocusout: function(event, element) {
			if (!this.isOptional(element)) {
				this.element(element, event);
			}			
		},
		
		onfocusin: function(event, element) {
			
		},
		
		onkeyup: function(event, element) {
			if (element[0] == this.lastElement) {
				this.element(element, event);
			}
		},
		
		onclick: function(event, element) {

		},
		
	};

	$.fn.validator.defaults = {
		minlength: 0,
		maxlength: 200,
		rangelength: [0, 200],
		min: 0,
		max: 100,
		range: [0, 100],
		username: [3, 16],
		password: 6,
		repassword: '#password',
		targetClass: 'control-group',
		errorClass: 'error',
		warningClass: 'warning',
		msgClass: 'help-inline',
	};

	$.fn.validator.messages = {
		required: '这里一定要填的呀',
		email: '邮箱的格式貌似不太对哦',
		url: '网址似乎不太正确啊',
		date: '喂喂，这是日期吗？',
		number: '唔，这个不是数字吧',
		digits: '唔，这个不是数字吧',
		minlength: '最小长度是 {0} 个字符哦',
		maxlength: '最大长度是 {1} 个字符哦',
		rangelength: '长度要在 {0} 和 {1} 个字符之间哦',
		min: '最小值是 {0} 哦',
		max: '最大值是 {1} 哦',
		range: '这个值要在 {0} 和  {1} 之前哦',
		username: '用户名长度要在 {0} 和 {1} 个字符之间哦',
		password: '密码长度要大于 {0} 个字符哦',
		repassword: '唔，两次输入的密码不一致哦',
		strict: '好像有奇怪的字符混入了哦',
	};

	$.fn.validator.Constructor = Validate;

}(window.jQuery);