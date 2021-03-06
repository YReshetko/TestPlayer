/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 18.08.15
 * Time: 7:41
 * To change this template use File | Settings | File Templates.
 */
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
			|| window[vendors[x]+'CancelRequestAnimationFrame'];
	};
	if (!window.requestAnimationFrame){
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	};
	if (!window.cancelAnimationFrame){
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	};
}());
InteractiveTask.AnimationController = function(){
	//alert("create controller animation");
	//  Буфер анимаций (вначала они накапливаются здесь, затем поступают в массив playAnimation, если их нужно воспроизводить)
	this.bufferAnimation = new Array();
	//  Массив воспроизводимых анимаций в данный момент
	this.playAnimation = new Array();

	this.isRuning = false;

	this.timeout = null;
};

/**
 *
 * @param options {
 *      class - class object of animation
 *      object - object changes
 *      layer - object's layer
 *      xml - XML of animation
 * }
 */
InteractiveTask.AnimationController.prototype.add = function(options){
	var id = this.bufferAnimation.length;
	this.bufferAnimation.push(new InteractiveTask.AnimationObject(options));
	//InteractiveTask.log(this.bufferAnimation[id]);
	return this.bufferAnimation[id];
};
InteractiveTask.AnimationController.prototype.addSprite = function(options){
	var id = this.bufferAnimation.length;
	this.bufferAnimation.push(new InteractiveTask.AnimationSprite(options));
	//InteractiveTask.log(this.bufferAnimation[id]);
	return this.bufferAnimation[id];
};

//  Старт автоматических анимаций в начале задания
InteractiveTask.AnimationController.prototype.totalPlaye = function(){
	var i, l, n;
	l = this.bufferAnimation.length;
	var flag = false;
	for(i=0;i<l;i++){
		//  Если анимацию нужно стартовать автоматически
	  	if(this.bufferAnimation[i].isAutoPlay()){
		    flag = true;
		    //  Рассчитываем промежуточные точки
		    this.bufferAnimation[i].middlePointsAnimation();
		    //  Отправляем объект в слой анимации
		    this.bufferAnimation[i].moveToAnimationLayer();
		    //  Отправляем в массив анимаций проигрывания  и Вырезаем её из буфера
		    this.playAnimation.push(this.bufferAnimation[i]);
		    //InteractiveTask.log(this.playAnimation[this.playAnimation.length-1]);
		    this.bufferAnimation.splice(i,1);
		    //  поскольку мы вырезали анимацию из буфера, то понижаем и ндекс и длину массива буфера
		    --l;
		    --i;
	    };
	};
	if(flag){
		InteractiveTask.COMPONENTS_LAYER.batchDraw();
	};
	//this.animateLayers = layers;
	this._run();

};
InteractiveTask.AnimationController.prototype.moveToBuffer = function(i){
	this.bufferAnimation.push(this.playAnimation[i]);
	this.playAnimation.splice(i,1);
};
InteractiveTask.AnimationController.prototype.kinetikAnimation = function(){
//	InteractiveTask.log("animation play");
	var i,l;
	l = this.playAnimation.length;
	var flag = false;
	if(l>0){
		//  По всем анимациям проигрывания перемещаем объекты в новые точки
		for(i=0;i<l;i++){
			//InteractiveTask.log(animations[i]);
			this.playAnimation[i].gotoNextPoint();
			if(this.playAnimation[i].isComplate()){
				flag = true;
				this.playAnimation[i].moveToNativeLayer();
				if(this.playAnimation[i].tryRemoveObject()){
					InteractiveTask.disposeObject(this.playAnimation[i]);
					this.playAnimation[i] = null;
					this.playAnimation.splice(i,1);
				}else{
					if(this.playAnimation[i].multiple){
						this.playAnimation[i].isPointsPrepared = false;
						this.moveToBuffer(i);
						//InteractiveTask.log("push back to buffer");
					}else{
						InteractiveTask.disposeObject(this.playAnimation[i]);
						this.playAnimation[i] = null;
						this.playAnimation.splice(i,1);
					};
				};

				--i;
				--l;
			}else{
				if(this.playAnimation[i].isStopOnFrame){
					flag = true;
					this.playAnimation[i].moveToNativeLayer();
					this.playAnimation[i].isStopOnFrame = false;
					this.moveToBuffer(i);
					--i;
					--l;
				};
			};
		};
		if(flag){
			InteractiveTask.COMPONENTS_LAYER.batchDraw();
		};
		InteractiveTask.ANIMATION_LAYER.batchDraw();

	};
	//  Если массив буфера пуст и массив текущей анимации также пуст, то останавливаем поток анимации
	var self = this;
	var func = function(){self.kinetikAnimation()};
	if(this.playAnimation.length != 0){
		//this.timeout = setTimeout(function(){self.kinetikAnimation()}, Math.floor(1000/InteractiveTask.CONST.ANIMATION_FRAME_RATE));
		//this.timeout = setTimeout(function(){requestAnimationFrame(func, self);}, Math.floor(1000/InteractiveTask.CONST.ANIMATION_FRAME_RATE));
		requestAnimationFrame(func, self);
	}else{
		this.isRuning = false;
	};
};
InteractiveTask.AnimationController.prototype.playByLabel = function(label){
	//InteractiveTask.log("run by label = |" + label + "|");
	var i, l, j,n;
	l = this.bufferAnimation.length;
	//InteractiveTask.log("bufferAnimation.length = |" + this.bufferAnimation.length + "|");
	var flag = false;
	for(i=0;i<l;i++){
		if(this.bufferAnimation[i].label != label) {continue;};
		InteractiveTask.log("[Player Animation] - find label");
		if(this.bufferAnimation[i].canGetObject()){
			flag = true;
			InteractiveTask.log("[Player Animation] - prepare points");
			//  Рассчитываем промежуточные точки
			this.bufferAnimation[i].middlePointsAnimation();
			//InteractiveTask.log("add layer");
			//  Запоминаем слои анимаций
			//this.KonvaAnimation.addLayer(this.bufferAnimation[i].layer);
			//  Отправляем объект в слой анимации
			this.bufferAnimation[i].moveToAnimationLayer();
			//  Отправляем в массив анимаций проигрывания  и Вырезаем её из буфера
			//InteractiveTask.log("to animation array");
			this.playAnimation.push(this.bufferAnimation[i]);
			this.bufferAnimation.splice(i,1);
			//  поскольку мы вырезали анимацию из буфера, то понижаем и ндекс и длину массива буфера
			--l;
			--i;
		};
	};
	if(flag){
		InteractiveTask.COMPONENTS_LAYER.batchDraw();
	};
	this._run();
};
InteractiveTask.AnimationController.prototype._run = function(){
	if(this.playAnimation.length>0 && !this.isRuning){
		this.isRuning = true;
		InteractiveTask.ANIMATION_LAYER.batchDraw();
		this.kinetikAnimation();
	};
};
InteractiveTask.AnimationController.prototype.clear = function(){
	clearTimeout(this.timeout);
	while(this.playAnimation.length>0){
	  	InteractiveTask.disposeObject(this.playAnimation[0]);
		this.playAnimation[0] = null;
		this.playAnimation.shift();
	};
	while(this.bufferAnimation.length>0){
		InteractiveTask.disposeObject(this.bufferAnimation[0]);
		this.bufferAnimation[0] = null;
		this.bufferAnimation.shift();
	};

};

/************************************************************************************************************************/
/************Объект содержащий промежуточные состояния анимируемого объекта и методы изменения объекта*******************/
/************************************************************************************************************************/
InteractiveTask.AnimationObject = function(options){
	//alert("create Animation object");
	this.xml = options.xml;
	this.class = options.class;
	this.object = options.object;
	this.layer;

	this.isPointsPrepared = false;
	this.isStopOnFrame = false;

	this.zIndex = 0;

	this.parseXML();
};

InteractiveTask.AnimationObject.prototype.parseXML = function(){
	//alert("parseXml");
	//  Запоминаем шаг анимации
	this.step = parseFloat(this.xml["-step"]);
	//  Запоминаем время через которое необходимо стартовать анимацию
	this.startFrom = parseFloat(this.xml["-startTime"]);
	//  Зацикливать или нет анимацию
	this.cicling = (this.xml["-cicling"] == "true");
	//  Устанавливать настройки первой точки или нет
	var isFirstPointSettings = (this.xml["-firstPoint"] == "true");
	//  Удалять ли объект по завершении анимации
	this.isRemoveObject = (this.xml["-removeObject"] == "true");
	//  Устанавливаем число запросов до запуска анимации
	if(this.xml["-address"]!="") this.address = parseInt(this.xml["-address"]);
	//  Определяем необходим ли множественный запуск анимации
	this.multiple = (this.xml["-multiple"]=="true");
	//  Определяем будет ли анимация статической, т.е. движение ко второй точке с текущей позиции или возврат на первую точку
	this.animationStatic = (this.xml["-static"]=="true");
	//  метка для запуска анимации
	this.label = this.xml["-label"];

	// Создаем массив ключевых точек
	this.keyPoints = new Array();
	if(this.xml.POINTS.KEYPOINT[0]==undefined){
		this.keyPoints[0] = this.xml.POINTS.KEYPOINT;
	}   else{
		this.keyPoints = this.xml.POINTS.KEYPOINT;
	};
	// Если в массиве ключевых точек существуют отрицательные повороты, то делаем их положительными
	var i,l;
	l = this.keyPoints.length;
	for(i=0;i<l;i++){
		if(parseFloat(this.keyPoints[i]["-rotation"])<0){
			this.keyPoints[i]["-rotation"] = (360 + parseFloat(this.keyPoints[i]["-rotation"])).toString();
		};
	};
	//  Настраиваем объект по первой точке, если это необходимо
	if(isFirstPointSettings){
		this.object.animation_rotation(parseFloat(this.keyPoints[0]["-rotation"]));
		this.object.animation_alpha(parseFloat(this.keyPoints[0]["-alpha"]));
		this.object.animation_scaleX(parseFloat(this.keyPoints[0]["-scale"]));
		this.object.animation_scaleY(parseFloat(this.keyPoints[0]["-scale"]));
		//this.layer.batchDraw();
	};
};

//  Метод просчета всех промежуточных точек анимации с таймаутами
InteractiveTask.AnimationObject.prototype.middlePointsAnimation = function(){
	if(this.isPointsPrepared) return;
	this.isPointsPrepared = true;
	//  Если анимация начинается с текущей точки, то настраиваем новые поворот и позицию
	if(this.animationStatic){
		//alert("anim static");
		this.keyPoints[0]["-rotation"] = this.object.rotation();
		this.keyPoints[0]["-X"] = this.object.x() - this.object.startX;
		this.keyPoints[0]["-Y"] = this.object.y() - this.object.startY;
		//alert("start rotation = " + this.points[0]["-rotation"]);
	};

	var ID = 0;
	//  дельта перемещение объекта
	var deltaX, deltaY;
	//  Дельты поворота, масштабирования и прозрачности соответственно
	var deltaR, deltaS, deltaA;
	//  Дельта цвета по спектрам
	var deltaRed, deltaGreen, deltaBlue;
	//	Число частей на которое делится отрезок анимации
	var sempleTime = Math.floor(InteractiveTask.CONST.ANIMATION_FRAME_RATE*this.step);

	var i,j,l;
	l = this.keyPoints.length;
	//	вычисляем начальные значения цвета
	var r,g,b;
	r = g = b = deltaRed = deltaGreen = deltaBlue = 0;
	//alert("start optional");
	if(this.object!=undefined){
		this.object.moveToTop();
		var color =  InteractiveTask.formatColor(this.keyPoints[0]["-color"], 1);
		//alert("color = " + color);
		r = InteractiveTask.getRed(color);
		//alert("red = " + r);
		g = InteractiveTask.getGreen(color);
		//alert("green = " + g);
		b = InteractiveTask.getBlue(color);
		//alert("blue = " + b);
	};
	//  Создаем массив промежуточных точек анимации
	this.arrayAnimationPoints = new Array();
	//  Если нужно запустить анимацию через некоторое время, то ставим в массив промежуточных точек подходящее количество
	//  Иначе записываем только одну первую точку
	if(this.startFrom!=undefined){
		if(this.startFrom!=0){
			var numFirstPoints =  Math.floor(InteractiveTask.CONST.ANIMATION_FRAME_RATE*this.startFrom);
			for(i=0;i<numFirstPoints;i++){
				this._addKeyPoint(0, r, g, b);
			};
		}else{
			this._addKeyPoint(0, r, g, b);
		};
	}else{
		this._addKeyPoint(0, r, g, b);
	};

	//	Просчитываем позиции для каждого отрезка
	var currentRed, currentBlue, currentGreen;
	if(this.step!=0){
		for(i=1;i<l;i++){
			//	Просчёт смещений по осям для текущего отрезка
			deltaX = (parseFloat(this.keyPoints[i]["-X"])-parseFloat(this.keyPoints[i-1]["-X"]))/sempleTime;
			deltaY = (parseFloat(this.keyPoints[i]["-Y"])-parseFloat(this.keyPoints[i-1]["-Y"]))/sempleTime;
			deltaR = (parseFloat(this.keyPoints[i]["-rotation"])-parseFloat(this.keyPoints[i-1]["-rotation"]))/sempleTime;
			deltaS = (parseFloat(this.keyPoints[i]["-scale"])-parseFloat(this.keyPoints[i-1]["-scale"]))/sempleTime;
			deltaA = (parseFloat(this.keyPoints[i]["-alpha"])-parseFloat(this.keyPoints[i-1]["-alpha"]))/sempleTime;
			//	Вычисляем смещение каждого спектра цвета
			if(this.object!=null){
				var newColor = InteractiveTask.formatColor(this.keyPoints[i]["-color"]);
				var oldColor = InteractiveTask.formatColor(this.keyPoints[i-1]["-color"]);
				deltaRed = Math.ceil((InteractiveTask.getRed(newColor) -  InteractiveTask.getRed(oldColor))/sempleTime);
				deltaGreen = Math.ceil((InteractiveTask.getGreen(newColor) -  InteractiveTask.getGreen(oldColor))/sempleTime);
				deltaBlue = Math.ceil((InteractiveTask.getBlue(newColor) -  InteractiveTask.getBlue(oldColor))/sempleTime);
			};
			//InteractiveTask.log("delta: red ",deltaRed,"; green",deltaGreen," ; blue",deltaBlue);
			//	Запись в массив всех анимационных точек
			for(j=0;j<sempleTime;j++){
				//  Определяем индекс новой точки
				ID = this.arrayAnimationPoints.length;
				//  Вычисляем цвет объекта в текущей точке
				currentRed = this.arrayAnimationPoints[ID-1].red + deltaRed;
				if(currentRed>255) currentRed = 255;
				if(currentRed<0) currentRed = 0;
				currentBlue = this.arrayAnimationPoints[ID-1].blue + deltaBlue;
				if(currentBlue>255) currentBlue = 255;
				if(currentBlue<0) currentBlue = 0;
				currentGreen=this.arrayAnimationPoints[ID-1].green + deltaGreen;
				if(currentGreen>255) currentGreen = 255;
				if(currentGreen<0) currentGreen = 0;
				//  Записываем новую промежуточную точку
				this.arrayAnimationPoints.push({
					x:this.arrayAnimationPoints[ID-1].x + deltaX,
					y:this.arrayAnimationPoints[ID-1].y + deltaY,
					rotation:this.arrayAnimationPoints[ID-1].rotation + deltaR,
					scale:this.arrayAnimationPoints[ID-1].scale + deltaS,
					alpha:this.arrayAnimationPoints[ID-1].alpha + deltaA,
					red:currentRed,
					green:currentGreen,
					blue:currentBlue
				});
			};
			if(this.keyPoints[i]["-label"]!=undefined){
				ID = this.arrayAnimationPoints.length-1;
				if(this.keyPoints[i]["-label"]!=""){
					this.arrayAnimationPoints[ID].label = this.keyPoints[i]["-label"];
				};
				if(this.keyPoints[i]["-access"]!=undefined){
					if(parseInt(this.keyPoints[i]["-access"])>0){
						this.arrayAnimationPoints[ID].address = parseInt(this.keyPoints[i]["-access"]);
					}else{
						this.arrayAnimationPoints[ID].address = 0;
					};
				};
			};
			//  Если на следующей точке анимации нужен таймаут, то записываем столько промежуточных точек равных следующей, сколько необходимо
			if(this.keyPoints[i]["-timeOut"]!=undefined){
				if(parseFloat(this.keyPoints[i]["-timeOut"])>0){
					var numTimeOutPoints =  Math.floor(InteractiveTask.CONST.ANIMATION_FRAME_RATE*parseFloat(this.keyPoints[i]["-timeOut"]));
					for(j=0;j<numFirstPoints;j++){
						this._addKeyPoint(i, currentRed, currentGreen, currentBlue);
					};
				};
			};
		};
	} else{
		for(i=1;i<l;i++){
			var newColor = InteractiveTask.formatColor(this.keyPoints[i]["-color"]);
			this._addKeyPoint(i, InteractiveTask.getRed(newColor), InteractiveTask.getGreen(newColor), InteractiveTask.getBlue(newColor));
			ID = this.arrayAnimationPoints.length-1;
			if(this.keyPoints[i]["-label"]!=undefined){
				if(this.keyPoints[i]["-label"]!=""){
					this.arrayAnimationPoints[ID].label = this.keyPoints[i]["-label"];
				};
				if(this.keyPoints[i]["-access"]!=undefined){
					if(parseInt(this.keyPoints[i]["-access"])>0){
						this.arrayAnimationPoints[ID].address = parseInt(this.keyPoints[i]["-access"]);
					}else{
						this.arrayAnimationPoints[ID].address = 0;
					};
				};
			};
		};
	};
	//	Удаляем первую точку для более плавного перехода при зацикливании анимации
	this.arrayAnimationPoints.shift();
};

//  Функция перехода к следующей промежуточной точке анимации
InteractiveTask.AnimationObject.prototype.gotoNextPoint = function(){
	//  Первую точку из массива промежуточных точек, запоминаем её и удаляем из массива
	var currentPoint = this.arrayAnimationPoints.shift();
	//  Переносим, поворачиваем, масштабируем и изменяем прозрачность объекта
	this.object.animation_x(currentPoint.x);
	this.object.animation_y(currentPoint.y);
	this.object.animation_rotation(currentPoint.rotation);
	this.object.animation_scaleX(currentPoint.scale);
	this.object.animation_scaleY(currentPoint.scale);
	this.object.animation_alpha(currentPoint.alpha);
	//  Изменяем цвет объекта
	if(this.class.isPaint!=undefined){
		if(this.class.isPaint){
			this.object.animation_fill("rgba("+currentPoint.red+","+currentPoint.green+","+currentPoint.blue+ ","+currentPoint.alpha+")");
		};
	}  else{
		this.object.animation_fill("rgba("+currentPoint.red+","+currentPoint.green+","+currentPoint.blue+ ","+currentPoint.alpha+")");
	};
	//  Если анимация зациклина, то ставим первую точку промежуточной анимации в конец массива, иначе она остается удаленной
	if(this.cicling){
		this.arrayAnimationPoints.push(currentPoint);
	};
	if(currentPoint.label!=undefined){
		if(currentPoint.label!=""){
			this.isStopOnFrame = true;
			this.label = currentPoint.label;
			this.address = currentPoint.address;
		};
	};
};

//  Проверка на завершение анимации (в случае если массив промежуточных точек пустой)
InteractiveTask.AnimationObject.prototype.isComplate = function(){
	return this.arrayAnimationPoints.length==0;
};
//  Проверка, можно ли запустить анимацию (исчерпан ли лимит запросов к ней)
InteractiveTask.AnimationObject.prototype.canGetObject = function(){
	if(this.address==0) return true;
	--this.address;
	return false;
};
//  Проверка автоматически ли запускается анимация
InteractiveTask.AnimationObject.prototype.isAutoPlay = function(){
   return this.label==undefined;
};



//  Запись ключевых точек в массив промежуточных анимаций
InteractiveTask.AnimationObject.prototype._addKeyPoint = function(index, r, g, b){
	this.arrayAnimationPoints.push({
		x:parseFloat(this.keyPoints[index]["-X"]),
		y:parseFloat(this.keyPoints[index]["-Y"]),
		rotation:parseFloat(this.keyPoints[index]["-rotation"]),
		scale:parseFloat(this.keyPoints[index]["-scale"]),
		alpha:parseFloat(this.keyPoints[index]["-alpha"]),
		block:(this.keyPoints[index]["-block"]=="true"),
		red:r,
		green:g,
		blue:b
	});
};

InteractiveTask.AnimationObject.prototype.moveToAnimationLayer = function(){
	this.zIndex = (this.object.remZIndex)?this.object.remZIndex:this.object.getZIndex();
	this.layer = this.object.getLayer();
	this.object.moveTo(InteractiveTask.ANIMATION_LAYER);
};

InteractiveTask.AnimationObject.prototype.moveToNativeLayer = function(){
	this.object.moveTo(this.layer);
	if(InteractiveTask.CONST.IS_SET_BACK){
		this.object.setZIndex(this.zIndex);
	};
};
InteractiveTask.AnimationObject.prototype.tryRemoveObject = function(){
	if(this.isRemoveObject){
		this.object.remove();
		return true;
	};
	return false;
};

/************************************************************************************************************************/
/************ Объект содержащий промежуточные состояния сложной анимации из картинок ************************************/
/************************************************************************************************************************/
/**
 * @param options сложный объект:
 *      - xml - конфиг анимации
 *      - class - родительский класс анимируемого объекта  ???? - наверное не нужен
 *      - object - анимируемый оюъект (Konva.Sprite)
 * @constructor
 */
InteractiveTask.AnimationSprite = function(options){
	//alert("create Animation object");
	this.xml = options.xml;
	this.class = options.class;
	this.object = options.object;
	this.layer;


	this.isPointsPrepared = false;
	this.isStopOnFrame = false;

	this.zIndex = 0;

	this.parseXML();
};

InteractiveTask.AnimationSprite.prototype.parseXML = function(){
	InteractiveTask.log("[Player Animation] - xml -", this.xml);
	//  Запоминаем время через которое необходимо стартовать анимацию
	this.startFrom = parseFloat(this.xml["-startTime"]);
	//  Зацикливать или нет анимацию
	this.cicling = (this.xml["-cicling"] == "true");
	//  Удалять ли объект по завершении анимации
	this.isRemoveObject = (this.xml["-removeObject"] == "true");
	//  Устанавливаем число запросов до запуска анимации
	if(this.xml["-address"]!="") this.address = parseInt(this.xml["-address"]);
	//  Определяем необходим ли множественный запуск анимации
	this.multiple = (this.xml["-multiple"]=="true");
	//  метка для запуска анимации
	this.label = this.xml["-label"];
	//  Имя текущей анимации  animation : 'standing'
	this.animationName = this.xml["-name"];
	InteractiveTask.log("[Player Animation] - this.address -", this.address);

};
InteractiveTask.AnimationSprite.prototype.middlePointsAnimation = function(){
	var animObjectArrays = this.object.animations();
	this.animationsArray = new Object();
	for(var node in animObjectArrays){
		this.animationsArray[node] = new Object();
		this.animationsArray[node]["name"] = node;
		this.animationsArray[node]["points"] = animObjectArrays[node];
		this.animationsArray[node]["numPoints"] = animObjectArrays[node].length/4;
		this.animationsArray[node]["currentPoint"] = 0;
	};
};
InteractiveTask.AnimationSprite.prototype.gotoNextPoint = function(){
	++this.animationsArray[this.animationName]["currentPoint"];
	var currentPoint = this.animationsArray[this.animationName]["currentPoint"];
	if(currentPoint==this.animationsArray[this.animationName]["numPoints"]){
		if(this.cicling){
			currentPoint = this.animationsArray[this.animationName]["currentPoint"] = 0;
		}else{
			if(this.class.complateAnimation){
				this.class.complateAnimation();
			};
			return;
		};
	};
	this.object.frameIndex(currentPoint);
};
InteractiveTask.AnimationSprite.prototype.isComplate = function(){
	return this.animationsArray[this.animationName]["currentPoint"] == this.animationsArray[this.animationName]["numPoints"];
};
InteractiveTask.AnimationSprite.prototype.canGetObject = function(){
	if(this.address==0) return true;
	--this.address;
	return false;
};
InteractiveTask.AnimationSprite.prototype.isAutoPlay = function(){
	return this.label==undefined;
};
InteractiveTask.AnimationSprite.prototype.moveToAnimationLayer = function(){
	this.zIndex = (this.object.remZIndex)?this.object.remZIndex:this.object.getZIndex();
	this.layer = this.object.getLayer();
	this.object.moveTo(InteractiveTask.ANIMATION_LAYER);
};

InteractiveTask.AnimationSprite.prototype.moveToNativeLayer = function(){
	this.object.moveTo(this.layer);
	if(InteractiveTask.CONST.IS_SET_BACK){
		this.object.setZIndex(this.zIndex);
	};
};
InteractiveTask.AnimationSprite.prototype.tryRemoveObject = function(){
	if(this.isRemoveObject){
		this.object.remove();
		return true;
	};
	return false;
};
