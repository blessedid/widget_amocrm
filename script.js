define(['jquery', 'lib/components/base/modal'], function($, Modal) {
    var FoxfordWidget = function() {
        var self = this;
        this.basket = [];
        this.delBasket = [];
        this.apiBase = 'https://site.ru';

        this.ajaxReq = function (method, url, data={}) {
            return $.ajax({
                type: method,
                url:  url,
                data: data,
                dataType: 'json',
                crossDomain: true,
                // async: false
            });
        }
        this.renderElement = function(name, CFname) {
            var element = '',
                result = [],
                $this = this;
            self.ajaxReq('GET', self.apiBase + name)
                .done(function (res) {
                    if(name == 'disciplines' || name == 'levels'){
                        result.push({option:'Выбрать', id:null});
                    }
                    $.each(res, function(i, item) {
                        result.push({
                            option: item.name,
                            id: item.id || item.type
                        });
                    });
                    element = $this.render({
                            ref: '/tmpl/controls/select.twig'
                        }, // объект data в данном случае содержит только ссылку на шаблон
                        {
                            items: result, //данные
                            id: name + '_list', //указание id
                            name: CFname || name.substring(0, name.length - 1) + '_id'
                        });
                    $('.foxford-' + name).html(element);
                });
        };
        this.renderButton = function(text, type, id, class_name){
            var element = self.render({
                    ref: '/tmpl/controls/button.twig'
                }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    text: text,
                    type: type || 'button',
                    id: id || '',
                    class_name: class_name || ''
                });
            return element;
        };
        this.renderInput = function(name, placeholder){
            var element = self.render({
                    ref: '/tmpl/controls/input.twig'
                }, // объект data в данном случае содержит только ссылку на шаблон
                {
                    name: name,
                    placeholder: placeholder || ''
                    //style: {width: '100%'}
                });
            return element;
        };
        this.renderProducts = function (data) {
            var template = '  <div class="foxford-products">{% for item in items %}\
    <div class="foxford-product-wrap">\
      <div class="foxford-product-icon"><img src="" alt=""></div>\
      <div class="foxford-product-content">\
        <div class="foxford-product-content__head">{{item.name}}</div>\
        <div class="foxford-product-content__body">\
          <table class="foxford-table">\
            <tbody class="foxford-table">{% for product in item.products %}\
              <tr class="foxford-table" id="{{item.id}}">\
                <td class="foxford-table">{{product.name}}</td>\
                <td class="foxford-table">\
                  <div class="foxford-table__basket-text"\
                   data-name-item="{{item.name}}"\
                   data-resource-type="{{product.resource_type}}"\
                   data-resource-id="{{product.resource_id}}"\
                   data-cart-item-type="{{product.cart_item_type}}"\
                   data-name="{{product.name}}">Добавить в корзину</div>\
                </td>\
              </tr>{% endfor %}\
            </tbody>\
          </table>\
         </div>\
      </div>\
    </div>{% endfor %}\
    <div class="foxford-product-wrap"><a class="foxford-go-basket" href="javascript:$(\'#foxford_basket\').click()">Перейти в корзину</a></div>\
  </div>';
            return self.render({data : template},{items: data});
        };
        this.renderBasket = function (data) {
            var template = '  <div class="foxford-products">\
    <div class="foxford-product-wrap">\
      <div class="foxford-product-icon"><img src="" alt=""></div>\
      <div class="foxford-product-content">\
        <div class="foxford-product-content__head">Корзина</div>\
        <div class="foxford-product-content__body">\
          <table class="foxford-table">\
            <tbody class="foxford-table">{% for key,item in items %}\
              <tr class="foxford-table">\
                <td class="foxford-table"><span style="font-weight: bold;">{{item.name_item}}</span> {{item.name_products}}</td>\
                <td class="foxford-table">\
                  <div class="foxford-table__basket-del"\
                   data-id="{{ key }}">Удалить</div>\
                </td>\
              </tr>{% endfor %}\
            </tbody>\
          </table>\
          <table class="foxford-table">\
            <tbody class="foxford-table">\
              <tr class="foxford-table">\
                <td>'+ self.renderInput('promo_code', 'Промокод') +'</td>\
                <td class="foxford-table">\
                	<button type="submit" class="button-input   button-input_blue" tabindex="" id="foxford_gen_link">\
                		<span class="button-input-inner "><span class="button-input-inner__text">Сгенерировать ссылку </span></span>\
                	</button>\
                </td>\
              </tr>\
            </tbody>\
          </table>\
        </div>\
      </div>\
    </div>\
  </div>';
            return self.render({data : template},{items: data});
        };
        this.printTask = function (text) {
        	var task = {
                        add: [
                            {
                                element_id: AMOCRM.constant('card_id'),
                                element_type: "2",
                                text: text,
                                note_type: "4",
                                created_at: Math.floor(Date.now() / 1000),
                                responsible_user_id: AMOCRM.constant('user').id,
                                created_by: AMOCRM.constant('user').id
                            }
                        ]
                    };
                    self.ajaxReq('post', '/api/v2/notes', $.param(task));
        }

        this.callbacks = {
            render: function() {
                // self.setConstant();
                self.render_template({
                    caption: {
                        class_name: 'js-ac-caption',
                        html: ''
                    },
                    body: '',
                    render: '<div class="ac-form">' +
                    '<form class="foxford_form">' +
                    '<div class="form__field">' +
                    '<div class="form__field__label">Тип ресурса</div>' +
                    '<div class="form__field__value foxford-resource_types">' + self.renderElement('resource_types', 'resource_type') + '</div>' +
                    '</div>' +
                    '<div class="form__field">' +
                    '<div class="form__field__label">Класс обучения</div>' +
                    '<div class="form__field__value foxford-grades">' + self.renderElement('grades') + '</div>' +
                    '</div>' +
                    '<div class="form__field">' +
                    '<div class="form__field__label">Предмет</div>' +
                    '<div class="form__field__value foxford-disciplines">' + self.renderElement('disciplines') + '</div>' +
                    '</div>' +
                    '<div class="form__field">' +
                    '<div class="form__field__label">Цель обучения</div>' +
                    '<div class="form__field__value foxford-levels">' + self.renderElement('levels') + '</div>' +
                    '</div>' +
                    '<div class="form__field" style="margin-top: 10px;">'+
                    self.renderButton('Найти', 'submit', 'foxford_search', 'button-input_blue') +
                    self.renderButton('Корзина', '', 'foxford_basket') +
                    '</div>'+
                    '</form>' +
                    '</div>'
                });
                return true;
            },
            init: function() {
                $('head').append('<link rel="stylesheet" href="' + self.get_settings().path + '/css/main.css" />');
                return true;
            },
            bind_actions: function() {

                $('.foxford_form').on('submit', function(e) {
                    e.preventDefault();

                    var dataModal = '<div class="foxford-container"></div>',
                        dataForm = $(this).serializeArray();
                    self.ajaxReq( 'get', self.apiBase + 'resources', dataForm )
                        .done(function (data) {
                        	$('.foxford-container').append(self.renderProducts(data));

                            $('.foxford-table__basket-text').on('click', function(e) {
                            	$(this).off();
                                $(this).fadeOut('slow', function() {
                                    $(this).parent().append('<div class="basket-text-add">Добавлено в корзину</div>');
                                });

                                self.basket.push({
                                    resource_type: $(this).data("resource-type"),
                                    resource_id: $(this).data("resource-id"),
                                    cart_item_type: $(this).data("cart-item-type"),
                                    name_products: $(this).data("name"),
                                    name_item: $(this).data("name-item")
                                });
                            });
                        });

                    // console.log(res,dataForm);
                    modal = new Modal({
                        class_name: 'modal-window',
                        init_animation: true,
                        default_overlay: true,
                        init: function($modal_body) {
                            var $this = $(this);
                            $modal_body.trigger('modal:loaded') //запускает отображение модального окна
                                .html(dataModal)//.trigger('modal:centrify') //настраивает модальное окно
                                .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                            setTimeout(function(){
								$modal_body.trigger('modal:centrify');
							},500);
                        }
                    });
                    //
                });

                $('#foxford_basket').on('click', function(e) {
                    var data = '<div class="foxford-container">'+ self.renderBasket(self.basket) +'</div>';
                    modal = new Modal({
                        class_name: 'modal-window',
                        init_animation: true,
                        default_overlay: true,
                        init: function($modal_body) {
                            var $this = $(this);
                            $modal_body.trigger('modal:loaded') //запускает отображение модального окна
                                .html(data).trigger('modal:centrify') //настраивает модальное окно
                                .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                            $('.foxford-table__basket-del').on('click',  function(e) {
                            	e.preventDefault();
                            	delete self.basket[$(this).data("id")];
                            	self.delBasket.push( $(this).data("id") );
                            	$(this).parent().parent().remove();
                            });
                            $('#foxford_gen_link').on('click', function(e) {
                            	e.preventDefault();
                            	var taskText = "Корзина:\n",
                            		data = {
									  cart_template: {
									    promo_code: $('[name=promo_code]').val(),
									    cart_template_resources_attributes: []
									  }
									};
								$.each(self.basket, function(i, item) {
									if(typeof item != 'undefined'){
										data['cart_template']['cart_template_resources_attributes']
											.push({
												resource_type: item.resource_type,
			                            		resource_id: item.resource_id,
			                            		cart_item_type: item.cart_item_type
											});
										taskText += '• '+ item.name_item  +' '+ item.name_products +"\n";
									}
								});
								if (self.basket.length > 0) {
									self.ajaxReq('post', self.apiBase + 'cart_templates', $.param(data))
                            		.done(function(res) {
                            			self.printTask(taskText + "Ссылка: " + res.url);
                            			navigator.clipboard.writeText(res.url)
										  .then(() => {
										    console.log('Ссылка скопирована в буфер обмена!');
										  })
										  .catch(err => {
										    console.log('Something went wrong', err);
										  });
                            		});
								}
								$('.modal-body__close').click();
                            });
                        },
                        destroy: function ($modal_body) {
                        	self.delBasket.forEach(function(i, item) {
								self.basket.splice(item , 1);
                        	});
                        	self.delBasket.length = 0;
                        }
                    })
                });
                return true;
            },
            settings: function() {
                return true;
            },
            onSave: function() {
                return true;
            },
            destroy: function() {},
            contacts: {
                //select contacts in list and clicked on widget name
                selected: function() {
                    console.log('contacts');
                }
            },
            leads: {
                //select leads in list and clicked on widget name
                selected: function() {
                    console.log('leads');
                }
            },
            tasks: {
                //select taks in list and clicked on widget name
                selected: function() {
                    console.log('tasks');
                }
            }
        };
        return this;
    };
    return FoxfordWidget;
});