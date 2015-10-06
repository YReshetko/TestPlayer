/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 01.03.15
 * Time: 12:19
 * To change this template use File | Settings | File Templates.
 */
/*////////////////////////////////////////////////////////////////////////////////////////////*/
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
/*|||||||||||||||||||||||||||||||||||||||||| UTILS |||||||||||||||||||||||||||||||||||||||||||*/
/*||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

InteractiveTask.formatColor = function(color, alpha){
    var fillColor = parseInt(color).toString(16);
    fillColor = InteractiveTask.getFullColor(fillColor);
    var red = parseInt(fillColor.substr(0,2), 16);
    var green = parseInt(fillColor.substr(2,2), 16);
    var blue = parseInt(fillColor.substr(4,2), 16);
    return "rgba("+red+","+green+","+blue+","+alpha+")";
};

InteractiveTask.formatColor16 = function(color){
    var fillColor = parseInt(color).toString(16);
    fillColor = InteractiveTask.getFullColor(fillColor);
    fillColor = "#"+fillColor;
    return fillColor;
};
InteractiveTask.formatColorFlashToCanvasRGBA = function(color, alpha){
    color = InteractiveTask.formatColorFlashToCanvas(color);
    var red = parseInt(color.substr(1,2), 16);
    var green = parseInt(color.substr(3,2), 16);
    var blue = parseInt(color.substr(5,2), 16);
    return "rgba("+red+","+green+","+blue+","+alpha+")";
};
InteractiveTask.formatColorFlashToCanvas = function(color){
    color = color.substring(color.indexOf("x")+1, color.length);
    color = InteractiveTask.getFullColor(color);
    return "#"+color;
};
InteractiveTask.getFullColor = function(color){
    while(color.length<6){
        color = "0"+color;
    };
    return color;
};
InteractiveTask.getRed = function(color){
    return InteractiveTask.getSpectr("red", color);
};
InteractiveTask.getGreen = function(color){
    return InteractiveTask.getSpectr("green", color);
};
InteractiveTask.getBlue = function(color){
    return InteractiveTask.getSpectr("blue", color);
};
InteractiveTask.getSpectr = function(name, color){
    var startIndex = color.indexOf("(",0)+1;
    var endIndex = color.indexOf(")",0);
    var str = color.substring(startIndex, endIndex);
    var colores = str.split(",");
    //console.log("colores: ", colores[0] , "    " , colores[1] , "      " , colores[2]);
    switch (name){
        case "red":
            return parseInt(colores[0]);
        case "green":
            return parseInt(colores[1]);
        case "blue":
            return parseInt(colores[2]);
        default: return 0;
    };
    return 0;
};

InteractiveTask.getArrayObjectsByTag = function(xml, tag){
    var outArray = new Array();
    if(xml[tag]!=undefined){
        if(xml[tag][0]!=undefined){
            //console.log(xml[tag])
            outArray = xml[tag];
        }else{
            outArray[0] = xml[tag];
        };
    };
    return outArray;
};

InteractiveTask.getCorrectText = function(text){
    var i,l;
    l = text.length;
    var str = "";
    for(i=0;i<l;i++){
        if(text.charCodeAt(i)==13){
            str = str + "\n";
        }else{
            str = str + text[i];
        };
    };
    return str;
};

InteractiveTask.getRandomIndexesTo = function(num){
    var outArray = new Array();
    var i,current;
    var flag = false;
    while(outArray.length<num){
        current = Math.round(Math.random()*(num-1));
        flag = true;
        for(i=0;i<outArray.length;i++){
            if(current == outArray[i]){
                flag = false;
                break;
            };
        };
        if(flag) outArray.push(current);
    };
	flag = true;
	for(i=0;i<outArray.length;i++){
		if(outArray[i]!=i){
			flag = false;
		};
	};
	if(flag){
		var rem = outArray[0];
		outArray[0] = outArray[outArray.length-1];
		outArray[outArray.length-1] = rem;
	};
    return outArray;
};


InteractiveTask.getIDLessons = function(xml){
	var tags = ["USERTAN", "CHECKBOX", "PICTURETAN", "SHIFTFIELD", "POINTDRAW"];
	var tasksXml =  InteractiveTask.getArrayObjectsByTag(xml, "TASK");
	var out = new Array();
	var samples;
	var i,l;
	var j,k;
	var index, length;
	var o,p;
	var flag;
	l = tasksXml.length;
	for(i=0;i<l;i++){
		k = tags.length;
		for(j=0;j<k;j++){
			samples = InteractiveTask.getArrayObjectsByTag(tasksXml[i].OBJECTS, tags[j]);
			length = samples.length;
			for(index=0;index<length;index++){
				if(samples[index].LESSONLINK){
					if(samples[index].LESSONLINK["-isComplate"])continue;
					p = out.length;
					flag = true;
					for(o=0;o<p;o++){
					   if(out[o].id == samples[index].LESSONLINK.lesson.id &&
						  out[o].name == samples[index].LESSONLINK.lesson.name ) flag = false;
					};
					if(flag){
					  out.push({
						  id : samples[index].LESSONLINK.lesson.id,
						  name : samples[index].LESSONLINK.lesson.name,
						  comment : samples[index].LESSONLINK.lesson.comment
					  });
					};
				};
			};
		};
	};
	return out;

};
/**
 * функция для установки вращения и перемещения танов (пользовательских и цветных)
 * @param self - объект тана который должен перемещаться
 * @param event - событие нажатия на тан для определения сенсорного события
 */
InteractiveTask.tansDragRotateInterface = function(self, event){
	if(self.startLabelMouseDown!=""){
		self.controller.runLabelAnimation(self.startLabelMouseDown);
		self.startLabelMouseDown = "";
	};
	if(event.evt.type == "touchstart"){
		if(self.touchStart) return;
		self.touchStart = true;
	};
	self.controller.select(self);
	InteractiveTask.setDragRotate(self, {
		isRotate : self.isRotation,
		isDrag : self.isDrag,
		layer : self.layer,
		callback : function(){
			self.touchStart = false;
			var r = Math.round(self.rotation()/22.5) * 22.5;
			if(r == 360) r = 0;
			self.rotation(r);
			self.controller.tanMouseUp(self);
		},
		rotate : function(degree){
			self.controller.rotate(degree);
		}
	});
};
/**
 *
 * @param target
 * @param options = {
 *    isRotate : boolean,           - Нужноли поворачивать объект
 *    isDrag : boolean,             - Нужно ли перемещать объект
 *    layer : Konva.Layer,          - Слой в котором находится объект до этой функции
 *    callback() : Function         - Функция, которую нужно вызвать после заверщения работы с объектом
 *    rotate(degree) : Function     - Функция выполняемая при элементарном повороте
 * }
 */
InteractiveTask.setDragRotate = function(target, options){
	if(!options.isRotate && !options.isDrag){
		options.callback();
		return;
	};
	var dragLayer = InteractiveTask.DRAGANDDROP_LAYER || options.layer || new Konva.Layer();
	var layer =  target.getLayer();
	var zIndex = target.getZIndex();



	var targetRect = target.getClientRect();
	var cacheOffset = Math.abs(targetRect.width/2 - targetRect.height/2);

	target.moveTo(dragLayer);

	layer.batchDraw();
	dragLayer.draw();
	target.cache({
		x : -targetRect.width/2,
		y : -targetRect.height/2,
		width : targetRect.width,
		height : targetRect.height,
		offset : cacheOffset,
		drawBorder : false
	});

	InteractiveTask.STAGE.on("mouseup touchend contentTouchend", function(){
		this.off("mousemove touchmove");
		this.off("mouseup touchend");
		target.dragBoundFunc(function(pos){return pos;});
		target.stopDrag();
		target.clearCache();
		target.moveTo(layer);
		target.setZIndex(zIndex);

		dragLayer.batchDraw();
		layer.batchDraw();
		options.callback();
	});


	if(!options.isRotate){
		InteractiveTask.dragFunction(target);
	}else if(!options.isDrag){
		InteractiveTask.rotateFunction(target, options.rotate, dragLayer);
	}else{
		InteractiveTask.rotateOrDragFunction(target, options.rotate, dragLayer);
	};
};
InteractiveTask.rotateFunction = function(target, callback, draglayer){
	var touchPos = InteractiveTask.STAGE.getPointerPosition();
	var mcXc = touchPos.x;
	var mcYc = touchPos.y;
	var mouseStartXFromCenter =   mcXc - target.getAbsolutePosition()["x"];
	var mouseStartYFromCenter =  mcYc - target.getAbsolutePosition()["y"];
	var mouseStartAngle = Math.atan2(mouseStartYFromCenter, mouseStartXFromCenter);

	InteractiveTask.STAGE.on("mousemove touchmove", function(e){
		var touchPos = InteractiveTask.STAGE.getPointerPosition();
		var mcX = touchPos.x;
		var mcY = touchPos.y;
		var mouseXFromCenter =  mcX - target.getAbsolutePosition()["x"];
		var mouseYFromCenter = mcY - target.getAbsolutePosition()["y"];
		var mouseAngle = Math.atan2(mouseYFromCenter, mouseXFromCenter);
		var rotateAngle = mouseAngle - mouseStartAngle;
		mouseStartAngle = mouseAngle;
		var degree = rotateAngle*(180/Math.PI);
		//console.log("Current rotation" + degree);
		callback(degree);
		draglayer.batchDraw();
	});
};
InteractiveTask.dragFunction = function(target){
	var boundRectangle = target.getClientRect();
	var width = boundRectangle.width;
	var height = boundRectangle.height;
	target.dragBoundFunc(function(pos){
		var X=pos.x;
		var Y=pos.y;
		var scaleX =InteractiveTask.STAGE.scaleX();
		var scaleY =InteractiveTask.STAGE.scaleY();

		if(X<width*scaleX/2){X=width*scaleX/2;};
		if(X>InteractiveTask.STAGE.width()-width*scaleX/2){X=InteractiveTask.STAGE.width()-width*scaleX/2;};
		if(Y<height*scaleY/2){Y=height*scaleY/2;};
		if(Y>InteractiveTask.STAGE.height()-height*scaleY/2){Y=InteractiveTask.STAGE.height()-height*scaleY/2;};
		return({x:X, y:Y});
	});
	target.startDrag();
};
InteractiveTask.rotateOrDragFunction = function(target, callback, dragLayer){
	var boundRectangle = target.dragBoundRectangle = target.dragBoundRectangle || target.getClientRect();
	//console.log(target);
	var scaleX = target.scale().x;
	var scaleY = target.scale().y;
	var r = (boundRectangle.width*InteractiveTask.STAGE.scaleX()*scaleX<boundRectangle.height*InteractiveTask.STAGE.scaleY()*scaleY)?((boundRectangle.width*InteractiveTask.STAGE.scaleX()*scaleX/2)*0.7):((boundRectangle.height*InteractiveTask.STAGE.scaleY()*scaleY/2)*0.7);
	var touchPos = InteractiveTask.STAGE.getPointerPosition();
	var mcXc = touchPos.x;
	var mcYc = touchPos.y;
	var mouseStartXFromCenter =   mcXc - target.getAbsolutePosition()["x"];
	var mouseStartYFromCenter =  mcYc - target.getAbsolutePosition()["y"];
	var mouseStartAngle = Math.atan2(mouseStartYFromCenter, mouseStartXFromCenter);
	if( mcXc>=parseInt(target.getAbsolutePosition()["x"]-r) &&
		mcXc<=parseInt(target.getAbsolutePosition()["x"]+r) &&
		mcYc>=parseInt(target.getAbsolutePosition()["y"]-r) &&
		mcYc<=parseInt(target.getAbsolutePosition()["y"]+r)){
			InteractiveTask.dragFunction(target);
	}else{
		InteractiveTask.rotateFunction(target, callback, dragLayer);
	};
};




/***********************************************
 * Добавление методов вращения и перемещения тана
 * @param self - непосредственно перемещаемый объект
 * @param event - объект события запустивший вращение
 */

InteractiveTask.extendsDragRotate = function(self, event){
	//console.log("Extends metod mouse down");
	//var self = this;
	if(self.startLabelMouseDown!=""){
		self.controller.runLabelAnimation(self.startLabelMouseDown);
		self.startLabelMouseDown = "";
	};
	if(event.evt.type == "touchstart"){
		if(self.touchStart) return;
		self.touchStart = true;
	};
	//self.moveToTop();
	self.moveTo(InteractiveTask.DRAG_LAYER);
	self.layer.batchDraw();
	InteractiveTask.DRAG_LAYER.batchDraw();
	InteractiveTask.STAGE.on("mouseup touchend", function(){
		this.off("mousemove touchmove");
		this.off("mouseup touchend");
		self.moveTo(self.layer);


		self.touchStart = false;
		var r = Math.round(self.rotation()/22.5) * 22.5;
		if(r == 360) r = 0;
		self.rotation(r);
		self.controller.tanMouseUp(self);

		InteractiveTask.DRAG_LAYER.batchDraw();
		self.layer.batchDraw();
		//self.layer.batchDraw();
		//this.batchDraw();

	});
	if(!self.isRotation) return;

	self.controller.select(self);
	var r = (self.width()*InteractiveTask.STAGE.scaleX()*self.scaleX()<self.height()*InteractiveTask.STAGE.scaleY()*self.scaleY())?((self.width()*InteractiveTask.STAGE.scaleX()*self.scaleX()/2)*0.7):((self.height()*InteractiveTask.STAGE.scaleY()*self.scaleY()/2)*0.7);
	console.log("r = " + r);
	console.log(self.getAbsolutePosition());
	var touchPos = InteractiveTask.STAGE.getPointerPosition();
	var mcXc = touchPos.x;
	var mcYc = touchPos.y;
	var mouseStartXFromCenter =   mcXc - self.getAbsolutePosition()["x"];
	var mouseStartYFromCenter =  mcYc - self.getAbsolutePosition()["y"];
	var mouseStartAngle = Math.atan2(mouseStartYFromCenter, mouseStartXFromCenter);
	if(mcXc>=parseInt(self.getAbsolutePosition()["x"]-r) && mcXc<=parseInt(self.getAbsolutePosition()["x"]+r) &&
		mcYc>=parseInt(self.getAbsolutePosition()["y"]-r) && mcYc<=parseInt(self.getAbsolutePosition()["y"]+r)){
		self.startDrag();
		//self.draggable(true);
		InteractiveTask.STAGE.on("mousemove touchmove", function(event){
			//self.layer.batchDraw();
			InteractiveTask.DRAG_LAYER.batchDraw();
			console.log("tan on drag");
		});
	} else {
		self.draggable(false);
		var state = true;
		InteractiveTask.STAGE.on("mousemove touchmove", function(e){
			var touchPos = InteractiveTask.STAGE.getPointerPosition();
			var mcX = touchPos.x;
			var mcY = touchPos.y;
			var mouseXFromCenter =  mcX - self.getAbsolutePosition()["x"];
			var mouseYFromCenter = mcY - self.getAbsolutePosition()["y"];
			var mouseAngle = Math.atan2(mouseYFromCenter, mouseXFromCenter);
			var rotateAngle = mouseAngle - mouseStartAngle;
			mouseStartAngle = mouseAngle;
			var degree = rotateAngle*(180/Math.PI);
			self.controller.rotate(degree);
			self.layer.batchDraw();


		});
	};

};

/**
 *
 * @param time - строковое представление времени всего пять символов
 *  Первые два - минуты
 *  Последние два - секунды
 *  В центре - разделитель
 */
InteractiveTask.getTimeByString = function(time){
	return parseInt(time.substr(0,2))*60 +  parseInt(time.substr(3,2));
};

InteractiveTask.disposeObject = function(object){
	for(var node in object){
	   object[node] = null;
	};
};