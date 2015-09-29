/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 24.02.15
 * Time: 13:50
 * To change this template use File | Settings | File Templates.
 */
/*************************************************************************************/
/****************************** USER TAN *********************************************/
/*************************************************************************************/


InteractiveTask.UserTanController = function(options){
    this.colorLayer = options.colorLayer;
    this.blackLayer = options.blackLayer;
    //alert(task);
    this.task = options.task;
    this.diap = options.diap;
    this.isUniq = options.uniq;
    //this.basePath = options.basePath;
    //alert(this.task);
    this.tanArray = new Array();
    //this.taskController = options.task;
};
InteractiveTask.UserTanController.prototype.add = function(xml){
    var id = this.tanArray.length;
    this.tanArray[id] = new InteractiveTask.SampleUserTan(this.colorLayer, this.blackLayer, xml);
    this.tanArray[id].init({
        controller: this,
        //basePath : this.basePath
    });

};
InteractiveTask.UserTanController.prototype.area = function(area){
    var i,l;
    l = this.tanArray.length;
    for(i=0;i<l;i++){
        this.tanArray[i].area(area);
    };
};
InteractiveTask.UserTanController.prototype.getAnimation = function(options){
    return this.task.getAnimation(options);
};
InteractiveTask.UserTanController.prototype.runLabelAnimation = function(label){
    this.task.runLabelAnimation(label);
};
InteractiveTask.UserTanController.prototype.minusHealth = function(){
	this.task.minusHealth();
};

/*************************************************************/
/**************************CONTROL TANS***********************/
InteractiveTask.UserTanController.prototype.select = function (tan){
    //alert("Select tan");
    this.task.deSelect();
    tan.isSelect = true;
    //alert("Select tan");
};
InteractiveTask.UserTanController.prototype.deSelect = function(){
    var length = this.tanArray.length;
    for(i=0;i<length;i++){
        this.tanArray[i].colorTan.isSelect = false;
    };
};
InteractiveTask.UserTanController.prototype.rotate = function(degree){
    var length = this.tanArray.length;
    for(i=0;i<length;i++){
        if(this.tanArray[i].colorTan.isSelect){
            this.tanArray[i].rotate(degree);
        };
    };
};

InteractiveTask.UserTanController.prototype.tanMouseUp = function(tan){
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
        var flag;
        for(i=0;i<length;i++){
            flag = this.tanArray[i].checkOtherTan(settings);
            if(flag){
                remTanObject.setPosition(this.tanArray[i].getPosition());
                this.tanArray[i].blackTan.isFree = false;
                break;
            };
        };
        if(!flag){
            remTanObject.backPosition();
	        this.task.minusHealth();
        };
	    flag = true;
    };

    this.task.checkTask();

};
InteractiveTask.UserTanController.prototype.paintTan = function(tan){
    //alert("paint tan this");      /////////////////////////////////////////////////////////////////////////////////////////////////////
    var color = this.task.palitraController.currentColor;
    var i = 0;
    var length = this.tanArray.length;
    //alert("length = " + length);
    for(i=0;i<length;i++){
        //alert(this.tanArray[i].isPaint);
        if(this.tanArray[i].colorTan == tan){
            this.tanArray[i].setColor(color);
            break;
        };
    };



    for(i=0;i<length;i++){
        //alert(this.tanArray[i].isPaint);
        if(!this.tanArray[i].isPaint) return;
    };
    //alert("all tans was paint");
    for(i=0;i<length;i++){
        this.tanArray[i].colorableDisabled();
    };
    //alert("change tan position");
    this.task.checkTask();
};
InteractiveTask.UserTanController.prototype.isComplate = function(){
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

InteractiveTask.UserTanController.prototype.checkPainting = function(){
    var i = 0;
    var length = this.tanArray.length;
    for(i=0;i<length;i++){
        //alert(this.tanArray[i].isComplate());
        if(!this.tanArray[i].checkPainting()) return false;
    };
    return true;
};

InteractiveTask.UserTanController.prototype.clear = function(){
	while(this.tanArray.length>0){
		InteractiveTask.disposeObject(this.tanArray[0]);
		this.tanArray[0] = null;
		this.tanArray.shift();
	};
};
/**************************************************************************************************************************/

InteractiveTask.SampleUserTan = function(colorLayer, blackLayer, xml){
    this.colorLayer = colorLayer;
    this.blackLayer = blackLayer;


    this.xml = xml;
	this.setReport(false);
};
InteractiveTask.SampleUserTan.prototype.setReport = function(isComplate){
	if(this.xml.BLACK.DELETE == "1") isComplate = true;
	if(this.xml.LESSONLINK != undefined){
		this.xml.LESSONLINK["-isComplate"] = isComplate;
	};
};
InteractiveTask.SampleUserTan.prototype.init = function(json){
    this.controller = json.controller;
    //this.basePath = json.basePath;
    /*
     Paint tans
     */
    var type =  this.xml["-type"];
	var colorTanFillColor = InteractiveTask.formatColor(this.xml.COLOR.COLOR, parseFloat(this.xml.COLOR.FILL));
	var colorTanLineColor = InteractiveTask.formatColor(this.xml.COLOR.COLORLINE, parseInt(this.xml.COLOR.CONTOUR));

    this.trueColor = InteractiveTask.formatColor16(this.xml.COLOR.COLOR);
	//console.log("this.xml.BLACK.ALPHA = " + this.xml.BLACK.ALPHA);
    if(parseInt(this.xml.BLACK.ALPHA)=="1"){
        var blackTanFillColor = InteractiveTask.formatColor(0, 0);
	    //console.log("black tan color = " + blackTanFillColor);
        var blackTanLineColor = InteractiveTask.formatColor(0,0);
    }else{
	    if(parseInt(this.xml.BLACK.ALPHABG)=="1") {
		    var blackTanFillColor = InteractiveTask.formatColor(0,0);
	    }else{
		    var blackTanFillColor = InteractiveTask.formatColor(0,1);
	    };
	    if(this.xml.BLACK.ALPHALINE=="false"){
		    var blackTanLineColor = InteractiveTask.formatColor(0,1);
	    }else{
		    var blackTanLineColor = InteractiveTask.formatColor(0,0);
	    };

    };
	//console.log("black tan color = " + blackTanFillColor);
    var thickLine = parseInt(this.xml.COLOR.THICKLINE);

    var alpha = parseFloat(this.xml.COLOR.ALPHA);
	//console.log("this.xml.COLOR.ALPHA = " + alpha);
    var points;
    if(this.xml.POINTS[0] == undefined){
        points = this.xml.POINTS;
    }else{
        points = this.xml.POINTS[0];
    };

    this.colorTan = new Kinetic.Shape({
        fill:colorTanFillColor,
        stroke: colorTanLineColor,
        strokeWidth:thickLine,
        x:parseInt(this.xml.COLOR.X),
        y:parseInt(this.xml.COLOR.Y),
	    width : parseFloat(this.xml.WIDTH),
	    height : parseFloat(this.xml.HEIGHT),
        draggable : true,
        fillPriority : "pattern",
        drawFunc : function(context){
            //alert("begin path");
            context.beginPath();

            context.moveTo(parseInt(points.POINT[0]["-x"]), parseInt(points.POINT[0]["-y"]));
            if(type=="curve"){
                for(i=1;i<points.POINT.length;i++){
                    context.quadraticCurveTo(parseInt(points.POINT[i]["-anchorX"]), parseInt(points.POINT[i]["-anchorY"]), parseInt(points.POINT[i]["-x"]), parseInt(points.POINT[i]["-y"]));
                };
            }   else{
                for(i=1;i<points.POINT.length;i++){
                    context.lineTo(parseInt(points.POINT[i]["-x"]), parseInt(points.POINT[i]["-y"]));
                };
            };
            //alert("draw");
            context.closePath();
            context.fillStrokeShape(this);
        }
    });
	this.colorTan.opacity(alpha);
	this.colorTan.dragBoundFunc(function(pos){
		var X=pos.x;
		var Y=pos.y;

		if(X<0){X=0;};
		if(X>InteractiveTask.STAGE.width()){X=InteractiveTask.STAGE.width();};
		if(Y<0){Y=0;};
		if(Y>InteractiveTask.STAGE.height()){Y=InteractiveTask.STAGE.height();};
		return({x:X, y:Y});
	});
//	console.log("this.colorTan.strokeAlpha() = " + this.colorTan.strokeAlpha());
    this.blackTan = new Kinetic.Shape({
        fill: blackTanFillColor,
        stroke: blackTanLineColor,
        strokeWidth:thickLine,
        x:parseInt(this.xml.BLACK.X),
        y:parseInt(this.xml.BLACK.Y),
        drawFunc : function(context){
            //alert("begin path");
            context.beginPath();

            context.moveTo(parseInt(points.POINT[0]["-x"]), parseInt(points.POINT[0]["-y"]));
            if(type=="curve"){
                for(i=1;i<points.POINT.length;i++){
                    context.quadraticCurveTo(parseInt(points.POINT[i]["-anchorX"]), parseInt(points.POINT[i]["-anchorY"]), parseInt(points.POINT[i]["-x"]), parseInt(points.POINT[i]["-y"]));
                };
            }   else{
                for(i=1;i<points.POINT.length;i++){
                    context.lineTo(parseInt(points.POINT[i]["-x"]), parseInt(points.POINT[i]["-y"]));
                };
            };
            //alert("draw");
            context.closePath();
            context.fillStrokeShape(this);
        }
    });

    /*
     Base rotate tans
     */
    this.colorTan.rotation(360 - parseInt(this.xml.COLOR.R)*(22.5));
    this.blackTan.rotation(360 - parseInt(this.xml.BLACK.R)*(22.5));
    if(this.colorTan.rotation() == 360)  this.colorTan.rotation(0);
    if(this.blackTan.rotation() == 360)  this.blackTan.rotation(0);

    if(this.xml.STARTANIMATIONCOMPLATE != undefined){
       // this.startLabelComplate = this.xml.STARTANIMATIONCOMPLATE;
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

    if(this.colorLayer!=null)this.colorLayer.add(this.colorTan);
    if(this.blackLayer!=null)this.blackLayer.add(this.blackTan);

    this.colorTan.layer = this.colorLayer;

    if(this.xml.BLACK.DELETE == "1"){
        this.colorTan.draggable(false);
        this.colorTan.isFree = false;
        this.blackTan.isFree = false;
        this.blackTan.remove();
	    this.setReport(true);
    }else{
        this.colorTan.isFree = true;
        this.blackTan.isFree = true;
        this.colorTan.touchStart = false;
        this.colorTan.on("mousedown touchstart", function(event){
	        InteractiveTask.extendsDragRotate(this, event);
        });

    };
    this.enterArea = false;
    // add animation for color tan
    if(this.xml.COLOR.ANIMATION!=undefined){
        this.colorTan.startX = this.colorTan.x();
        this.colorTan.startY = this.colorTan.y();
        this.colorTan.countour = parseInt(this.xml.COLOR.CONTOUR);
        this.colorTan.colorCountour =  this.xml.COLOR.COLORLINE;

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
            this.scaleX(scale);
        };
        this.colorTan.animation_scaleY = function(scale){
            this.scaleY(scale);
        };
        this.colorTan.animation_alpha = function(alpha){
           /* if(this.countour == 0) return;
            this.stroke(InteractiveTask.formatColor(this.colorCountour, alpha));*/
	        this.opacity(alpha);
        };
        this.colorTan.animation_fillRed = function(red){
            this.fillRed(red);
        };
        this.colorTan.animation_fillGreen = function(green){
            this.fillGreen(green);
        };
        this.colorTan.animation_fillBlue = function(blue){
            this.fillBlue(blue);
        };
        this.colorTan.animation_fill = function(color){
            //console.log("current color = " + color);
            this.fill(color);
            this.layer.draw();
        };


        this.colorAnimation = this.controller.getAnimation({
            class:this,
            object:this.colorTan,
            layer:this.colorLayer,
            xml:this.xml.COLOR.ANIMATION
        });
    };
    // add animation for black tan
    if(this.xml.BLACK.ANIMATION!=undefined){
        this.blackTan.startX = this.blackTan.x();
        this.blackTan.startY = this.blackTan.y();
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
            this.scaleX(scale);
        };
        this.blackTan.animation_scaleY = function(scale){
            this.scaleY(scale);
        };
        this.blackTan.animation_alpha = function(alpha){
           /* this.strokeAlpha(alpha);
            this.fillAlpha(alpha);*/
	        this.opacity(alpha);
        };
        this.blackTan.animation_fillRed = function(red){
            return;
        };
        this.blackTan.animation_fillGreen = function(green){
            return;
        };
        this.blackTan.animation_fillBlue = function(blue){
            return;
        };
        this.blackAnimation = this.controller.getAnimation({
            class:this,
            object:this.blackTan,
            layer:this.blackLayer,
            xml:this.xml.BLACK.ANIMATION
        });
    };
    if(this.colorLayer!=null) this.colorLayer.draw();
    if(this.blackLayer!=null) this.blackLayer.draw();
    if(this.xml.IMAGE!=undefined){
       this.initBackgroundImage();
    };
};
InteractiveTask.SampleUserTan.prototype.initBackgroundImage = function(){
    this.colorTan.fillPatternImage(InteractiveTask.LIBRARY.getImage(this.xml.IMAGE["-name"]));
    this.colorTan.fillPatternOffset({
       x : parseFloat(this.xml.IMAGE["-x"]) + parseFloat(this.xml.IMAGE["-width"])/2,
       y : parseFloat(this.xml.IMAGE["-y"]) + parseFloat(this.xml.IMAGE["-height"])/2
    });
    this.colorLayer.draw();
};

/* some Error   */
InteractiveTask.SampleUserTan.prototype.colorableEnabled = function(){
    this.colorTan.draggable(false);
    try{
        this.colorTan.isFree = true;
        this.blackTan.isFree = true;
        this.colorTan.off("mousedown touchstart");
        this.colorTan.off("mouseout mouseup touchend");
    } catch(error){
        alert("this object doesn't contain mouse event");
    };
    try{    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if(this.xml.COLOR.PAINT == "1"){
            this.isPaint = false;
            this.colorTan.fill("#B6B6B6");
            this.colorTan.on("mousedown touchstart", function(){
                //alert("paint mouse down");
                //this.moveToTop();
                this.controller.paintTan(this);
                if(this.startLabelMouseDown!=""){
                    this.controller.runLabelAnimation(this.startLabelMouseDown);
                };
            });
	        // неявная проверка нужного цвета на дофолтовость, если они совпадают, то тан раскрашен верно
	        if(this.trueColor.toLocaleLowerCase() == this.colorTan.fill().toLocaleLowerCase()){
		        this.isPaint = true;
	        };
        } else{
            this.isPaint = true;
        };
    }catch(error){
        alert(error);
    };
};
InteractiveTask.SampleUserTan.prototype.colorableDisabled = function(){

    try{
        this.colorTan.off("mousedown touchstart");
    } catch(error){
        alert("this object doesn't contain mouse event");
    };
    try{    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if(this.xml.BLACK.DELETE == "1"){
            this.colorTan.draggable(false);
            this.colorTan.isFree = false;
            this.blackTan.isFree = false;
        }else{
            this.colorTan.draggable(true);
            this.colorTan.isFree = true;
            this.blackTan.isFree = true;
            if(this.isEnterArea()){
                this.blackTan.isFree = false;
            };
            this.colorTan.on("mousedown touchstart", function(event){
	            InteractiveTask.extendsDragRotate(this, event);
            });
        };
    }catch(error){
        alert(error);
    };
};
/*********************************************/
InteractiveTask.SampleUserTan.prototype.setColor = function(color){
    //alert("true color = " + this.trueColor + "; currentColor = " + color);
    this.colorTan.fill(color);
    //alert("true color = " + this.trueColor + "; currentColor = " + color);
    this.colorLayer.draw();
    // alert("true color = " + this.trueColor + "; currentColor = " + color);
    if(this.trueColor == color){
        // alert("true color");
        this.isPaint = true;
        if(this.xml.BLACK.DELETE == "1"){
            if(this.startLabelComplate!=""){
                this.controller.runLabelAnimation(this.startLabelComplate);
                this.startLabelComplate = "";
            };
        };
    }else{
	    this.controller.minusHealth();
        this.isPaint = false;
    };
	this.setReport(this.isPaint);
};
InteractiveTask.SampleUserTan.prototype.rotate = function(degree){
    var rot = this.colorTan.rotation()+degree;
    if(rot == 360 || rot == -360) rot = 0;
    if(rot<0){
        rot = 360+rot;
    };
    if(rot>360){
        rot = rot - 360;
    };
    //alert("color rotation = " + rot + "; black rotation = " + this.blackTan.rotation());
   // console.log("color rotation = ",rot,"; black rotation = ",this.blackTan.rotation());
    this.colorTan.rotation(rot);
};
InteractiveTask.SampleUserTan.prototype.simplePosition = function(diap){
    //alert("Color tan rotation = "+this.colorTan.rotation());
    //alert("Black tan rotation = "+this.blackTan.rotation());
    var flag = false;
    switch (parseInt(this.xml.COLOR.SYMMETRY)) {
        case 1:
            flag = this.colorTan.rotation() == this.blackTan.rotation();
            break;
        case 2:
            flag = (this.colorTan.rotation() == this.blackTan.rotation()) ||
                this.colorTan.rotation()+180 == this.blackTan.rotation() ||
                this.colorTan.rotation()-180 == this.blackTan.rotation();
            break;
        case 4:
            flag = (this.colorTan.rotation() == this.blackTan.rotation()) ||
                this.colorTan.rotation()+180 == this.blackTan.rotation() ||
                this.colorTan.rotation()-180 == this.blackTan.rotation() ||
                this.colorTan.rotation()+90 == this.blackTan.rotation() ||
                this.colorTan.rotation()-90 == this.blackTan.rotation() ||
                this.colorTan.rotation()+270 == this.blackTan.rotation() ||
                this.colorTan.rotation()-270 == this.blackTan.rotation();
            break;
        case 16:
            flag = true;
            break;
    };
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
InteractiveTask.SampleUserTan.prototype.simpleCheckDiap = function(diap){
    var deltaX = this.colorTan.x() - this.blackTan.x();
    var deltaY = this.colorTan.y() - this.blackTan.y();
    var delta = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    //alert("delta diap = " + delta);
    if(delta<=diap) return true;
    return false;
};

InteractiveTask.SampleUserTan.prototype.getSettings = function(){
    var points;
    if(this.xml.POINTS[0] == undefined){
        points = this.xml.POINTS;
    }else{
        points = this.xml.POINTS[0];
    };
    var out = {
        points : points,
        rotation : this.colorTan.rotation(),
        color : this.colorTan.stroke(),
        symetry : parseInt(this.xml.COLOR.SYMMETRY),
        x : this.colorTan.x(),
        y : this.colorTan.y()
    };
    return out;
};

InteractiveTask.SampleUserTan.prototype.checkOtherTan = function(settings){
    if(!this.blackTan.isFree) return false;
    var points;
    if(this.xml.POINTS[0] == undefined){
        points = this.xml.POINTS;
    }else{
        points = this.xml.POINTS[0];
    };

    if(points.POINT.length != settings.points.POINT.length) return false;
    //alert("num points");
    // if(this.colorTan.stroke() != settings.color) return false;
    // alert("num points");
    if(parseInt(this.xml.COLOR.SYMMETRY) != settings.symetry) return false;
    // alert("simetry");
    var i,l;
    l = points.POINT.length;
    for(i=0;i<l;i++){
        if(points.POINT[i]["-x"]!=settings.points.POINT[i]["-x"]) return false;
        if(points.POINT[i]["-y"]!=settings.points.POINT[i]["-y"]) return false;
    };
    //alert("all points");
    var flag = false;
    switch (parseInt(this.xml.COLOR.SYMMETRY)) {
        case 1:
            flag = settings.rotation == this.blackTan.rotation();
            break;
        case 2:
            flag = (settings.rotation == this.blackTan.rotation()) ||
                settings.rotation+180 == this.blackTan.rotation() ||
                settings.rotation-180 == this.blackTan.rotation();
            break;
        case 4:
            flag = (settings.rotation == this.blackTan.rotation()) ||
                settings.rotation+180 == this.blackTan.rotation() ||
                settings.rotation-180 == this.blackTan.rotation() ||
                settings.rotation+90 == this.blackTan.rotation() ||
                settings.rotation-90 == this.blackTan.rotation() ||
                settings.rotation+270 == this.blackTan.rotation() ||
                settings.rotation-270 == this.blackTan.rotation();
            break;
        case 16:
            flag = true;
            break;
    };

    if(!flag) return false;
    //alert("rotation");
    var deltaX = settings.x - this.blackTan.x();
    var deltaY = settings.y - this.blackTan.y();
    var delta = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    //alert("diapason");
    //alert("delta diap = " + delta);
    if(delta<=settings.diap) return true;
    return false;
};

InteractiveTask.SampleUserTan.prototype.backPosition = function(){
    if(this.xml.ISSTARTPOS!="true") return;
    if(this.isEnterArea()){
        console.log("is enter area = true");
        if(this.isEnter()) return;
    };
    this.colorTan.x(parseFloat(this.xml.COLOR.X));
    this.colorTan.y(parseFloat(this.xml.COLOR.Y));
    this.colorLayer.draw();
};
InteractiveTask.SampleUserTan.prototype.getPosition = function(){
    var out = {
        x : this.blackTan.x(),
        y : this.blackTan.y()
    };
    return out;
};
InteractiveTask.SampleUserTan.prototype.setPosition = function(position){
    if(!this.isEnterArea()){
        this.colorTan.setAttrs(position);
        this.colorLayer.draw();

        this.colorTan.draggable(false);
        this.colorTan.off("mousedown touchstart");
        this.colorTan.off("mouseout mouseup touchend");
        this.colorTan.isFree = false;


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
InteractiveTask.SampleUserTan.prototype.area = function(value){
    if(this.xml.BLACK.DELETE == "1") return;
    this.arrTruePosition = new Array();
    this.arrFalsePosition = new Array();
    var i,l;
    l = value.length;
    for(i=0;i<l;i++){
        if(this.getPosition().x>value[i][0] && this.getPosition().x<value[i][2] && this.getPosition().y>value[i][1] && this.getPosition().y<value[i][3]){
            this.arrTruePosition.splice(0,0,value[i]);
        }else{
            this.arrFalsePosition.splice(0,0,value[i]);
        };
    };
    if(this.arrTruePosition.length>0) {
        this.enterArea = true;
        this.blackTan.isFree = false;
        /*colorContainer.removeEventListener(MouseEvent.MOUSE_DOWN, COLOR_MOUSE_DOWN);
        colorContainer.removeEventListener(MouseEvent.MOUSE_UP, COLOR_MOUSE_UP);


        colorContainer.addEventListener(MouseEvent.MOUSE_DOWN, SIMPLE_MOUSE_DOWN);
        colorContainer.addEventListener(MouseEvent.MOUSE_UP, SIMPLE_MOUSE_UP); */
    };
};
InteractiveTask.SampleUserTan.prototype.isEnterArea = function(){
    return this.enterArea;
};
InteractiveTask.SampleUserTan.prototype.isEnter = function(){
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
 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
InteractiveTask.SampleUserTan.prototype.checkPainting = function(){
    if(this.isPaint == undefined) return true;
    return this.isPaint;
};

InteractiveTask.SampleUserTan.prototype.isComplate = function(){
    var flag = !(this.colorTan.isFree || this.blackTan.isFree);

    return flag;
};

InteractiveTask.SampleUserTan.prototype.getObject = function(){
    return this.colorTan;
};
InteractiveTask.SampleUserTan.prototype.getBlackObject = function(){
    return this.blackTan;
};