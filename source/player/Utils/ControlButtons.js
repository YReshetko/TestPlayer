/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 06.04.15
 * Time: 9:37
 * To change this template use File | Settings | File Templates.
 */
InteractiveTask.ButtonSystem = function(width, height, controller){
    this.width = width;
    this.height = height;
    this.controller = controller;
    this.restart = new InteractiveTask.OneButton({
        x : 0,
        y : 0,
	    width : InteractiveTask.CONST.RESTART_BUTTON_POSITION[2],
	    height : InteractiveTask.CONST.RESTART_BUTTON_POSITION[3],
        image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.RESTART_BUTTON),
        butPosition : InteractiveTask.CONST.RESTART_BUTTON_POSITION,
        layer : InteractiveTask.BUTTONS_LAYER,
        controller : this,
        runFuncName : InteractiveTask.CONST.RESTART_BUTTON,
	    hintText : InteractiveTask.CONST.RESTART_HINT_TEXT,
	    hintPD : InteractiveTask.CONST.RESTART_PD
    });
    this.dontknow = new InteractiveTask.OneButton({
        x : 0,
        y : 0,
	    width : InteractiveTask.CONST.DONT_KNOW_BUTTON_POSITION[2],
	    height : InteractiveTask.CONST.DONT_KNOW_BUTTON_POSITION[3],
        image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.DONT_KNOW_BUTTON),
        butPosition : InteractiveTask.CONST.DONT_KNOW_BUTTON_POSITION,
        layer : InteractiveTask.BUTTONS_LAYER,
        controller : this,
        runFuncName : InteractiveTask.CONST.DONT_KNOW_BUTTON,
	    hintText : InteractiveTask.CONST.DONT_KNOW_HINT_TEXT,
	    hintPD : InteractiveTask.CONST.DONT_KNOW_PD
    });
    this.understand = new InteractiveTask.OneButton({
        x : 0,
        y : 0,
	    width : InteractiveTask.CONST.UNDERSTAND_BUTTON_POSITION[2],
	    height : InteractiveTask.CONST.UNDERSTAND_BUTTON_POSITION[3],
        image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.UNDERSTAND_BUTTON),
        butPosition : InteractiveTask.CONST.UNDERSTAND_BUTTON_POSITION,
        layer : InteractiveTask.BUTTONS_LAYER,
        controller : this,
        runFuncName : InteractiveTask.CONST.UNDERSTAND_BUTTON,
	    hintText : InteractiveTask.CONST.UNDERSTAND_HINT_TEXT,
	    hintPD : InteractiveTask.CONST.UNDERSTAND_PD
    });
    this.complate = new InteractiveTask.OneButton({
        x : 0,
        y : 0,
	    width : InteractiveTask.CONST.CHECK_BUTTON_POSITION[2],
	    height : InteractiveTask.CONST.CHECK_BUTTON_POSITION[3],
        image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.COMPLATE_BUTTON),
        butPosition : InteractiveTask.CONST.CHECK_BUTTON_POSITION,
        layer : InteractiveTask.BUTTONS_LAYER,
        controller : this,
        runFuncName : InteractiveTask.CONST.COMPLATE_BUTTON,
	    hintText : InteractiveTask.CONST.COMPLATE_HINT_TEXT,
	    hintPD : InteractiveTask.CONST.COMPLATE_PD
    });

	this.sound = new InteractiveTask.OneButton({
		x : 0,
		y : 0,
		width : InteractiveTask.CONST.SOUND_BUTTON_POSITION[2],
		height : InteractiveTask.CONST.SOUND_BUTTON_POSITION[3],
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.SOUND_BUTTON),
		butPosition : InteractiveTask.CONST.SOUND_BUTTON_POSITION,
		layer : InteractiveTask.BUTTONS_LAYER,
		controller : this,
		runFuncName : InteractiveTask.CONST.SOUND_BUTTON,
		hintText : InteractiveTask.CONST.SOUND_HINT_TEXT,
		hintPD : InteractiveTask.CONST.SOUND_PD
	});

	this.fullscreen = new InteractiveTask.OneButton({
		x : 0,
		y : 0,
		width : InteractiveTask.CONST.FULLSCREEN_BUTTON_POSITION[2],
		height : InteractiveTask.CONST.FULLSCREEN_BUTTON_POSITION[3],
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.FULLSCREEN_BUTTON),
		butPosition : InteractiveTask.CONST.FULLSCREEN_BUTTON_POSITION,
		layer : InteractiveTask.BUTTONS_LAYER,
		controller : this,
		runFuncName : InteractiveTask.CONST.FULLSCREEN_BUTTON,
		hintText : InteractiveTask.CONST.FULLSCREEN_HINT_TEXT,
		hintPD : InteractiveTask.CONST.FULLSCREEN_PD
	});

	this.pause = new InteractiveTask.OneButton({
		x : 0,
		y : 0,
		width : InteractiveTask.CONST.PAUSE_BUTTON_POSITION[2],
		height : InteractiveTask.CONST.PAUSE_BUTTON_POSITION[3],
		image : InteractiveTask.LIBRARY.getButton(InteractiveTask.CONST.PAUSE_BUTTON),
		butPosition : InteractiveTask.CONST.PAUSE_BUTTON_POSITION,
		layer : InteractiveTask.BUTTONS_LAYER,
		controller : this,
		runFuncName : InteractiveTask.CONST.PAUSE_BUTTON,
		hintText : InteractiveTask.CONST.PAUSE_HINT_TEXT,
		hintPD : InteractiveTask.CONST.PAUSE_PD
	});

    this.buttons = new Array();
    this.buttons.push(this.restart);
    this.buttons.push(this.dontknow);
    this.buttons.push(this.understand);
    this.buttons.push(this.complate);
	this.buttons.push(this.sound);
	this.buttons.push(this.fullscreen);
	this.buttons.push(this.pause);
    this.complate.visible(false);
    this.sound.visible(false);
    this.pause.visible(false);
    this.replace();
};

InteractiveTask.ButtonSystem.prototype.replace = function(){
    var startX, startY;
    var deltaX;
    startX = this.width;
    var i,l;
    var num = 0;
    l = this.buttons.length;
	for(i=0;i<l;i++){
		if(this.buttons[i].isVisible){
			startY = this.height - this.buttons[i].height - InteractiveTask.CONST.DELTA_BOTTOM;
			startX = startX - this.buttons[i].width - InteractiveTask.CONST.DELTA_RIGHT;
			this.buttons[i].x(startX);
			this.buttons[i].y(startY);
		};
	};
	this.positionCompositeConst(this.sound, "SOUND");
	this.positionCompositeConst(this.fullscreen, "FULLSCREEN");
	this.positionCompositeConst(this.pause, "PAUSE");
};
InteractiveTask.ButtonSystem.prototype.positionCompositeConst = function(button, constName){
	this.buttonAditionalPositioning(button,
		InteractiveTask.CONST[constName+"_HORIZONTAL_ALIGN"],
		InteractiveTask.CONST[constName+"_VERTICAL_ALIGN"],
		InteractiveTask.CONST[constName+"_DELTA_X"],
		InteractiveTask.CONST[constName+"_DELTA_Y"]);
};
InteractiveTask.ButtonSystem.prototype.buttonAditionalPositioning = function(button, horizontal, vertical, deltaX, deltaY){
	if(button.isVisible){
		switch (horizontal){
			case "left":
				button.x(this.width - button.width - deltaX);
				break;
			case "right":
				button.x(deltaX);
				break;
			case "center":
				button.x((this.width - button.width)/2);
				break;
		};
		switch (vertical){
			case "bottom":
				button.y(this.height - button.height - deltaY);
				break;
			case "top":
				button.y(deltaY);
				break;
			case "center":
				button.y((this.height - button.height)/2);
				break;
		};
	};
};


InteractiveTask.ButtonSystem.prototype.runFunction = function(value){
    switch (value){
        case InteractiveTask.CONST.RESTART_BUTTON:
            this.controller.restart();
            break;
        case InteractiveTask.CONST.DONT_KNOW_BUTTON:
            this.controller.dontKnow();
            break;
        case InteractiveTask.CONST.UNDERSTAND_BUTTON:
            this.controller.understand();
            break;
	    case InteractiveTask.CONST.SOUND_BUTTON:
		    this.controller.repeatSound();
		    break;
	    case InteractiveTask.CONST.FULLSCREEN_BUTTON:
		    this.controller.fullscreenPress();
		    break;
	    case InteractiveTask.CONST.PAUSE_BUTTON:
		    this.controller.pause();
		    break;
    };
};
InteractiveTask.ButtonSystem.prototype.eventFunction = function(value, event){
	this.controller.buttonEvents(value, event)
};
InteractiveTask.ButtonSystem.prototype.clear = function(){
	for(button in this.buttons){
		butoon.visible(false);
	}
};



InteractiveTask.OneButton = function(options){
    this.button = new Konva.Sprite({
        x : options.x,
        y : options.y,
        image : options.image,
        animation : 'standing',
        animations : {
            standing: options.butPosition
        },
        frameRate :10,
        frameIndex : 0
    });
	this.width = options.width;
	this.height = options.height;
    //this.controller = options.controller;
    //this.runFunc = options.runFuncName;
    this.isVisible = true;
    this.layer = options.layer;

	//this.layer.canvas._canvas.classList.add(InteractiveTask.CONST.BUTTON_CLASS, options.butClass);
	//this.layer.canvas._canvas.styleSheets

	//this.layer.canvas._canvas.className = options.butClass;

    this.visible(true);

    this.button.layer = options.layer;
    this.button.runFunc = options.runFuncName;
    this.button.controller = options.controller;

	if(InteractiveTask.CONST.IS_ADD_HINT){

		var hint = new Konva.Label(InteractiveTask.CONST.LABEL_SETTINGS);

		var tagObject = new Object();
		for(var node in InteractiveTask.CONST.TAG_SETTINGS){
			tagObject[node] = InteractiveTask.CONST.TAG_SETTINGS[node];
		};

		tagObject["pointerDirection"] = options.hintPD;
		hint.add(new Konva.Tag(tagObject));

		hint.add(new Konva.Text(InteractiveTask.CONST.TEXT_SETTINGS));
		hint.getText().setText(options.hintText);

		options.layer.add(hint);
	};

    this.button.on("mouseover", function(evt){
        this.frameIndex(1);
	    if(hint){
		    var mousePos = this.getStage().getPointerPosition();
		    hint.position({
			    x : mousePos.x * 1/InteractiveTask.STAGE.scaleX(),
			    y : mousePos.y * 1/InteractiveTask.STAGE.scaleY(),
		    });
		    this.on("mousemove", function(event){
			    var mousePos = this.getStage().getPointerPosition();
			    hint.position({
				    x : mousePos.x * 1/InteractiveTask.STAGE.scaleX(),
				    y : mousePos.y * 1/InteractiveTask.STAGE.scaleY(),
			    });
		    });
		    hint.moveToTop();
		    hint.show();
	    };
        this.layer.batchDraw();
	    this.controller.eventFunction(this.runFunc, evt);
    });
    this.button.on("mouseout", function(evt){
        this.frameIndex(0);
	    if(hint){
		    this.off("mousemove");
		    hint.hide();
	    };
        this.layer.batchDraw();
	    this.controller.eventFunction(this.runFunc, evt);
    });
    this.button.on("mousedown touchstart", function(){
        this.frameIndex(2);
	    this.layer.batchDraw();
        this.controller.runFunction(this.runFunc);
    });
    this.button.on("mouseup touchend", function(){
        this.frameIndex(1);
	    this.layer.batchDraw();
    });

};

InteractiveTask.OneButton.prototype.x = function(value){
    this.button.x(value);
    this.layer.draw();
};
InteractiveTask.OneButton.prototype.y = function(value){
    this.button.y(value);
    this.layer.draw();
};
InteractiveTask.OneButton.prototype.visible = function(value){
    this.isVisible = value;
    (value)?this.layer.add(this.button):this.button.remove();
    this.layer.draw();
};