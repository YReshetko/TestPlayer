/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 15.03.15
 * Time: 21:55
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.ImageLibrary = function(xml, controller, imagesPath){
    if(imagesPath) InteractiveTask.CONST.STANDARD_IMAGES_PATH = imagesPath;
    this.path = InteractiveTask.PATH;
    this.xml = xml;
    this.controller = controller;
    this.imagesName = new Array();
    this.images = new Array();
};
InteractiveTask.ImageLibrary.prototype.findImages = function(){
    var task = InteractiveTask.getArrayObjectsByTag(this.xml, "TASK");
    var userTans, imageTans, shiftFields, swfObjects, fields, groupFields, groupUserTan, groupPictureTan, positioningFields;
    var i, j,l;
    var taskIndex, taskLength;
    taskLength = task.length;
    for(taskIndex=0;taskIndex<taskLength;taskIndex++){
        //console.log(task[taskIndex]);
        userTans = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "USERTAN");
        imageTans = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "PICTURETAN");
        shiftFields = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "SHIFTFIELD");
        swfObjects = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "SWFOBJECT");
        //console.log(imageTans);
        groupFields =  InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "GROUPFIELD");
	    positioningFields =  InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "POSITIONING");
        groupUserTan = new Array();
        groupPictureTan = new Array();
        if(groupFields.length!=0){
            var sampTan;
            var i1,i2, l1,l2;
            var a,b;
            var elements;
            l1 = groupFields.length;
            for(i1=0;i1<l1;i1++){
                elements = InteractiveTask.getArrayObjectsByTag(groupFields[i1].CONTENT, "ELEMENT");
                for(a=0;a<elements.length;a++){
                    sampTan = InteractiveTask.getArrayObjectsByTag(elements[a], "USERTAN");
                    l2 = sampTan.length;
                    for(i2=0;i2<l2; i2++){
                        groupUserTan.push(sampTan[i2]);
                    };
                    sampTan = InteractiveTask.getArrayObjectsByTag(elements[a], "PICTURETAN");
                    l2 = sampTan.length;
                    for(i2=0;i2<l2; i2++){
                        groupPictureTan.push(sampTan[i2]);
                    };
                };


            };
            l = groupUserTan.length;
            for(i=0;i<l;i++){
                if(groupUserTan[i].IMAGE!=undefined) this.setImageName(groupUserTan[i].IMAGE["-name"]);
            };
            l = groupPictureTan.length;
            for(i=0;i<l;i++){
                if(groupPictureTan[i].IMAGE!=undefined) this.setImageName(groupPictureTan[i].IMAGE);
            };
        };



        l = userTans.length;
        for(i=0;i<l;i++){
            if(userTans[i].IMAGE!=undefined) this.setImageName(userTans[i].IMAGE["-name"]);
        };
        l = imageTans.length;
        for(i=0;i<l;i++){
            if(imageTans[i].IMAGE!=undefined) this.setImageName(imageTans[i].IMAGE);
        };
        l = shiftFields.length;
        for(i=0;i<l;i++){
            fields = InteractiveTask.getArrayObjectsByTag(shiftFields[i], "FIELD");
            for(j=0;j<fields.length;j++){
                if(fields[j].USERTAN!=undefined){
                    if(fields[j].USERTAN.IMAGE!=undefined){
                        this.setImageName(fields[j].USERTAN.IMAGE["-name"]);
                    };
                };
                if(fields[j].PICTURETAN!=undefined){
                    this.setImageName(fields[j].PICTURETAN.IMAGE);
                };
            };
        };
        l = swfObjects.length;
        for(i=0;i<l;i++){
            if(swfObjects[i].NAME == "Pazzle.swf"){
                this.setImageName(swfObjects[i].SETTINGS.PAZZLE.FILENAME);
            };
	        if(swfObjects[i].NAME == "ListingImage.swf"){
		        var listingFileNames = swfObjects[i].SETTINGS.LISTINGIMAGES.NAMESPACE.FILENAME;
		        for (var indexList in listingFileNames) {
			        this.setImageName(listingFileNames[indexList]['#text']);
		        };
	        };
        };
	    l = positioningFields.length;
	    for(i=0;i<l;i++){
		    if(positioningFields[i].FILENAME1!=undefined){
			    if(positioningFields[i].FILENAME1["-exists"]=='true'){
				    this.setImageName(positioningFields[i].FILENAME1["#text"]);
			    };
		    };
		    if(positioningFields[i].FILENAME2!=undefined){
			    if(positioningFields[i].FILENAME2["-exists"]=='true'){
				    this.setImageName(positioningFields[i].FILENAME2["#text"]);
			    };
		    };

		    if(positioningFields[i].FILENAME3!=undefined){
				this.setImageName(positioningFields[i].FILENAME3);
		    };
		    if(positioningFields[i].FILENAME6!=undefined){
			    if(positioningFields[i].FILENAME6["-exists"]=='true'){
				    this.setImageName(positioningFields[i].FILENAME6["#text"]);
			    };
		    };
	    };
	 //   console.log(this.imagesName);


    };
};

InteractiveTask.ImageLibrary.prototype.startLoading = function(){
    trace("start loading");
    var image = new Image();
    var self = this;
    image.onload = function(){
        self.loadLabelComplate(this);
    };
    trace(InteractiveTask.CONST.PRELOADER_IMAGE);
    try{
        //image.src = "http://kidnet.ru/sites/default/files/TaskPlayer/Images/load.png";
        image.src = InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.PRELOADER_IMAGE;
    }catch(error){
        console.log("Load mark error = ", error);
        image.src = InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.MARK_IMAGE;
    };
};
InteractiveTask.ImageLibrary.prototype.loadLabelComplate = function(image){
    trace("label loading complate");
    this.layer = new Kinetic.Layer();
    this.loadingLabel = new Kinetic.Sprite({
        x : (parseFloat(this.xml.WIDTH)-100)/2,
        y : (parseFloat(this.xml.HEIGHT)-100)/2,
        image : image,
        animation : 'standing',
        animations : {
            standing: [
                0, 0, 64, 64,
                64, 0, 64, 64,
                128, 0, 64, 64,
                192, 0, 64, 64,
                256, 0, 64, 64,
                320, 0, 64, 64,
                384, 0, 64, 64,
                448, 0, 64, 64,
            ]
        },
        frameRate :10,
        frameIndex : 0
    });
    //console.log(image);
    //console.log(this.loadingLabel);

    this.layer.add(this.loadingLabel);
    InteractiveTask.STAGE.add(this.layer);
    this.layer.draw();
    this.loadingLabel.start();

    this.currentIndex = -1;
    this.buttons = new Array();
    this.loadButtons();
};

InteractiveTask.ImageLibrary.prototype.loadButtons = function(){
    ++this.currentIndex;
    if(this.currentIndex == InteractiveTask.CONST.BUTTONS.length){
        this.currentIndex = -1;
        this.loadIteration();
        return;
    };
    var image = new Image();
    var self = this;
    image.onload = function(){
        self.buttonLoadComplate(this);
    };
    //trace(InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.BUTTONS[this.currentIndex]);
    image.src = InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.BUTTONS[this.currentIndex];

   // image.src = this.path + this.imagesName[this.currentIndex];
};
InteractiveTask.ImageLibrary.prototype.buttonLoadComplate = function(image){
    //console.log("load");
    this.buttons.push(image);
    this.loadButtons();
};

InteractiveTask.ImageLibrary.prototype.loadIteration = function(){
    ++this.currentIndex;
    if(this.currentIndex == this.imagesName.length){
        this.loadingLabel.stop();
        this.loadingLabel.remove();
        this.loadingLabel = null;
        this.layer.remove();
        this.layer = null;
        this.controller.libraryLoadComplate();
        return;
    };
    var image = new Image();
    var self = this;
    image.onload = function(){
        self.sampleLoadComplate(this);
    };
    image.src = this.path + this.imagesName[this.currentIndex];
};
InteractiveTask.ImageLibrary.prototype.sampleLoadComplate = function(image){
    //console.log("load");
    this.images.push({
        name : this.imagesName[this.currentIndex],
        image : image
    });
    this.loadIteration();
};


InteractiveTask.ImageLibrary.prototype.setImageName = function(name){
    var i,l;
    l = this.imagesName.length;
    for(i=0;i<l;i++){
        if(name == this.imagesName[i]) return;
    };
    this.imagesName.push(name);
};
InteractiveTask.ImageLibrary.prototype.getImage = function(name){
    var i,l;
    l = this.images.length;
    for(i=0;i<l;i++){
        if(name == this.images[i].name){
            return this.images[i].image;
        };
    };
	return null;
};

InteractiveTask.ImageLibrary.prototype.printImages = function(){
    console.log("print images");
    for(var s in this.images){
        console.log(s, " : ", this.images[s]);
    };
};

InteractiveTask.ImageLibrary.prototype.getButton = function(type){
	if(type-1<this.buttons.length) {
		return this.buttons[type-1];
	};
   /* switch (type){
        case InteractiveTask.CONST.RESTART_BUTTON:
            return this.buttons[0];
        case InteractiveTask.CONST.DONT_KNOW_BUTTON:
            return this.buttons[1];
        case InteractiveTask.CONST.UNDERSTAND_BUTTON:
            return this.buttons[2];
        case InteractiveTask.CONST.COMPLATE_BUTTON:
            return this.buttons[3];
        case InteractiveTask.CONST.MARK_BUTTON:
            return this.buttons[4];
	    case InteractiveTask.CONST.POSITIONING_QUESTION:
		    return this.buttons[5];
	    case InteractiveTask.CONST.POSITIONING_FAIL:
		    return this.buttons[6];
	    case InteractiveTask.CONST.BAD_FRAME:
		    return this.buttons[7];
	    case InteractiveTask.CONST.GOOD_FRAME:
		    return this.buttons[8];
    }   */
    return new Image();
};
InteractiveTask.ImageLibrary.prototype.clear = function(){
	while(this.images.length>0){
		this.images[0].name = null;
		this.images[0].image = null;
		this.images.shift();
	};
};




