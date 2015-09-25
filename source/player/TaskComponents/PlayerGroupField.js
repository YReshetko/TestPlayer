/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 19.03.15
 * Time: 14:15
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.GroupFieldController = function(options){
    this.colorLayer = options.colorLayer;
    this.blackLayer = options.blackLayer;
    this.controller = options.controller;
    this.diap = options.diap;

    this.groupFieldArray = new Array();
};

InteractiveTask.GroupFieldController.prototype.add = function(xml){
    this.groupFieldArray.push(new InteractiveTask.SampleGroupField({
        colorLayer : this.colorLayer,
        blackLayer : this.blackLayer,
        xml : xml,
        controller : this,
        diap : this.diap
    }));
};
InteractiveTask.GroupFieldController.prototype.checkTask = function(){
    this.controller.checkTask();
};
InteractiveTask.GroupFieldController.prototype.isComplate = function(){
    var i,l;
    l = this.groupFieldArray.length;
    for(i=0;i<l;i++){
        if(!this.groupFieldArray[i].isComplate()) return false;
    };
    return true;
};

InteractiveTask.GroupFieldController.prototype.clear = function(){
	while(this.groupFieldArray.length>0){
		InteractiveTask.disposeObject(this.groupFieldArray[0]);
		this.groupFieldArray[0] = null;
		this.groupFieldArray.shift();
	};
};

/********************************************************************************************************************************/
InteractiveTask.SampleGroupField = function(options){
    this.colorLayer = options.colorLayer;
    this.blackLayer = options.blackLayer;
    this.controller = options.controller;
    this.xml = options.xml;
    this.diap = options.diap;

    this.colorTan = new Kinetic.Group();
    this.blackTan = new Kinetic.Group();

    this.isTan = (this.xml.TAN == "true");
    this.isField = (this.xml.FIELD == "true");

   // console.log(this.xml.CONTENT);
    var elements = new Array();
    var element;
    this.content = new Array();
    var i,l;
    var index = 0;
    var changeX, changeY;
    elements = InteractiveTask.getArrayObjectsByTag(this.xml.CONTENT, "ELEMENT");
    l = elements.length;
    for(i=0;i<l;i++){

        if(elements[i]["USERTAN"]!=undefined) node = "USERTAN";
        if(elements[i]["PICTURETAN"]!=undefined) node = "PICTURETAN";

            element = InteractiveTask.getArrayObjectsByTag(elements[i], node)[0];
            //console.log(element);
            changeX = parseFloat(element.COLOR.X)-parseFloat(this.xml.WIDTH)/2;
            changeY = parseFloat(element.COLOR.Y)-parseFloat(this.xml.HEIGHT)/2;

            var remColorX, remColorY, remBlackX, remBlackY;
            remColorX = element.COLOR.X;
            remColorY = element.COLOR.Y;
            remBlackX = element.BLACK.X;
            remBlackY = element.BLACK.Y;
            element.COLOR.X =  changeX;
            element.BLACK.X =  changeX;
            element.COLOR.Y =  changeY;
            element.BLACK.Y =  changeY;
            switch (node){
                case "USERTAN":

                    this.content.push(new InteractiveTask.SampleUserTan(null, null, element));
                    break;
                case "PICTURETAN":
                    console.log("add picture tan");
                    this.content.push(new InteractiveTask.SamplePictureTan(null, null, element));
                    break;

            };

            this.content[index].init({
                controller : this
            });
        element.COLOR.X =  remColorX;
        element.BLACK.X =  remBlackX;
        element.COLOR.Y =  remColorY;
        element.BLACK.Y =  remBlackY;
            this.content[index].getObject().off("mousedown touchstart");
            this.content[index].getObject().off("mouseout mouseup touchend");
            this.content[index].getObject().draggable(false);
            //this.group.add(this.content[index].getObject());
            this.colorTan.add(this.content[index].getObject());
            if(this.isField){
                this.content[index].getObject().mustVisible = (element["-visible"]=="true");
                if(element["-visible"]=="true"){
                    if(this.isTan)this.blackTan.add(this.content[index].getBlackObject());
                };
            }else{
                if(this.isTan)this.blackTan.add(this.content[index].getBlackObject());
            };
            ++index;

    };
    console.log("num elements", this.content.length);
    this.colorTan.x(parseFloat(this.xml.COLOR.X));
    this.colorTan.y(parseFloat(this.xml.COLOR.Y));

    if(this.isTan){
        this.colorTan.draggable(true);
        this.colorTan.controller = this;
        this.blackTan.x(parseFloat(this.xml.BLACK.X));
        this.blackTan.y(parseFloat(this.xml.BLACK.Y));
        this.blackLayer.add(this.blackTan);
        this.colorTan.on("mouseup touchstop", function(){
            this.controller.setBack();
        });
    };
    if(this.isField){
        var i,l;
        l = this.content.length;
        for(i=1;i<l;i++){
            this.content[i].getObject().opacity(0);
        };
        if(this.colorTan.controller == undefined) this.colorTan.controller = this;
        this.colorTan.currentIndex = 0;
        this.colorTan.on("click tap", function(){
            this.controller.setClick();
        });
    };
    this.colorLayer.add(this.colorTan);


    this.colorLayer.draw();
    this.blackLayer.draw();
};

InteractiveTask.SampleGroupField.prototype.setBack = function(){
    var deltaX = this.colorTan.x() - this.blackTan.x();
    var deltaY = this.colorTan.y() - this.blackTan.y();
    var r = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
    if(r<=this.diap){
        this.colorTan.x(this.blackTan.x());
        this.colorTan.y(this.blackTan.y());
        this.colorTan.draggable(false);
    };
    this.colorLayer.draw();
    this.controller.checkTask();
};
InteractiveTask.SampleGroupField.prototype.setClick = function(){
    ++this.colorTan.currentIndex;
    if( this.colorTan.currentIndex == this.content.length) this.colorTan.currentIndex = 0;
    var i,l;
    for(i=0;i<this.content.length;i++){
        if(this.colorTan.currentIndex == i){
            this.content[i].getObject().opacity(1);
        }   else{
            this.content[i].getObject().opacity(0);
        };
    };
    this.colorLayer.draw();
    this.controller.checkTask();
};
InteractiveTask.SampleGroupField.prototype.isComplate = function(){
    if(!this.isTan && !this.isField) return true;
    if(this.isTan && !this.isField){
        if(this.colorTan.x() == this.blackTan.x() && this.colorTan.y() == this.blackTan.y()) return true;
    };
    var i,l;
    l = this.content.length;

    if(!this.isTan && this.isField){
        for(i=0;i<l;i++){
            if(this.content[i].getObject().mustVisible && this.content[i].getObject().opacity()==1) return true;
        };
    };
    if(this.isTan && this.isField){
        var flag = false;
        for(i=0;i<l;i++){
            if(this.content[i].getObject().mustVisible && this.content[i].getObject().opacity()==1) flag = true;
        };
        var flag2 = (this.colorTan.x() == this.blackTan.x() && this.colorTan.y() == this.blackTan.y());
        return flag&&flag2;
    };
    return false;
};
