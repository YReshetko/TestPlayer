/** Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 27.02.15
 * Time: 10:39
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.PictureTanController = function(options){
    //alert(task);
    this.task = options.task;
    this.diap = options.diap;
    this.isUniq = options.uniq;

    this.basePath = options.basePath;

    this.balance = 0;
    //alert(this.task);
    this.tanArray = new Array();
    //this.taskController = options.task;
};
InteractiveTask.PictureTanController.prototype.add = function(xml){
    ++this.balance;
    var id = this.tanArray.length;
    this.tanArray[id] = new InteractiveTask.SamplePictureTan(xml);
    this.tanArray[id].init({
        path : this.basePath,
        controller: this
    });

};
InteractiveTask.PictureTanController.prototype.area = function(area){
    var i,l;
    l = this.tanArray.length;
    for(i=0;i<l;i++){
        this.tanArray[i].area(area);
    };
};
InteractiveTask.PictureTanController.prototype.getAnimation = function(options){
    return this.task.getAnimation(options);
};
InteractiveTask.PictureTanController.prototype.runLabelAnimation = function(label){
    this.task.runLabelAnimation(label);
};
/*InteractiveTask.PictureTanController.prototype.complateLoadingTask = function(){
    this.task.complateLoadingTask();
} */
/*************************************************************/
/**************************CONTROL TANS***********************/
InteractiveTask.PictureTanController.prototype.select = function (tan){
    //alert("Select tan");
    this.task.deSelect();
    tan.isSelect = true;
    //alert("Select tan");
};
InteractiveTask.PictureTanController.prototype.deSelect = function(){
    var length = this.tanArray.length;
    for(i=0;i<length;i++){
        this.tanArray[i].colorTan.isSelect = false;
    };
};
InteractiveTask.PictureTanController.prototype.rotate = function(degree){
    var length = this.tanArray.length;
    for(i=0;i<length;i++){
        if(this.tanArray[i].colorTan.isSelect){
            this.tanArray[i].rotate(degree);
        };
    };
};

InteractiveTask.PictureTanController.prototype.tanMouseUp = function(tan){
    var i;
    var length = this.tanArray.length;
    var remTanObject;
    for(i=0;i<length;i++){
        if(this.tanArray[i].colorTan == tan){
            remTanObject = this.tanArray[i];
            break;
        };
    };
    if(!this.isUniq){
        remTanObject.simplePosition(this.diap);
    }else{
        var settings = remTanObject.getSettings();
        settings.diap = this.diap;
        var flag = false;
        for(i=0;i<length && !flag;i++){
            flag = this.tanArray[i].checkOtherTan(settings);
            if(flag){
                remTanObject.setPosition(this.tanArray[i].getPosition());
                this.tanArray[i].blackTan.isFree = false;
                //break;
            };
        };
        if(!flag){
            remTanObject.backPosition();
	        this.task.minusHealth();
        };
    };
    this.task.checkTask();
};

InteractiveTask.PictureTanController.prototype.isComplate = function(){
    var i = 0;
    var length = this.tanArray.length;
    for(i=0;i<length;i++){
        //alert(this.tanArray[i].isComplate());
	    this.tanArray[i].setReport(false);
        if(this.tanArray[i].isEnterArea()){
            if(!this.tanArray[i].isEnter()) return false;
        }   else{
            if(!this.tanArray[i].isComplate()) return false;
        };
	    this.tanArray[i].setReport(true);
    };
    return true;
};

InteractiveTask.PictureTanController.prototype.hasMarks = function(){
	return this.task.hasMarks();
};
InteractiveTask.PictureTanController.prototype.minusHealth = function(){
	this.task.minusHealth();
};

InteractiveTask.PictureTanController.prototype.clear = function(){
	while(this.tanArray.length>0){
		InteractiveTask.disposeObject(this.tanArray[0]);
		this.tanArray[0] = null;
		this.tanArray.shift();
	};
};
InteractiveTask.PictureTanController.prototype.balckAddToLayer = function(layer){
	var length = this.tanArray.length;
	var i;
	for(i=0;i<length;i++){
		if(!this.tanArray[i].isDeletateBlack){
			layer.add(this.tanArray[i].blackTan);
			this.tanArray[i].blackTan.remZIndex = this.tanArray[i].blackTan.getZIndex();
			//layer.batchDraw();
			this.tanArray[i].blackTan.blackImageTan.cache();
			this.tanArray[i].blackTan.blackImageTan.filters([Konva.Filters.RGB]);
		}
	};
	/*if(this.blackLayer!=null){
		this.blackLayer.add(this.blackTan);
		this.blackTan.draw();
		 blackImageTan.cache();
		 blackImageTan.filters([Konva.Filters.RGB]);
	};*/
};
InteractiveTask.PictureTanController.prototype.colorAddToLayer = function(layer){
	var length = this.tanArray.length;
	var i;
	for(i=0;i<length;i++){
		layer.add(this.tanArray[i].colorTan);
		this.tanArray[i].colorTan.remZIndex = this.tanArray[i].colorTan.getZIndex();
	};
};

/************************************************************************************************************************************/
InteractiveTask.SamplePictureTan = function(xml){
    this.xml = xml;
	this.setReport(false);
};
InteractiveTask.SamplePictureTan.prototype.setReport = function(isComplate){
	if(this.xml.BLACK.DELETE == "1") isComplate = true;
	if(this.xml.LESSONLINK != undefined){
		this.xml.LESSONLINK["-isComplate"] = isComplate;
	};
};
InteractiveTask.SamplePictureTan.prototype.init = function(options){
    //this.path = options.path+this.xml.IMAGE;
    this.controller = options.controller;
    this.enterArea = false;
    var width = parseFloat(this.xml.WIDTH);
    var height = parseFloat(this.xml.HEIGHT);
    var x = parseFloat(this.xml.COLOR.X);
    var y = parseFloat(this.xml.COLOR.Y);

    this.colorTan = new Konva.Group();
	this.colorTan.setAttrs({
		width : width,
		height : height
	});
    var colorImageTan = new Konva.Image({
        x : -width/2,
        y : -height/2,
        image : InteractiveTask.LIBRARY.getImage(this.xml.IMAGE)/*,
        width : width,
        height : height   */
    });


    //InteractiveTask.log("paint tan colorImageTan.width = ", colorImageTan.width(), "; paint tan colorImageTan.height = ", colorImageTan.height())
    this.scaleX = width/colorImageTan.width();
    this.scaleY = height/colorImageTan.height();
   // InteractiveTask.log("paint tan scaleX = ", this.scaleX, "; paint tan scaleY = ", this.scaleY);
    colorImageTan.width(width);
    colorImageTan.height(height);
    this.colorTan.colorImageTan = colorImageTan;
   // this.colorTan.draggable(true);
	/*
	this.colorTan.dragBoundFunc(function(pos){
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
      */
    this.colorTan.add(colorImageTan);
    this.colorTan.x(x);
    this.colorTan.y(y);

   // InteractiveTask.log("Color tan was added");
    this.blackTan = new Konva.Group();

    var blackImageTan = new Konva.Image({
        x : -width/2,
        y : -height/2,
        image :  InteractiveTask.LIBRARY.getImage(this.xml.IMAGE),
        width : width,
        height : height
    });
    this.blackTan.blackImageTan = blackImageTan;
    this.blackTan.add(blackImageTan);
    this.blackTan.x(parseFloat(this.xml.BLACK.X));
    this.blackTan.y(parseFloat(this.xml.BLACK.Y));


    if(this.xml.BLACK.ALPHA == "1"){
        this.blackTan.visible(false);

    };

    this.colorTan.rotation(360 - parseInt(this.xml.COLOR.R)*(22.5));
    this.blackTan.rotation(360 - parseInt(this.xml.BLACK.R)*(22.5));
    if(this.colorTan.rotation() == 360)  this.colorTan.rotation(0);
    if(this.blackTan.rotation() == 360)  this.blackTan.rotation(0);

    if(this.xml.STARTANIMATIONCOMPLATE != undefined){
        //this.startLabelComplate = this.xml.STARTANIMATIONCOMPLATE;
	    /*
	    меняем на создание массива меток анимации
	     */
	    this.startLabelComplate = new Array();
	    if(this.xml.STARTANIMATIONCOMPLATE.indexOf(",")!=-1){
		    var lblArr = this.xml.STARTANIMATIONCOMPLATE.split(",");
		    var i,l;
		    l = lblArr.length;
		    for(i=0;i<l;i++){
			    this.startLabelComplate[i] = lblArr[i];
		    };
	    }else{
		    this.startLabelComplate[0] = this.xml.STARTANIMATIONCOMPLATE;
	    };

    } else{
        this.startLabelComplate = "";
    };
    if(this.xml.STARTANIMATIONDOWN != undefined){
        //this.startLabelMouseDown = this.xml.STARTANIMATIONDOWN;
	    /*
	     меняем на создание массива меток анимации
	     */
	    this.startLabelMouseDown = new Array();
	    if(this.xml.STARTANIMATIONDOWN.indexOf(",")!=-1){
		    var lblArr = this.xml.STARTANIMATIONDOWN.split(",");
		    var i,l;
		    l = lblArr.length;
		    for(i=0;i<l;i++){
			    this.startLabelMouseDown[i] = lblArr[i];
		    };
	    }else{
		    this.startLabelMouseDown[0] = this.xml.STARTANIMATIONDOWN;
	    };
    } else{
        this.startLabelMouseDown = "";
    };


    this.colorTan.isSelect = false;
    this.colorTan.controller =  this.controller;
    this.colorTan.startLabelMouseDown = this.startLabelMouseDown;
    this.colorTan.isRotation = (this.xml.ISROTATION == "true");
	this.colorTan.isDrag = (this.xml.ISDRAG == "true");


	this.blackTan.listening(false);
	this.isDeletateBlack = false;
    if(this.xml.BLACK.DELETE == "1"){
	    this.isDeletateBlack = true;
        this.colorTan.isFree = false;
        this.blackTan.isFree = false;
	    this.setReport(true);
        this.blackTan.remove();
	    this.colorTan.listening(false);
	    if(this.controller.hasMarks()){
		    this.colorTan.on("mousedown touchstart", function(event){
			    this.controller.minusHealth();
		    });
	    };
	    if(this.xml.SETMISSTAKE!=undefined){
		    if(this.xml.SETMISSTAKE == "true"){
			    this.colorTan.listening(true);
			    this.colorTan.on("mousedown touchstart", function(event){
				    this.controller.minusHealth();
			    });
		    };
	    };
        //InteractiveTask.log("delete tan");
    }else{
        this.colorTan.isFree = true;
        this.blackTan.isFree = true;
        this.colorTan.on("mousedown touchstart", function(event){
	         //InteractiveTask.extendsDragRotate(this, event);
	        InteractiveTask.tansDragRotateInterface(this, event);

        });
    };

    if(this.xml.ISDINAMYC=="true"){
        this.colorTan.isFree = false;
        this.blackTan.isFree = false;
    };

    if(this.isEnterArea())this.blackTan.isFree = false;

    // add animation for color tan
    if(this.xml.COLOR.ANIMATION!=undefined){
        this.colorTan.startX = this.colorTan.x();
        this.colorTan.startY = this.colorTan.y();
        this.colorTan.scaleX = this.scaleX;
        this.colorTan.scaleY = this.scaleY;
        this.colorTan.animation_x = function(x){
            this.x(this.startX+x);
        };
        this.colorTan.animation_y = function(y){
            this.y(this.startY+y);
        };
        this.colorTan.animation_rotation = function(r){
            var rot = (Math.floor(r*10))/10;
            this.rotation(rot);
            if(this.rotation()<0){
                this.rotation(360+this.rotation());
            };
            if(this.rotation()>=360){
                this.rotation(this.rotation()-360);
            };
        };
        this.colorTan.animation_scaleX = function(scale){
            var sc = scale/this.scaleX;
            this.colorImageTan.scaleX(sc);
            this.colorImageTan.x((-1)*((this.colorImageTan.width()*sc)/2));
        };
        this.colorTan.animation_scaleY = function(scale){
            var sc = scale/this.scaleY;
            this.colorImageTan.scaleY(sc);
            this.colorImageTan.y((-1)*((this.colorImageTan.height()*sc)/2));
        };
        this.colorTan.animation_alpha = function(alpha){
            this.colorImageTan.opacity(alpha);
        };
        this.colorTan.animation_fillRed = function(red){

        };
        this.colorTan.animation_fillGreen = function(green){

        };
        this.colorTan.animation_fillBlue = function(blue){

        };
        this.colorTan.animation_fill = function(color){

        };


        this.colorAnimation = this.controller.getAnimation({
            class:this,
            object:this.colorTan,
            xml:this.xml.COLOR.ANIMATION
        });
    };
    if(this.xml.BLACK.ANIMATION!=undefined){
        this.blackTan.startX = this.blackTan.x();
        this.blackTan.startY = this.blackTan.y();
        this.blackTan.scaleX = this.scaleX;
        this.blackTan.scaleY = this.scaleY;
        this.blackTan.animation_x = function(x){
            this.x(this.startX+x);
        };
        this.blackTan.animation_y = function(y){
            this.y(this.startY+y);
        };
        this.blackTan.animation_rotation = function(r){
            var rot = (Math.floor(r*10))/10;
            this.rotation(rot);
            if(this.rotation()<0){
                this.rotation(360+this.rotation());
            };
            if(this.rotation()>=360){
                this.rotation(this.rotation()-360);
            };
        };
        this.blackTan.animation_scaleX = function(scale){
            var sc = scale/this.scaleX;
            this.blackImageTan.scaleX(sc);
            this.blackImageTan.x((-1)*((this.blackImageTan.width()*sc)/2));
        };
        this.blackTan.animation_scaleY = function(scale){
            var sc = scale/this.scaleY;
            this.blackImageTan.scaleY(sc);
            this.blackImageTan.y((-1)*((this.blackImageTan.height()*sc)/2));
        };
        this.blackTan.animation_alpha = function(alpha){
            this.blackImageTan.opacity(alpha);
        };
        this.blackTan.animation_fillRed = function(red){

        };
        this.blackTan.animation_fillGreen = function(green){

        };
        this.blackTan.animation_fillBlue = function(blue){

        };
        this.blackTan.animation_fill = function(color){

        };


        this.blackAnimation = this.controller.getAnimation({
            class:this,
            object:this.blackTan,
            xml:this.xml.BLACK.ANIMATION
        });
    };
    //this.controller.complateLoadingTask();
};

InteractiveTask.SamplePictureTan.prototype.rotate = function(degree){
    var rot = this.colorTan.rotation()+degree;
    if(rot == 360 || rot == -360) rot = 0;
    if(rot<0){
        rot = 360+rot;
    };
    if(rot>360){
        rot = rot - 360;
    };
    //alert("color rotation = " + rot + "; black rotation = " + this.blackTan.rotation());
    //InteractiveTask.log("color rotation = ",rot,"; black rotation = ",this.blackTan.rotation());
    this.colorTan.rotation(rot);
};
InteractiveTask.SamplePictureTan.prototype.simplePosition = function(diap){
    //alert("Color tan rotation = "+this.colorTan.rotation());
    //alert("Black tan rotation = "+this.blackTan.rotation());
    var flag = this.colorTan.rotation() == this.blackTan.rotation();
    if(flag){
        //alert("rotation is equal");
        //alert("diap = " + diap);
        if(this.simpleCheckDiap(diap)){
            //alert("is set");
            this.setPosition(this.getPosition());
            this.blackTan.isFree = false;
            return;

        };
    };
    this.backPosition();
};
InteractiveTask.SamplePictureTan.prototype.simpleCheckDiap = function(diap){
    var deltaX = this.colorTan.x() - this.blackTan.x();
    var deltaY = this.colorTan.y() - this.blackTan.y();
    var delta = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    //alert("delta diap = " + delta);
    if(delta<=diap) return true;
    return false;
};

InteractiveTask.SamplePictureTan.prototype.getSettings = function(){
    var out = {
        imageName : this.xml.IMAGE,
        rotation : this.colorTan.rotation(),
        width : parseFloat(this.xml.WIDTH),
        height : parseFloat(this.xml.HEIGHT),
        x : this.colorTan.x(),
        y : this.colorTan.y(),
    };
    return out;
};

InteractiveTask.SamplePictureTan.prototype.checkOtherTan = function(settings){
    if(!this.blackTan.isFree) return false;
    if(this.xml.IMAGE != settings.imageName) return false;
    if(settings.rotation != this.blackTan.rotation()) return false;
    if((settings.width - parseFloat(this.xml.WIDTH))>3) return false;
    if((settings.height - parseFloat(this.xml.HEIGHT))>3) return false;
    var deltaX = settings.x - this.blackTan.x();
    var deltaY = settings.y - this.blackTan.y();
    var delta = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    //alert("diapason");
    //alert("delta diap = " + delta);
    if(delta<=settings.diap) return true;
    return false;
};

InteractiveTask.SamplePictureTan.prototype.backPosition = function(){
    if(this.xml.ISSTARTPOS!="true") return;
    if(this.isEnterArea()){
        InteractiveTask.log("is enter area = true");
        if(this.isEnter()) return;
    };
    this.colorTan.x(parseFloat(this.xml.COLOR.X));
    this.colorTan.y(parseFloat(this.xml.COLOR.Y));
	this.colorTan.getLayer().draw();
};
InteractiveTask.SamplePictureTan.prototype.getPosition = function(){
    var out = {
        x : this.blackTan.x(),
        y : this.blackTan.y()
    };
    return out;
};
InteractiveTask.SamplePictureTan.prototype.setPosition = function(position){
    if(!this.isEnterArea()){
        this.colorTan.setAttrs(position);
	    this.colorTan.getLayer().draw();
        this.colorTan.off("mousedown touchstart");
        this.colorTan.off("mouseout mouseup touchend");
        this.colorTan.isFree = false;
	    this.colorTan.listening(false);

        this.colorTan.isSelect = false;
        if(this.startLabelComplate!=""){
            this.controller.runLabelAnimation(this.startLabelComplate);
        };
    }  else{
        if(this.isEnter()){
            if(this.startLabelComplate!=""){
                this.controller.runLabelAnimation(this.startLabelComplate);
            };
        };
    };

};

/*
 Установка области внесения в случае если это нобходимо  ///////////////////////////////////////////////////////////////////////////////////
 */
InteractiveTask.SamplePictureTan.prototype.area = function(value){
    if(this.xml.BLACK.DELETE == "1") return;
    this.arrTruePosition = new Array();
    this.arrFalsePosition = new Array();
    var x,y;
    x = parseFloat(this.xml.BLACK.X);
    y = parseFloat(this.xml.BLACK.Y);
    var i,l;
    l = value.length;
    for(i=0;i<l;i++){
        if(x>value[i][0] && x<value[i][2] && y>value[i][1] && y<value[i][3]){
            this.arrTruePosition.splice(0,0,value[i]);
        }else{
            this.arrFalsePosition.splice(0,0,value[i]);
        };
    };
    if(this.arrTruePosition.length>0) {
        this.enterArea = true;
        //this.blackTan.isFree = false;
    };
};
InteractiveTask.SamplePictureTan.prototype.isEnterArea = function(){
    return this.enterArea;
};
InteractiveTask.SamplePictureTan.prototype.isEnter = function(){
    var i,l;
    l = this.arrTruePosition.length;
    var X = this.colorTan.x();
    var Y = this.colorTan.y();
    for(i=0;i<l;i++){
        if(X<this.arrTruePosition[i][0] || X>this.arrTruePosition[i][2] || Y<this.arrTruePosition[i][1] || Y>this.arrTruePosition[i][3]) return false;
    };
    l = this.arrFalsePosition.length;
    for(i=0;i<l;i++){
        if(X>this.arrFalsePosition[i][0] && X<this.arrFalsePosition[i][2] && Y>this.arrFalsePosition[i][1] && Y<this.arrFalsePosition[i][3]) return false;
    };
    return true;
};

InteractiveTask.SamplePictureTan.prototype.isComplate = function(){
    var flag = !(this.colorTan.isFree || this.blackTan.isFree);

    return flag;
};

InteractiveTask.SamplePictureTan.prototype.getObject = function(){
    return this.colorTan;
};

InteractiveTask.SamplePictureTan.prototype.getBlackObject = function(){
    return this.blackTan;
};
