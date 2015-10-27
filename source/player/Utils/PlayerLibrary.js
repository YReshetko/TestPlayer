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
	this.audioLib = new Object();
};
InteractiveTask.ImageLibrary.prototype.findImages = function(){
    var task = InteractiveTask.getArrayObjectsByTag(this.xml, "TASK");
    var userTans, imageTans, shiftFields, swfObjects, fields, groupFields, groupUserTan, groupPictureTan, positioningFields;
    var i, j,l;
    var taskIndex, taskLength;
    taskLength = task.length;
    for(taskIndex=0;taskIndex<taskLength;taskIndex++){
        //InteractiveTask.log(task[taskIndex]);
        userTans = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "USERTAN");
        imageTans = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "PICTURETAN");
        shiftFields = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "SHIFTFIELD");
        swfObjects = InteractiveTask.getArrayObjectsByTag(task[taskIndex].OBJECTS, "SWFOBJECT");
        //InteractiveTask.log(imageTans);
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
	 //   InteractiveTask.log(this.imagesName);


    };
	this.findAudio(task);
};
InteractiveTask.ImageLibrary.prototype.findAudio = function(task){
	var i,l;
	l = task.length;
	for(i=0;i<l;i++){
	   	if(task[i]["AUDIO"]){
		    this._setNewAudio(this._getAudioName(task[i], "STARTAUDIO"));
		    this._setNewAudio(this._getAudioName(task[i], "FAILAUDIO"));
		    this._setNewAudio(this._getAudioName(task[i], "SUCCESSAUDIO"));
	    };
	};
	//this.loadAudio();
	/*for(var node in this.audioLib){
		InteractiveTask.log("[Player library] - has audio["+node+"]");
	};*/
};
InteractiveTask.ImageLibrary.prototype._setNewAudio = function(name){
  	if(name == "") return;
	this.setAudio(name, new Audio(InteractiveTask.PATH+"audio/"+name+".wav"));
};
InteractiveTask.ImageLibrary.prototype._getAudioName = function(task, part){
	var name = "";
	if(task["AUDIO"][part]){
		if(task["AUDIO"][part]["-isRun"]=="true"){
			if(task["AUDIO"][part]["#cdata-section"]!=undefined){
				if(task["AUDIO"][part]["#cdata-section"]!=""){
					if(task["AUDIO"][part]["#cdata-section"].indexOf(" ")==-1){
						name = task["AUDIO"][part]["#cdata-section"];
					}else{
						name = task["AUDIO"][part]["-id"];
					};
				}else{
					name = task["AUDIO"][part]["-id"];
				};
			}else{
				name = task["AUDIO"][part]["-id"];
			};
		};
	};
	return name;
};

InteractiveTask.ImageLibrary.prototype.startLoading = function(){
    //trace("start loading");
    var image = new Image();
    var self = this;
    image.onload = function(){
        self.loadLabelComplate(this);
    };
    //trace(InteractiveTask.CONST.PRELOADER_IMAGE);
    try{
        //image.src = "http://kidnet.ru/sites/default/files/TaskPlayer/Images/load.png";
        image.src = InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.PRELOADER_IMAGE;
    }catch(error){
        InteractiveTask.log("Load mark error = ", error);
        image.src = InteractiveTask.CONST.STANDARD_IMAGES_PATH + InteractiveTask.CONST.MARK_IMAGE;
    };
};
InteractiveTask.ImageLibrary.prototype.loadLabelComplate = function(image){
    //trace("label loading complate");
    this.layer = InteractiveTask.COMPONENTS_LAYER;
    this.loadingLabel = new Konva.Sprite({
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
    //InteractiveTask.log(image);
    //InteractiveTask.log(this.loadingLabel);

    this.layer.add(this.loadingLabel);
    this.layer.draw();
	this.controller.resizePlayer();
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
    //InteractiveTask.log("load");
    this.buttons.push(image);
    this.loadButtons();
};

InteractiveTask.ImageLibrary.prototype.loadIteration = function(){
    ++this.currentIndex;
    if(this.currentIndex == this.imagesName.length){

        //this.controller.libraryLoadComplate();
	    this.dispatchComplate();
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
    //InteractiveTask.log("load");
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

InteractiveTask.ImageLibrary.prototype.dispatchComplate = function(){
	if(!this.hasAudio()){
		this.loadingLabel.stop();
		this.loadingLabel.remove();
		this.loadingLabel = null;
		this.layer.clear();
		this.layer.destroyChildren();

		this.layer = null;
		this.controller.libraryLoadComplate();
		return;
	};
	if(this.isAudioLoaded()){
		this.loadingLabel.stop();
		this.loadingLabel.remove();
		this.loadingLabel = null;
		this.layer.clear();
		this.layer.destroyChildren();

		this.layer = null;
		this.controller.libraryLoadComplate();
	}else{
		var self = this;
		setTimeout(function(){self.dispatchComplate()}, 1000);
	};
};

InteractiveTask.ImageLibrary.prototype.printImages = function(){
    //InteractiveTask.log("print images");
    for(var s in this.images){
        InteractiveTask.log(s, " : ", this.images[s]);
    };
};

InteractiveTask.ImageLibrary.prototype.getButton = function(type){
	if(type-1<this.buttons.length) {
		return this.buttons[type-1];
	};
    return new Image();
};
InteractiveTask.ImageLibrary.prototype.setAudio = function(name, audio){
  	if(!this.audioLib[name]){
	    this.audioLib[name] = new Object();
	    this.audioLib[name]["audio"] = audio;
	    this.audioLib[name]["isLoaded"] = false;
	    this.audioLib[name]["name"] = name;
    };
};
InteractiveTask.ImageLibrary.prototype.getAudio = function(name){
	if(!this.audioLib[name]){
		return null;
	};
	if(!this.audioLib[name]["isLoaded"]){
		return null;
	};
	return this.audioLib[name]["audio"];
};
InteractiveTask.ImageLibrary.prototype.loadAudio = function(){
	for(var node in this.audioLib){
		this.audioLib[node]["audio"].addEventListener('loadeddata', function(event){
			InteractiveTask.log("[Player library] - Audio load, name = " + event.target.parent["name"]);
			event.target.parent["isLoaded"] = true;
			event.target.parent = null;
		}, false);
		this.audioLib[node]["audio"].parent = this.audioLib[node];
		this.audioLib[node]["audio"].load();
	};
};
InteractiveTask.ImageLibrary.prototype.hasAudio = function(){
	for(var node in this.audioLib){
		return true;
	};
	return false;
};
InteractiveTask.ImageLibrary.prototype.isAudioLoaded = function(){
	for(var node in this.audioLib){
		if(!this.audioLib[node]["isLoaded"]){
			return false;
		};
	};
	return true;
};



InteractiveTask.ImageLibrary.prototype.clear = function(){
	while(this.images.length>0){
		this.images[0].name = null;
		this.images[0].image = null;
		this.images.shift();
	};
	for(var node in this.audioLib){
		InteractiveTask.disposeObject(this.audioLib[node]);
	};
	InteractiveTask.disposeObject(this.audioLib);
	this.audioLib = null;
};




