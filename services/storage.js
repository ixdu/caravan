/*
 * Storage service, one front end for diffent backends - local, srb, cloud, bittorrent etc
 * 
 */

function backends_read(env, mq){
    var backends = {
	srb  : env.dsa.service_loader('./dsa/services/storage_backends/srb', mq, env),
	local : env.dsa.service_loader('./dsa/services/storage_backends/local', mq, env)
    }

    //читаем папку cloud_storage_backends и подгружаем бэкенды
    return backends;
}

//возможно проверку надо осуществлять на стороне клиента
function verify_object_info(){
    return null;
}

exports.init = function(env, dsa){
    var backends = backends_read(env);
 /*   dsa.on("storage_info",
	   function(client){
	       send(client, 'storage_info', { "backends" : backends });	
	   },
	    ///вероятно сообщения нужно просто перенаправлять backend'у, так как отвечать же он сам будет
	    //но пока оставлю, просто чтобы визуально ориентироваться
	   "stat" : function(client, object_info){
		send(client, 'stat', backends[object_info.backend].stat(object_info));
	    },
	    "href" : function(client, object_info){
		send(client, 'href', backends[object_info.backend].href(object_info));
	    },
	    "create" : function(client, object_info, data_tree){
		send(client, 'new_object', backends[object_info.backend].create(object_info, data_tree, pack_type);
	    },
	    "update" : function(client, object_info, update_tree){
		backends[object_info.backend].update(object_info, update_tree);
	    },
	    "extract" : function(client, object_info, pattern_tree){
		//продумать, как клиент будет получать извлекаемые данные
		send(client, 'readed_data', backends[object_info.backend].extract(object_info, pattern_tree);
	    },
	    "delete" : function(client, object_info){}

//пока оставляю закоментированным, но возможно клонирование не понадобится. В свете объединение data_object
// и cloud_object уровней в один, нужно пересмотреть как делаться будут ранее предполагаемые легко пораждаемые
// отслаиваемые копии деревьев
//	    "clone" : function(client, object_info){
//		//анализ поддержки бэкэндом клонирования, если нет, то просто идёт чтение и запись нового объекта
//		dsa.send(client, 'clone', cloned_object_info);
//	    }
	},
	"out" : {
	    "storage_info" : function(storage_info) {},
	    //фактически эти сообщения отправляются backend'ом, но есть ещё вопросы вложенного посыла
	    //сообщений сервисами и оформления сервисов и их работы в dsa, после решения которых может быть
	    //и не нужно будет дублировать
	    "stat" : function(stat){},
	    "new_object" : function(object_info){},
	    "href" : function(href){},
	    "readed_data" : function(data){},
//	    "clone" : function(object_info){} //object_info of new created object
 	}
    }*/
}

