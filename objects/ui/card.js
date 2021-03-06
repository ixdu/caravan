/*
 * Implementation of card abstraction
 * 
 * Card - это что-то вроде колоды карт, стека карт, причём этакого объёмного стека, карта это как листик 
 * дерева.  В зависимости от условий дерево может быть отображено как дерево, стек, сетка, список, пара 
 * списков или как-то иначе. В сущности, чем примитивнее способ отображения(например маленький экран 
 * телефона), тем проще отображение, тем оно последовательнее и меньше, вплоть до списка.  
 */
var uuid = require('../../../modules/uuid.js');
var ui = require('../ui.js');

function slide_animate(ui_item, x, y){
    var anim_slide = new ui.lowlevel.animation([					   {
						       duration : 300,
						       actions : {
							   x : x,
							   y : x
						       }
						   }
					       ],
					       ui_item, null, []);
    anim_slide.start();
}

function nav_bar(card){
    var nb = this,
    _stack = [],
    cur_card = card,
    label_def = {
	x : '40%',
	y : '2%',
	width : '20%',
	height : '16%',
	text : card.name	
    },
    cur_card_name = new ui.lowlevel.label(label_def, null, _stack),
    block_size = ui.block_size,
    next = new ui.lowlevel.button({ 
				      x : '13%',
				      y : '2%',
				      width : '10%',
				      height : '16%',
				      label : 'next',
				      on_press : function(){
					  if(cur_card.next != undefined){
					      slide_animate(cur_card.container.container, -80, -90);
					      slide_animate(cur_card.next.container.container, -80, -90);
					      cur_card = cur_card.next;
					      nb.set_current(cur_card);
					  }
				      }
				  }, null, _stack),
    prev = new ui.lowlevel.button({ 
				      x : '2%',
				      y : '2%',
				      width : '10%',
				      height : '16%',
				      label : 'prev',
				      on_press : function(){
					  if(cur_card.prev.length){	
					      slide_animate(cur_card.container.container, 80, 90);
					      slide_animate(cur_card.prev[0].container.container, 80, 90);
					      cur_card = cur_card.prev[0];
					      nb.set_current(cur_card);
					  }
				      }
				  }, null, _stack);
    this.get_current = function(){
	return cur_card;	
    };

    this.set_current = function(card){
	cur_card = card;
	cur_card_name.destroy();
	label_def.text = card.name;
	cur_card_name = new ui.lowlevel.label(label_def, null, _stack);
    };

    this.destroy = function(){
	cur_card_name.destroy();
	next.destroy();
	prev.destroy();
    };
};

var root,
    cards = {},
    nav_bar_obj;

module.exports = function(info, dsa, stack){
    //trying to find card with that name
    var card;

    for(key in cards){
	if(cards[key].name == info.name){
	    card = this.card = cards[key];
	    this.old = true;
	    var cur_card = nav_bar_obj.get_current();
	    nav_bar_obj.set_current(card);
	    card.prev.push(cur_card);
	    slide_animate(cur_card.container.container, -80, -90);
	    slide_animate(card.container.container, -80, -90);
	    card.prev.next = this.card;
	}
    }

    //creating new card
    if(typeof this.card == 'undefined' ){	
	var block_size = stack.block_size,
	id = uuid.generate_str();
	card = cards[id] = this.card  = {
	    id : id,
	    name : info.name,
	    geometry : {
		x : '100%',
		y : '100%',
		width : '60%', //нужно менять свой размер в card_alloc_space
		height : '60%'
	    },
	    cur_offset_x : 0,
	    cur_offset_y : 0,
	    cur_part_y : 0,

	    prev : [],
	    next : null
	};

	stack.parent = undefined; //too lowlevel
	card.container = new ui.lowlevel.container(card.geometry, null, stack);

	if(typeof stack['card'] == 'undefined'){
	    //adding controls for card navigating
	    nav_bar_obj = new nav_bar(card);
	    slide_animate(card.container.container, -80, -90);
	} else {
	    card.prev.push(nav_bar_obj.get_current());
	    nav_bar_obj.set_current(card);
	    slide_animate(card.container.container, -80, -90);
	    slide_animate(card.prev[0].container.container, -80, -90);
	    card.prev.next = this.card;
	}	
    }

    stack['card'] = this;
    
    this.alloc_space = function(stack){
	var card = stack['card'].card;
	var block_size = ui.block_size;
	
	stack['part_position'] = {};
	var part_height = stack.part.height + block_size.height / 10;
	if(stack.part.hasOwnProperty('row') &&
	   stack.part.row){
	    var part_width = stack.part.width + block_size.width/10;
	    if(card.width <= card.cur_offset_x + stack.part.width + block_size.width / 10){
		card.cur_offset_x += part_width;
		card.width += part_width;   
	    } else {
		if(card.width < part_width)
		    card.width += part_width;   
		card.cur_offset_x = 0;
		card.cur_part_y = card.cur_offset_y;
		card.cur_offset_y += part_height;
		card.height += part_height;
	    }		   
	} else {
	    card.cur_part_y = card.cur_offset_y;
	    card.cur_offset_y += part_height;
	    card.height += part_height;
	}
	
	stack.part_position = {
	    x : card.cur_offset_x,
	    y : card.cur_part_y
	};
	
    };

    this.destroy = function(){
//	if(stack.card == this)
//	    stack.card = undefined; //need replace with prev card
	with(this){
	    delete cards[card.id];
	    card.container.destroy();
	    card.prev[0].next = null;
	    if(nav_bar_obj.get_current() == card){
		nav_bar_obj.set_current(card.prev[0]);
		slide_animate(card.prev[0].container.container, 80, 90);		
	    }
	}
    };    

    this.hide = function(stack){
	
    };

    this.make_current = function(stack){
	stack['card'] = this;
	this.card.container.make_current(stack);
    };
};