/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 01.03.15
 * Time: 6:49
 * To change this template use File | Settings | File Templates.
 */

InteractiveTask.CheckBoxController = function(options){
    this.controller = options.task;
    this.checkBoxArray = new Array();
};

InteractiveTask.CheckBoxController.prototype.add = function(xml){
    var id = this.checkBoxArray.length;
    this.checkBoxArray[id] = new InteractiveTask.SampleCheckBox( xml);
    this.checkBoxArray[id].init({
        controller: this
    });
};
InteractiveTask.CheckBoxController.prototype.checkComplate = function(){
    this.controller.checkTask();
};
InteractiveTask.CheckBoxController.prototype.isComplate = function(){
    var i,l;
    l = this.checkBoxArray.length;
    for(i=0;i<l;i++){
        if(!this.checkBoxArray[i].isComplate()) return false;
    };
    return true;
};
InteractiveTask.CheckBoxController.prototype.runLabelAnimation = function(label){
    this.controller.runLabelAnimation(label);
};
InteractiveTask.CheckBoxController.prototype.minusHealth = function(){
	this.controller.minusHealth();
};

InteractiveTask.CheckBoxController.prototype.clear = function(){
	while(this.checkBoxArray.length>0){
		InteractiveTask.disposeObject(this.checkBoxArray[0]);
		this.checkBoxArray[0] = null;
		this.checkBoxArray.shift();
	};
};

InteractiveTask.CheckBoxController.prototype.addToLayer = function(layer){
	var i,l;
	l = this.checkBoxArray.length;
	for(i=0;i<l;i++){
		layer.add(this.checkBoxArray[i].checkBox);
	};
};

/******************************************************************************************************************************/

InteractiveTask.SampleCheckBox = function( xml){
    this.xml = xml;
};



InteractiveTask.SampleCheckBox.prototype.init = function(json){
    this.controller = json.controller;
    this.checkBox = new Konva.Group();
    var checkBoxBackground = new Konva.Rect({
        x : 0,
        y : 0,
        width : this.xml.WIDTH,
        height : this.xml.HEIGHT,
        strokeWidth : 1,
        stroke : "rgba(0, 0, 0, 0)",
        fill : InteractiveTask.formatColorFlashToCanvas(this.xml.BGCOLOR)
    });

    var checkBoxText = new Konva.Text({
         x: parseFloat(this.xml.WIDTH)/2.7,
         y: parseFloat(this.xml.HEIGHT)/10,
         text: '?',
         fontSize: (parseFloat(this.xml.HEIGHT)>70)?(70*0.8):(parseFloat(this.xml.HEIGHT)*0.8),
         fontFamily: 'Calibri',
         fill: InteractiveTask.formatColorFlashToCanvas(this.xml.TEXTCOLOR)
    });
    //InteractiveTask.log("Create text checkbox");
    this.checkBox.x(parseFloat(this.xml.X));
    this.checkBox.y(parseFloat(this.xml.Y));
    this.checkBox.add(checkBoxBackground);
    this.checkBox.add(checkBoxText);

    //InteractiveTask.log("all variant = ", this.xml.ALLVARIANTS.VARIANT[0]["#cdata-section"]);
    var variant = new Array();
    var i,l;
    if(this.xml.ALLVARIANTS.VARIANT[0]==undefined){
        variant.push(this.xml.ALLVARIANTS.VARIANT["#cdata-section"]);
    }else{
        l = this.xml.ALLVARIANTS.VARIANT.length;
        for(i=0;i<l;i++){
            variant.push(this.xml.ALLVARIANTS.VARIANT[i]["#cdata-section"]);
        };
    };
    var r = this.xml.RANDOM;
    i=0;
    this.trueVariant = this.xml.TRUEVARIANT;
    this.currentVariant = "";
    if(this.xml.QUESTION=='false'){
        checkBoxText.text(variant[0]);
        i++;
        this.currentVariant = variant[0];
    };
    this.startLabelComplate = "";
    if(this.xml.STARTANIMATIONCOMPLATE!=undefined){
        this.startLabelComplate = this.xml.STARTANIMATIONCOMPLATE;
    };
    this.startLabelMouseDown = "";
    if(this.xml.STARTANIMATIONDOWN!=undefined){
        this.startLabelMouseDown = this.xml.STARTANIMATIONDOWN;
    };

//    /var text = checkBoxText.text();
    this.checkBox.controller = this;

	var randIndexis = InteractiveTask.getRandomIndexesTo(variant.length);
	var flagRepeat = false;
    this.checkBox.on('mousedown touchstart', function() {
        var index = i;
	    var currentVariant;
        if(r=='true'){
	        currentVariant = variant[randIndexis[index]];
        } else {
	        currentVariant = variant[index];
        };
	    checkBoxText.text(currentVariant);
	    if (i==variant.length-1){
		    i=0;
		    flagRepeat = true;
	    } else {
		    if(i==0 && flagRepeat){
			    this.controller.controller.minusHealth();
		    };
		    i++;
	    };
        checkBoxText.x((checkBoxBackground.width()-checkBoxText.width())/2);
        this.getLayer().draw();
        this.controller.setCurrentVariant(currentVariant);
        if(this.controller.startLabelMouseDown != ""){
            this.controller.controller.runLabelAnimation(this.controller.startLabelMouseDown);
        };
    });
};
InteractiveTask.SampleCheckBox.prototype.setCurrentVariant = function(value){
    this.currentVariant = value;
    if(this.startLabelComplate!=""){
        if(this.isComplate()){
            this.startLabelComplate = "";
            this.controller.runLabelAnimation(this.startLabelComplate);
        };
    };
    this.controller.checkComplate();
};
InteractiveTask.SampleCheckBox.prototype.isComplate = function(){
	var flag =  this.currentVariant == this.trueVariant;
	this.setReport(flag);
	return flag;
};
InteractiveTask.SampleCheckBox.prototype.setReport = function(isComplate){
	if(this.xml.LESSONLINK != undefined){
		this.xml.LESSONLINK["-isComplate"] = isComplate;
	};
};



