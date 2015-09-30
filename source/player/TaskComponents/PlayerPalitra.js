/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 24.02.15
 * Time: 13:52
 * To change this template use File | Settings | File Templates.
 */
/*************************************************************************************/
/****************************** PALITRA (COLOR PICKER) *******************************/
/*************************************************************************************/
InteractiveTask.PalitraController = function(options){
    this.layer = options.layer;
    this.xml = options.xml;
};
InteractiveTask.PalitraController.prototype.init = function(){
    var xmlColor = new Array();
    if(this.xml.COLOR[0] == undefined){
        xmlColor[0] = this.xml.COLOR;
    }else{
        xmlColor = this.xml.COLOR;
    };
    var deltaX = 3;
    var deltaY = 3;
    var currentX = deltaX;
    var currentY = deltaY;
    var pickerSize = 35;

    var numLine = Math.ceil(xmlColor.length/7);
    var heightPanel = numLine*(pickerSize+deltaY) + deltaY;
    var widthPanel;
    if(xmlColor.length<7){
        widthPanel = xmlColor.length*(pickerSize+deltaX) + deltaX;
    }else{
        widthPanel = 7*(pickerSize+deltaX) + deltaX;
    };
    this.background = new Konva.Rect({
        x : 0,
        y : 0,
        width : widthPanel,
        height : heightPanel,
        strokeWidth : 1,
        stroke : 'black',
        fill : "#B6B6B6"
    });
    this.pickerArray = new Array();
    var i = 0;
    for(i=0;i<xmlColor.length;i++){
        this.pickerArray[i] = new InteractiveTask.SamplePicker(xmlColor[i], this);
    };
    this.panel = new Konva.Group();
    this.panel.add(this.background);
    for(i=0;i<this.pickerArray.length;i++){

        if(i%7==0 && i!=0) currentY += pickerSize + deltaY;
        currentX = (i%7) * (pickerSize + deltaX) + deltaX;
        this.pickerArray[i].picker.x(currentX);
        this.pickerArray[i].picker.y(currentY);
        this.panel.add(this.pickerArray[i].picker);
    };
    this.panel.x(parseFloat(this.xml.X));
    this.panel.y(parseFloat(this.xml.Y));

    this.layer.add(this.panel);

    this.currentColor = this.pickerArray[0].color;
};
InteractiveTask.PalitraController.prototype.allDeselect = function(picker){
    var i;
    //alert("deselect");
    for(i=0;i<this.pickerArray.length;i++){
        if(picker!=this.pickerArray[i].picker) {
            this.pickerArray[i].deselect();
        } else {
            this.pickerArray[i].select();
        };
    };
    //alert("redraw layer");
    this.layer.draw();
};
InteractiveTask.PalitraController.prototype.complatePainting = function(){
    this.panel.remove();
    this.layer.draw();
};


InteractiveTask.SamplePicker = function(xml, controller){
    var pickerSize = 35;
    this.color = xml["#text"].substr(2, xml["#text"].length-2);
    while(this.color.length<6){
        this.color = "0"+this.color;
    };
    this.color = "#"+this.color;
    this.picker = new Konva.Rect({
        width : pickerSize,
        height : pickerSize,
        strokeWidth : 1,
        stroke : 'black',
        fill : this.color
    });
    this.picker.on("mousedown touchstart", function(event){
        //alert("controller "+controller);
        controller.currentColor = this.fill();
        controller.allDeselect(this);

    });

};
InteractiveTask.SamplePicker.prototype.select = function(){
    //alert("select start");

    this.picker.stroke("#ffffff");
    //alert("select end");
};
InteractiveTask.SamplePicker.prototype.deselect = function(){
    //alert("deselect start");
    this.picker.stroke("#000000");
    //alert("deselect end");
};