/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 22.02.15
 * Time: 13:12
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.AnimationController = function(){
    //alert("create controller animation");
    this.animations = new Array();
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
    //alert("add animation");
    options.controller = this;
    var id = this.animations.length;
    this.animations[id] = new InteractiveTask.AnimationObject(options);
    this.animations[id].parseXML();
    return this.animations[id];
};
InteractiveTask.AnimationController.prototype.totalPlaye = function(){
    //alert("total play");
    var i;
    var l = this.animations.length;
    for(i=0;i<l; i++){
        console.log("check label = |" + this.animations[i].label + "|");
        if(this.animations[i].label == undefined){
            console.log("label is free");
            this.animations[i].play();
        };
    };
};
InteractiveTask.AnimationController.prototype.playByLabel = function(label){
    var i;
    var l = this.animations.length;
    for(i=0;i<l; i++){
        if(this.animations[i].label != label) {continue;};
        if(this.animations[i].address == 0){
            this.animations[i].play();
        } else{
            --this.animations[i].address;
        };
    };
};

/************************************************************************************************************************/
InteractiveTask.AnimationObject = function(options){
    //alert("create Animation object");
    this.xml = options.xml;
    this.class = options.class;
    this.object = options.object;
    this.layer = options.layer;
    this.controller = options.controller;
};

InteractiveTask.AnimationObject.prototype.parseXML = function(){
    //alert("parseXml");
    this.step = parseFloat(this.xml["-step"]);
    this.startFrom = parseFloat(this.xml["-startTime"]);
    this.cicling = (this.xml["-cicling"] == "true");
    var isFirstPointSettings = (this.xml["-firstPoint"] == "true");
    this.isRemoveObject = (this.xml["-removeObject"] == "true");
    if(this.xml["-address"]!="") this.address = parseInt(this.xml["-address"]);
    this.multiple = (this.xml["-multiple"]=="true");
    this.animationStatic = (this.xml["-static"]=="true");
    this.label = this.xml["-label"];

    this.initPoints();

    if(isFirstPointSettings){
        this.object.animation_rotation(parseFloat(this.points[0]["-rotation"]));
        this.object.animation_alpha(parseFloat(this.points[0]["-alpha"]));
        this.object.animation_scaleX(parseFloat(this.points[0]["-scale"]));
        this.object.animation_scaleY(parseFloat(this.points[0]["-scale"]));
    };
};

InteractiveTask.AnimationObject.prototype.initPoints = function(){
    //alert("initPoints");
    this.points = new Array();
    if(this.xml.POINTS.KEYPOINT[0]==undefined){
        this.points[0] = this.xml.POINTS.KEYPOINT;
    }   else{
        this.points = this.xml.POINTS.KEYPOINT;
    };
    // Normalization of rotation
    var i,l;
    l = this.points.length;
    for(i=0;i<l;i++){
        if(parseFloat(this.points[i]["-rotation"])<0){
            this.points[i]["-rotation"] = (360 + parseFloat(this.points[i]["-rotation"])).toString();
        };
    };
};

//	Воспроизведение и остановка анимации
InteractiveTask.AnimationObject.prototype.play = function(){
    //alert("play");
    //	Чистим массив, просчитанный для плавной анимации
    //clearPointAnimation();
    if(this.animationStatic){
        //alert("anim static");
        this.points[0]["-rotation"] = this.object.rotation();
        //alert("start rotation = " + this.points[0]["-rotation"]);
    };
    var ID = 0;
    var deltaX, deltaY;
    var deltaR, deltaS, deltaA;
    var deltaRed, deltaGreen, deltaBlue;
    //	Число частей на которое делится отрезок анимации
    var sempleTime = Math.floor(24*this.step);
    var i,j,l;
    l = this.points.length;
    //	вычисляем начальные значения цвета
    var r,g,b;
    r = g = b = deltaRed = deltaGreen = deltaBlue = 0;
    //alert("start optional");
    if(this.object!=undefined){
	    this.object.moveToTop();
        var color =  InteractiveTask.formatColor(this.points[0]["-color"], 1);
        //alert("color = " + color);
        r = InteractiveTask.getRed(color);
        //alert("red = " + r);
        g = InteractiveTask.getGreen(color);
        //alert("green = " + g);
        b = InteractiveTask.getBlue(color);
        //alert("blue = " + b);

    };
    this.arrayAnimationPoints = new Array();
    //	Добавляем в массив первую точку анимации (там где стоит объект)
    //alert("this.points[0]['-x']="+this.points[0]["-X"])
    this.arrayAnimationPoints[0] = {
        x:parseFloat(this.points[0]["-X"]),
        y:parseFloat(this.points[0]["-Y"]),
        rotation:parseFloat(this.points[0]["-rotation"]),
        scale:parseFloat(this.points[0]["-scale"]),
        alpha:parseFloat(this.points[0]["-alpha"]),
        block:(this.points[0]["-block"]=="true"),
        red:r,
        green:g,
        blue:b
    };
    //alert("first point was created");
    //	Просчитываем позиции для каждого отрезка
    var currentRed, currentBlue, currentGreen;
    for(i=1;i<l;i++){
        //	Просчёт смещений по осям для текущего отрезка
        deltaX = (parseFloat(this.points[i]["-X"])-parseFloat(this.points[i-1]["-X"]))/sempleTime;
        deltaY = (parseFloat(this.points[i]["-Y"])-parseFloat(this.points[i-1]["-Y"]))/sempleTime;
        deltaR = (parseFloat(this.points[i]["-rotation"])-parseFloat(this.points[i-1]["-rotation"]))/sempleTime;
        deltaS = (parseFloat(this.points[i]["-scale"])-parseFloat(this.points[i-1]["-scale"]))/sempleTime;
        deltaA = (parseFloat(this.points[i]["-alpha"])-parseFloat(this.points[i-1]["-alpha"]))/sempleTime;
        //	Вычисляем смещение каждого спектра цвета
        if(this.object!=null){
            var newColor = InteractiveTask.formatColor(this.points[i]["-color"]);
            var oldColor = InteractiveTask.formatColor(this.points[i-1]["-color"]);
            deltaRed = Math.ceil((InteractiveTask.getRed(newColor) -  InteractiveTask.getRed(oldColor))/sempleTime);
            deltaGreen = Math.ceil((InteractiveTask.getGreen(newColor) -  InteractiveTask.getGreen(oldColor))/sempleTime);
            deltaBlue = Math.ceil((InteractiveTask.getBlue(newColor) -  InteractiveTask.getBlue(oldColor))/sempleTime);
        };
        console.log("delta: red ",deltaRed,"; green",deltaGreen," ; blue",deltaBlue);
        //	Запись в массив всех анимационных точек
        for(j=0;j<sempleTime;j++){
            ID = this.arrayAnimationPoints.length;
            currentRed = this.arrayAnimationPoints[ID-1].red + deltaRed;
            if(currentRed>255) currentRed = 255;
            if(currentRed<0) currentRed = 0;
            currentBlue = this.arrayAnimationPoints[ID-1].blue + deltaBlue;
            if(currentBlue>255) currentBlue = 255;
            if(currentBlue<0) currentBlue = 0;
            currentGreen=this.arrayAnimationPoints[ID-1].green + deltaGreen;
            if(currentGreen>255) currentGreen = 255;
            if(currentGreen<0) currentGreen = 0;
            this.arrayAnimationPoints[ID] = {
                x:this.arrayAnimationPoints[ID-1].x + deltaX,
                y:this.arrayAnimationPoints[ID-1].y + deltaY,
                rotation:this.arrayAnimationPoints[ID-1].rotation + deltaR,
                scale:this.arrayAnimationPoints[ID-1].scale + deltaS,
                alpha:this.arrayAnimationPoints[ID-1].alpha + deltaA,
                red:currentRed,
                green:currentGreen,
                blue:currentBlue
            };
            if(j==0) {
                this.arrayAnimationPoints[ID-1].timeOut = parseFloat(this.points[i-1]["-timeOut"]);
                this.arrayAnimationPoints[ID-1].block = (this.points[i-1]["-block"]=="true");
            } else {
                this.arrayAnimationPoints[ID-1].timeOut = 0;
                this.arrayAnimationPoints[ID-1].block = 'undefined';
            };
        };
    };
    this.arrayAnimationPoints[ID].timeOut = 0;
    //	Удаляем первую точку для более плавного перехода при зацикливании анимации
    this.arrayAnimationPoints.shift();
   // alert("this.arrayAnimationPoints[indexPoint].x = "+this.arrayAnimationPoints[0].x);
    this.runAnimation();
};
InteractiveTask.AnimationObject.prototype.runAnimation = function(){
    //	Выставляем текущий индекс в массиве точек анимации
    var indexPoint = -1;
    //	Создаем функцию анимации
   // alert("before create animation");
    //var out = document.getElementById("out");
    this.animation = new Kinetic.Animation(function(frame){
        try{
            //console.log("timeDiff = ",frame.timeDiff, "; frameRate = " + frame.frameRate, "; time = " + frame.time);
            //out.text = frame.timeDiff;
            //alert("play play play");
            //	Повышаем указатель текущей точки смещения
            ++indexPoint;
           // var timeOutTimer:Timer;
            //	Если достигли окончания массива точек промежуточной анимации
            //	то останавливаем её
            //alert("in animation")
            //alert("this.arrayAnimationPoints[indexPoint].x = "+this.arrayAnimationPoints[indexPoint].x);
            if(indexPoint>=this.arrayAnimationPoints.length){
                if(this.cicling){
                    indexPoint = 0;
                    this.object.animation_x(this.arrayAnimationPoints[indexPoint].x);
                    this.object.animation_y(this.arrayAnimationPoints[indexPoint].y);
                    this.object.animation_rotation(this.arrayAnimationPoints[indexPoint].rotation);
                    this.object.animation_scaleX(this.arrayAnimationPoints[indexPoint].scale);
                    this.object.animation_scaleY(this.arrayAnimationPoints[indexPoint].scale);
                    this.object.animation_alpha(this.arrayAnimationPoints[indexPoint].alpha);
                   /* if(this.arrayAnimationPoints[indexPoint].block!='undefined') {
                        this.object.draggable(this.arrayAnimationPoints[indexPoint].block);
                    } */
                    if(this.class.isPaint!=undefined){
                        if(this.class.isPaint){
                            this.object.animation_fill("rgba("+this.arrayAnimationPoints[indexPoint].red+","+this.arrayAnimationPoints[indexPoint].green+","+this.arrayAnimationPoints[indexPoint].blue+ ","+this.arrayAnimationPoints[indexPoint].alpha+")");

                        };
                    }  else{
                        this.object.animation_fill("rgba("+this.arrayAnimationPoints[indexPoint].red+","+this.arrayAnimationPoints[indexPoint].green+","+this.arrayAnimationPoints[indexPoint].blue+ ","+this.arrayAnimationPoints[indexPoint].alpha+")");
                    };
                    if(this.arrayAnimationPoints[indexPoint].timeOut!=0){
                        var time = 1000*this.arrayAnimationPoints[indexPoint].timeOut;
                        this.stop();
                        var replay = this;
                        setTimeout(function(){replay.start();}, time);
                    };
                }else{
                    //alert("stop animation");
                    this.stop();

                };
            }else{
                //	Иначе смещаем объект в новую точку
                this.object.animation_x(this.arrayAnimationPoints[indexPoint].x);
                this.object.animation_y(this.arrayAnimationPoints[indexPoint].y);
                this.object.animation_rotation(this.arrayAnimationPoints[indexPoint].rotation);
                this.object.animation_scaleX(this.arrayAnimationPoints[indexPoint].scale);
                this.object.animation_scaleY(this.arrayAnimationPoints[indexPoint].scale);
                this.object.animation_alpha(this.arrayAnimationPoints[indexPoint].alpha);
               /* if(this.arrayAnimationPoints[indexPoint].block!='undefined') {
                    this.object.draggable(this.arrayAnimationPoints[indexPoint].block);
                }   */
                if(this.class.isPaint!=undefined){
                    if(this.class.isPaint){
                        this.object.animation_fill("rgba("+this.arrayAnimationPoints[indexPoint].red+","+this.arrayAnimationPoints[indexPoint].green+","+this.arrayAnimationPoints[indexPoint].blue+ ","+this.arrayAnimationPoints[indexPoint].alpha+")");
                    };
                }  else{
                    this.object.animation_fill("rgba("+this.arrayAnimationPoints[indexPoint].red+","+this.arrayAnimationPoints[indexPoint].green+","+this.arrayAnimationPoints[indexPoint].blue+ ","+this.arrayAnimationPoints[indexPoint].alpha+")");
                };

                if(this.arrayAnimationPoints[indexPoint].timeOut!=0){
                    var time = 1000*this.arrayAnimationPoints[indexPoint].timeOut;
                    this.stop();
                    var replay = this;
                    setTimeout(function(){replay.start();}, time);
                };
            };
        }catch (error){
            console.log(error);
        };
    }, this.layer);
    this.animation.object = this.object;
    this.animation.class = this.class;
    this.animation.arrayAnimationPoints = this.arrayAnimationPoints;
    this.animation.cicling = this.cicling;
    //alert("before play animation 111");
    this.animation.start();
    //alert("after play");

};

InteractiveTask.AnimationObject.prototype.stop = function(){
    if(this.animation == null) return;
    this.animation.stop();
};

/*ВАРИАНТЫ РАБОТЫ АНИМАЦИИ В НОВОМ МОДУЛЕ*/
/*var l = animations.length;
 if(this.currentIndex<0 && l>0){
 this.currentIndex = 0
 };
 if(this.currentIndex<0) return;
 //console.log(this.currentIndex);
 //console.log(animations[this.currentIndex]);
 animations[this.currentIndex].gotoNextPoint();
 if(animations[this.currentIndex].isComplate()){
 if(animations[this.currentIndex].multiple){
 animations[this.currentIndex].isPointsPrepared = false;
 this.moveToBuffer(this.currentIndex);
 }else{
 animations.splice(this.currentIndex,1);
 };
 --this.currentIndex;
 --l;
 }else{
 if(animations[this.currentIndex].isStopOnFrame){
 animations[this.currentIndex].isStopOnFrame = false;
 this.moveToBuffer(this.currentIndex);
 --this.currentIndex;
 --l;
 };
 };
 if(this.currentIndex<l-1){
 this.currentIndex++;
 }else{
 if(l==0) {
 this.currentIndex = -1
 }else{
 this.currentIndex = 0;
 };
 }; */
/*this.logout = function(frame){
 //console.log("timeDiff = " + frame.timeDiff + ", lastTime = " + frame.lastTime + ", time = " + frame.time + ", frameRate = " + frame.frameRate);
 //console.log("Logout function: frameRate = " + frame.frameRate + ", part number = " + Math.ceil(frame.frameRate/InteractiveTask.CONST.ANIMATION_FRAME_RATE));
 console.log("Logout function: averageFrameRate = " + this.averageFrameRate);
 };
 this.execAverageFrameRate = function(){
 this.frameRateSum += frame.frameRate;
 ++this.numberFrames;
 this.averageFrameRate = this.frameRateSum/this.numberFrames;
 if(this.numberFrames == 100){
 this.frameRateSum = this.averageFrameRate;
 this.numberFrames = 1;
 };
 };
 this.moveToBuffer = function(i){
 buffer.push(animations[i]);
 animations.splice(i,1);
 };

 //this.logout(frame);
 //  Если текущая часть - первая, FPS ниже 40 и длина массива анимаций больше предполагаемого количества частей
 //  то увеличиваем разбивку массива анимаций вдвое
 if( this.currentIndex==1){
 this.execAverageFrameRate();
 if(this.averageFrameRate<29 && animations.length>=this.numberPart+1){
 this.numberPart += 1;
 console.log("---------------------- More number part "+this.numberPart+" ----------------------------------");
 }
 }
 var i,l;
 l = animations.length;
 //  Предполагаемая правая граница текущей части
 var part = this.currentIndex * Math.ceil(l/this.numberPart);
 //  Начальный индекс текущей части
 i = part - Math.ceil(l/this.numberPart);
 //  Длина текущей части
 var partLength = (l<part)?(l):(part);
 //  пробегаем по текущей части и передвигаем объекты на новые позиции
 for(i;
 i <  partLength;
 i++){
 animations[i].gotoNextPoint();
 //console.log(i);
 };
 //  Если есть разбивка анимаций на части, то...
 if(this.numberPart>1){
 //  переходим к следующей части
 ++this.currentIndex;
 //  Если её не существует, то возвращаемся к первой
 if(this.currentIndex>this.numberPart){
 this.currentIndex = 1;
 };
 };
 //  Если мы прошли цикл и находимся на первой части разбивки анимации,
 //  то проверяем закончились ли анимации и удаляем или возвращаем нужные в буфер
 if(this.currentIndex==1){
 var flag = false;
 for(i=0;i<l;i++){
 if(animations[i].isComplate()){
 if(animations[i].multiple){
 animations[i].isPointsPrepared = false;
 this.moveToBuffer(i);
 }else{
 animations.splice(i,1);
 };
 --i;
 --l;
 flag = true;
 }else{
 if(animations[i].isStopOnFrame){
 animations[i].isStopOnFrame = false;
 this.moveToBuffer(i);
 --i;
 --l;
 flag = true;
 };
 };
 };
 //  Если мы удалили хоть одну анимации, то сокращаем число частей
 if(flag && this.numberPart>1){
 while(this.numberPart!=1 && animations.length<this.numberPart){
 this.numberPart -= 1;
 console.log("---------------------- Less number part "+this.numberPart+" ----------------------------------");
 };
 };
 };
 //  Если массив буфера пуст и массив текущей анимации также пуст, то останавливаем поток анимации
 if(buffer.length == 0 && animations.length == 0){
 this.stop();
 //console.log("Animation full stop");
 };  */

//  Средний FPS
//this.kineticAnimation.averageFrameRate = 0;
//  Подсчет числа кадров
//this.kineticAnimation.numberFrames = 0;
//  Сумма FPS
//this.kineticAnimation.frameRateSum = 0;


//this.kineticAnimation.currentIndex = -1;
//this.kineticAnimation.numberPart = 1;