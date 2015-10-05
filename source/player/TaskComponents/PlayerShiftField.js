/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 10.03.15
 * Time: 13:12
 * To change this template use File | Settings | File Templates.
 */

InteractiveTask.ShiftFieldController = function(options){
    this.controller = options.controller;

    this.diap = options.diap;
    //this.basePath = options.basePath;

    this.shiftFieldArray = new Array();

};
InteractiveTask.ShiftFieldController.LAYER;

InteractiveTask.ShiftFieldController.prototype.add = function(xml){
    InteractiveTask.ShiftFieldController.LAYER = this.layer;
    this.shiftFieldArray.push(new InteractiveTask.SampleShiftField({
        xml : xml,
        controller : this,
        diap : this.diap,
        //basePath : this.basePath
    }));

};
InteractiveTask.ShiftFieldController.prototype.initCache = function(){
    var i,l;
    l =  this.shiftFieldArray.length;
    for(i=0;i<l;i++){
        this.shiftFieldArray[i].initCache();
    };
};
InteractiveTask.ShiftFieldController.prototype.checkComplate = function(){
    this.controller.checkTask();
};
InteractiveTask.ShiftFieldController.prototype.isComplate = function(){
    var i,l;
    l = this.shiftFieldArray.length;
    for(i=0;i<l;i++){
        if(!this.shiftFieldArray[i].isComplate()) return false;
    };
    return true;
};
InteractiveTask.ShiftFieldController.prototype.minusHealth = function(){
	this.controller.minusHealth();
};
InteractiveTask.ShiftFieldController.prototype.clear = function(){
	while(this.shiftFieldArray.length>0){
		InteractiveTask.disposeObject(this.shiftFieldArray[0]);
		this.shiftFieldArray[0] = null;
		this.shiftFieldArray.shift();
	};
};

InteractiveTask.ShiftFieldController.prototype.addToLayer = function(layer){
	var i,l;
	l = this.shiftFieldArray.length;
	for(i=0;i<l;i++){
		layer.add(this.shiftFieldArray[i].field);
	};
};

/********************************************************************************************************************************/

InteractiveTask.SampleShiftField = function(options){
    this.controller = options.controller;
    this.xml = options.xml;
    this.diap = options.diap;
   // this.basePath = options.basePath;

    var fields = InteractiveTask.getArrayObjectsByTag(this.xml,"FIELD");
    var i;
    this.fieldsArray = new Array();
    this.numComplate = 0;
    for(i=0;i<fields.length;i++){
        this.fieldsArray.push(new InteractiveTask.UnitField(fields[i], this));
    };
    this.createComplate();
};
InteractiveTask.SampleShiftField.prototype.setReport = function(isComplate){
	if(this.xml.LESSONLINK != undefined){
		this.xml.LESSONLINK["-isComplate"] = isComplate;
	};
};
InteractiveTask.SampleShiftField.prototype.createComplate = function(){
    /*++ this.numComplate;
    if(this.fieldsArray.length != this.numComplate) return;  */
     //console.log("CELL is created") ;
    var i;
    this.field = new Konva.Group();

    var background = new Konva.Rect({
        width : this.xml["-width"],
        height :  this.xml["-height"],
        fill : "rgba(0, 0, 0, 0)",
        stroke : "rgba(0, 0, 0, 0)",
        x : 0,
        y : 0
    });
    this.field.add(background);

    this.coordinates = new Array();
    for(i=0;i<this.fieldsArray.length;i++){
        this.coordinates.push({
            x : this.fieldsArray[i].j * this.fieldsArray[i].width + (this.fieldsArray[i].j+1)*3,
            y : this.fieldsArray[i].i * this.fieldsArray[i].height + (this.fieldsArray[i].i+1)*3
        });
        this.fieldsArray[i].group.x(this.coordinates[i].x);
        this.fieldsArray[i].group.y(this.coordinates[i].y);

        this.fieldsArray[i].group.oldX = this.coordinates[i].x;
        this.fieldsArray[i].group.oldY = this.coordinates[i].y;
	   // var fieldLayer =this.field
        this.fieldsArray[i].group.back = function(){
            this.x(this.oldX);
            this.y(this.oldY);
	        InteractiveTask.COMPONENTS_LAYER.batchDraw();
           // try{this.getLayer().draw();}catch(e){};
        };

        this.field.add(this.fieldsArray[i].group);
        this.fieldsArray[i].group.draggable(true);
        this.fieldsArray[i].group.controller = this;
	    this.fieldsArray[i].group.myIndex = i;
        this.fieldsArray[i].group.on("mousedown", function(){
            this.moveToTop();
            //this.controller
        });
        this.fieldsArray[i].group.on("mouseup", function(){
            var index = this.controller.getClosestPosition(this);

            if(Math.abs(this.controller.coordinates[index].x - this.x())<this.controller.diap && Math.abs(this.controller.coordinates[index].y - this.y())<this.controller.diap){
                var remX, remY;
                remX = this.oldX;
                remY = this.oldY;

                var obj = this.controller.getObjectByXY(this.controller.coordinates[index].x, this.controller.coordinates[index].y);

                this.oldX = this.controller.coordinates[index].x;
                this.oldY = this.controller.coordinates[index].y;

                this.back();


                obj.group.oldX = remX;
                obj.group.oldY = remY;
                obj.group.back();
            }else{
                this.back();
            };
	        if(this.myIndex != index){
		        this.controller.minusHealth();
	        };
            this.controller.checkComplate();

        });

    };
    var indexes = InteractiveTask.getRandomIndexesTo(this.fieldsArray.length);
    for(i=0;i<indexes.length; i++){
        this.fieldsArray[i].group.oldX = this.coordinates[indexes[i]].x;
        this.fieldsArray[i].group.oldY = this.coordinates[indexes[i]].y;
        this.fieldsArray[i].group.back();
    };


    this.field.x(parseFloat(this.xml["-x"]));
    this.field.y(parseFloat(this.xml["-y"]));
};
InteractiveTask.SampleShiftField.prototype.getObjectByXY = function(x, y){
    var i,l;
    l = this.fieldsArray.length;
    for(i=0;i<l;i++){
        if( Math.abs(this.fieldsArray[i].group.oldX - x) <=1 && Math.abs(this.fieldsArray[i].group.oldY - y) <=1 ){
            return this.fieldsArray[i];
        };
    };
    return null;
};
InteractiveTask.SampleShiftField.prototype.getObjectByIJ - function(i, j){
    var i,l;
    l = this.fieldsArray.length;
    for(i=0;i<l;i++){
        if(this.fieldsArray[i].i == i && this.fieldsArray[i].j  == j){
            return this.fieldsArray[i];
        };
    };
    return null;
};

InteractiveTask.SampleShiftField.prototype.getClosestPosition = function(object){
    var X = object.x();
    var Y = object.y();
    var i,l;
    var deltaX, deltaY;
    var minR;
    var minI;

    deltaX = X - this.coordinates[0].x;
    deltaY = Y - this.coordinates[0].y;

    minR = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    minI = 0;

    l = this.coordinates.length;
    for(i=0;i<l;i++){
        deltaX = X - this.coordinates[i].x;
        deltaY = Y - this.coordinates[i].y;
        if(Math.sqrt(deltaX*deltaX + deltaY*deltaY)<minR){
            minR = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            minI = i;
        };
    };
    return minI;
};
InteractiveTask.SampleShiftField.prototype.checkComplate = function(){
    this.controller.checkComplate();
};
InteractiveTask.SampleShiftField.prototype.isComplate = function(){
    var i,l;
    l = this.fieldsArray.length;
    for(i=0;i<l;i++){
        if(!this.fieldsArray[i].isFree && (this.coordinates[i].x != this.fieldsArray[i].group.x() || this.coordinates[i].y != this.fieldsArray[i].group.y())) {
	        this.setReport(false);
	        return false;
        };
    };
	this.setReport(true);
    return true;
};


InteractiveTask.SampleShiftField.prototype.initCache = function(){
    var i,l;
    l = this.fieldsArray.length;
    for(i=0;i<l;i++){
        try{this.fieldsArray[i].initCache();}catch (e){console.log(e);};
    };
};
InteractiveTask.SampleShiftField.prototype.minusHealth = function(){
	this.controller.minusHealth();
};

/********************************************************************************************************************************/
InteractiveTask.UnitField = function(xml, controller){
    this.xml = xml;
    this.controller = controller;

    this.i = parseInt(this.xml["-i"]);
    this.j = parseInt(this.xml["-j"]);
    this.width = parseInt(this.xml["-width"]);
    this.height = parseInt(this.xml["-height"]);
    this.group = new Konva.Group();
    var flag = false;
    this.isFree = true;
    //console.log(basePath);
    if(this.xml.USERTAN!=undefined){
        this.content = new InteractiveTask.SampleUserTan(this.xml.USERTAN);
        this.content.init({
            controller : this
        });
        flag = true;
        this.isFree = false;
        this.complateLoadingTask();
    };
    if(this.xml.LABEL != undefined){
        this.content = new InteractiveTask.SampleTextField({
            layer : null,
            blackLayer : null,
            controller : this,
            diap : 0,
            xml : this.xml.LABEL
        });
        flag = true;
        this.isFree = false;
        this.complateLoadingTask();

    };
    if(this.xml.PICTURETAN!=undefined){
        this.content = new InteractiveTask.SamplePictureTan(this.xml.PICTURETAN);
        this.content.init({
            controller : this
        });
        flag = true;
        this.isFree = false;
        this.complateLoadingTask();

    };

    if(flag){
        console.log("Field is full");
    }else{
        this.createCell();
        this.createFrame();
        //this.controller.createComplate();
    };
};

InteractiveTask.UnitField.prototype.complateLoadingTask = function(){
    console.log("Complate creation FIELD");
    this.content.getObject().off("mousedown touchstart");
    this.content.getObject().off("mouseout mouseup touchend");
    this.content.getObject().draggable(false);
    this.createCell();
    this.group.add(this.content.getObject());
    this.createFrame();
    //this.controller.createComplate();
   /* try{
        this.initCache();
    } catch(e){}*/
};
InteractiveTask.UnitField.prototype.createCell = function(){
    var background = new Konva.Rect({
        width : this.xml["-width"],
        height :  this.xml["-height"],
        fill : "rgba(0, 0, 0, 0)",
        stroke : "rgba(0, 0, 0, 0)",
        x : 0,
        y : 0
    });
    this.group.add(background);
};

InteractiveTask.UnitField.prototype.createFrame = function(){
    this.frame = new Konva.Rect({
        width : this.xml["-width"],
        height :  this.xml["-height"],
        fill : "rgba(0, 0, 0, 0)",
        stroke : "rgba(0, 0, 0, 0)",
        x : 0,
        y : 0
    });
    this.group.add(this.frame);
};
InteractiveTask.UnitField.prototype.select = function(){
    this.frame.strokeWidth(5);
    this.frame.stroke("rgba(0, 0, 255, 0.4)");
    this.frame.draw();
    InteractiveTask.STAGE.draw();
};


InteractiveTask.UnitField.prototype.initCache = function(){
    this.group.cache({
        x:0,
        y:0,
        width : this.xml["-width"],
        height : this.xml["-height"]
    });
};