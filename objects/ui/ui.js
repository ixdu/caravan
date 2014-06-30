/*
 * Реализация концепции ui, где каждый элемент представлен объектом, интегрированным с sprout.
 * Главная задача в том, чтобы небыло никакой разницы при формировании ui для различных 
 * устройств(от 1,5 до 60 дюймов), используя один набор инструментов
 */

function pc(){
    var ui = {
    };

    ui.label = require('./ll/native/label.js');
//    ui.button = require('./ll/native/button');
    ui.button = require('./ll/overlay/button.js');
    ui.entry = require('./ll/native/entry.js');
    ui.panel = require('./ll/overlay/panel.js');
    ui.container = require('./ll/overlay/container.js');

    return  ui;
}

exports.block_size = { width : 40, height : 30 };

exports.lowlevel;

exports.init = function(style){
    if(style == 'pc') //personal computer interface
	exports.lowlevel = pc();
};

exports.block_size_ask = function(){
    var ll = exports.lowlevel, ask_container;
    
    (ask_container = 
     new ll.container({
			  x : '15%',
			  y : '5%',
			  width : '70%',
			  height : '90%'
		      })).sprout(
			  ll.label({
				       x : '0%',
				       width : '100%',
				       height : '30px',
				       
				       text : 'Выберите подходящий размер'
				   }),
			  ll.button({
					x : '0%',
					y : '30px',
					width : '120px',
					height : '30px',
					label : 'Такой',
					on_pressed : function(){
					    exports.block_size = { width : 120, 
								   height : 30 };
					    ask_container.destroy();
					}
				    }),
			  ll.button({
					x : '0%',
					y : '62px',
					width : '200px',
					height : '60px',
					label : 'Сякой',
					on_pressed : function(){
					    exports.block_size = { width : 200, 
								   height : 60 };
					    ask_container.destroy();
					}
				    }),
			  ll.button({
					x : '0%',
					y : '124px',
					width : '400px',
					height : '100px',
					label : 'Этакий',
					on_pressed : function(){
					    exports.block_size = { width : 400, 
								   height : 100 };
					    ask_container.destroy();
					}
			      }),
			  msg(ll_widgets.button, 'create', {
				  x : '0%',
				  y : '226px',
				  width : '600px',
				  height : '140px',
				  label : 'Большой',
				  on_pressed : function(){
					    exports.block_size = { width : 600, 
								   height : 140 };
					    ask_container.destroy();
				  }
			      })
		      );
};
