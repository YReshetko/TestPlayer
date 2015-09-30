/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 03.03.15
 * Time: 11:15
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.PointsDrawController = function(options){
    this.layer = options.layer;
    this.controller = options.task;
    this.pointsArray = new Array();
};

InteractiveTask.PointsDrawController.prototype.add = function(xml){
    var id = this.pointsArray.length;
    this.pointsArray[id] = new InteractiveTask.PointsSystem(this.layer, xml);
    this.pointsArray[id].init({
        controller: this
    });
};
InteractiveTask.PointsDrawController.prototype.checkTask = function(){
    this.controller.checkTask();
};

InteractiveTask.PointsDrawController.prototype.isComplate = function(){
    var i,l;
    l = this.pointsArray.length;
    for(i=0;i<l;i++){
        if(!this.pointsArray[i].isComplate()) return false;
    };
    return true;
};
InteractiveTask.PointsDrawController.prototype.minusHealth = function(){
	this.controller.minusHealth();
};

InteractiveTask.PointsDrawController.prototype.clear = function(){
	while(this.pointsArray.length>0){
		InteractiveTask.disposeObject(this.pointsArray[0]);
		this.pointsArray[0] = null;
		this.pointsArray.shift();
	};
};


/********************************************************************************************************************************/

InteractiveTask.PointsSystem = function(layer, xml){
    this.layer = layer;
    this.xml = xml;

	this.setReport(false);
};
InteractiveTask.PointsSystem.prototype.setReport = function(isComplate){
	if(this.xml.LESSONLINK != undefined){
		this.xml.LESSONLINK["-isComplate"] = isComplate;
	};
};

InteractiveTask.PointsSystem.prototype.init = function(options){
    this.controller = options.controller;
    this.system = new Konva.Group();
    this.system.x(parseFloat(this.xml.X));
    this.system.y(parseFloat(this.xml.Y));
    this.selectLastPoint = (this.xml.LASTPOINT == "true");



    this.plane = new Konva.Shape({
        x : 0,
        y : 0,
        fillEnabled : false,
        strokeWidth : parseInt(this.xml.THICK),
        stroke : InteractiveTask.formatColorFlashToCanvas(this.xml.COLOR),
        drawFunc : function(context){
            context.beginPath();
            var i,l;
            if(this.pointArray==undefined) {
                this.pointArray = new Array();
            };
            l = this.pointArray.length;
            for(i=0;i<l;i++){
                context.moveTo(this.pointArray[i]["X1"],this.pointArray[i]["Y1"]);
                context.lineTo(this.pointArray[i]["X2"],this.pointArray[i]["Y2"]);
            };
            context.closePath();
            context.fillStrokeShape(this);
        }
    });
    this.plane.lineJoin('round');
    this.system.add(this.plane);

    this.pointsArray = new Array();
    var xmlArrayPoints = InteractiveTask.getArrayObjectsByTag(this.xml.POINTS, "POINT");
    var i,l;
    l = xmlArrayPoints.length;
   // if(l==0) return;
    for(i=0;i<l;i++){
        this.pointsArray.push(new InteractiveTask.SamplePoint({
            xml : xmlArrayPoints[i],
            layer : this.system,
            controller : this,
            active : (this.xml.ACTIVE == "true"),
            alpha : (this.xml.ALPHA == "true"),
            radiusCenter : parseInt(this.xml.RADIUSCENTER),
            radiusArea : parseInt(this.xml.RADIUSAREA)

        }));
    };

    this.prepareTrueArray();

    this.layer.add(this.system);
    this.layer.draw();
   // console.log(this.trueArray);
};
InteractiveTask.PointsSystem.prototype.prepareTrueArray = function(){
    this.trueArray = new Array();
    if(this.pointsArray.length == 0) return;
    var k,i,j,l;
    var currentArray;
    var flag = false;
    l = this.pointsArray.length;
    for(k=0;k<l;k++){
        currentArray =  this.pointsArray[k].getNeccessaryLines();
	    //console.log(currentArray);
        for(i=0;i<currentArray.length;i++){
            flag = true;
            for(j=0;j<this.trueArray.length;j++){
                if(this.trueArray[j] == currentArray[i]){
                    flag = false;
                    break;
                };
            };
            if(flag){
                this.trueArray.push(currentArray[i]);
            };
        };
    };
};
InteractiveTask.PointsSystem.prototype.selectPoint = function(point){
    var target;
    var i,l;
    l = this.pointsArray.length;
    for(i=0;i<l;i++){
        if(this.pointsArray[i].point == point){
            target = this.pointsArray[i];
            break;
        };
    };
    if(target.isSelect){
        target.deselect();
        target.center.draw();
        this.layer.draw();
        return;
    };
    var idSelect = -1;
    for(i=0;i<l;i++){
        if(this.pointsArray[i].isSelect){
            idSelect = i;
            break;
        };
    };
    if(idSelect==-1){
        target.select();
    }else{
        this.pointsArray[idSelect].deselect();
        if(this.selectLastPoint){
            target.select();
        }else{
            target.deselect();
        };

        var firstID, secondID;
        firstID = target.getID();
        secondID = this.pointsArray[idSelect].getID();
        var label = (firstID<secondID)?(firstID+"-"+secondID):(secondID+"-"+firstID);

        var flag = true;

        var i,l;
        l = this.plane.pointArray.length;
        for(i=0;i<l;i++){
            if(label == this.plane.pointArray[i]["label"]){
                flag = false;
                this.plane.pointArray.splice(i, 1);
                break;
            };
        };
        if(flag){
            this.plane.pointArray.push({
                label : label,
                X1 : target.point.x(),
                Y1 : target.point.y(),
                X2 : this.pointsArray[idSelect].point.x(),
                Y2 : this.pointsArray[idSelect].point.y(),
            });
	        for(i=0;i<this.trueArray.length;i++){
		        if(label == this.trueArray[i]){
			        flag = false;
			        break;
		        };
	        };
	        if(flag){
		        this.controller.minusHealth();
	        };
        };

        this.layer.draw();
        //console.log("Draw line");
        this.controller.checkTask();
    };
};

InteractiveTask.PointsSystem.prototype.isComplate = function(){
    if(this.trueArray.length != this.plane.pointArray.length) return false;
    var i,j,l;
    var flag, q;
    flag = false;
    q = true;
    l = this.plane.pointArray.length;
    for(i=0; i<l; i++){
        flag = true;
        for(j=0;j<l;j++){
            if(this.trueArray[i] == this.plane.pointArray[j]["label"]){
                flag = false;
                break;
            };
        };
        if(flag){
            q = false;
            break;
        };
    };
	this.setReport(q);
    return q;
};

/********************************************************************************************************************************/

InteractiveTask.SamplePoint = function(options){
    this.options = options;
    this.idPointsConnect = InteractiveTask.getArrayObjectsByTag(this.options.xml, "LINE_TO");
	//console.log("this.idPointsConnect = " + this.idPointsConnect);
    if(this.options.active && this.idPointsConnect == 0) return;

    this.selectColor ="rgba(255, 0, 0, 1)";
    this.deselectColor = "rgba(0, 0, 0, 1)";
    if(this.options.alpha){
        this.deselectColor = "rgba(0, 0, 0, 0)";
    };
    this.isSelect = false;
    this.center = new Konva.Circle({
        radius : this.options.radiusCenter,
        fill : this.deselectColor,
        stroke : "rgba(0, 0, 0, 0)",
        x : 0,
        y : 0,
    });
    this.area = new Konva.Circle({
        radius : this.options.radiusArea,
        fill : "rgba(0, 0, 0, 0)",
        stroke : "rgba(0, 0, 0, 0)",
        x : 0,
        y : 0,
    });

    this.point = new Konva.Group();
    this.point.x(parseFloat(this.options.xml["-x"]));
    this.point.y(parseFloat(this.options.xml["-y"]));
    this.point.controller = this.options.controller;
    this.point.on("mousedown touchstart", function(){
         this.controller.selectPoint(this);
    });
    this.point.add(this.center);
    this.point.add(this.area);
    this.options.layer.add(this.point);
    //console.log("point x = ", this.point.x(), "; point y = ", this.point.y());
};

InteractiveTask.SamplePoint.prototype.getID = function(){
    return parseInt(this.options.xml["-id"]);
};
InteractiveTask.SamplePoint.prototype.select = function(){
    this.center.fill(this.selectColor);
    this.isSelect = true;
    this.options.layer.draw();
};
InteractiveTask.SamplePoint.prototype.deselect = function(){
    this.center.fill(this.deselectColor);
    this.isSelect = false;
    this.options.layer.draw();
};

InteractiveTask.SamplePoint.prototype.getNeccessaryLines = function(){
    var out = new Array();
    var i,l;
	var str = this.idPointsConnect.toString();
	if(str.indexOf(",")==-1 && str!=""){
		out.push((this.idPointsConnect<this.getID())?(this.idPointsConnect+"-"+this.getID()):(this.getID()+"-"+this.idPointsConnect));
	}else{
		l = this.idPointsConnect.length;
		for(i=0;i<l;i++){
			out.push((this.idPointsConnect[i]<this.getID())?(this.idPointsConnect[i]+"-"+this.getID()):(this.getID()+"-"+this.idPointsConnect[i]));
		};
	};
    return out;
};
