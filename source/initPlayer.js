/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 16.02.15
 * Time: 6:49
 * To change this template use File | Settings | File Templates.
 */
var player;
var contID;
var audioPath;
function initTaskPlayer(resourcePath, imagesPath, containerID, progressContainerID){
    //alert(resourcePath);
    //alert(canvasID);
    var path = resourcePath+"Position.xml";
	audioPath =  resourcePath+"audio/";
    contID = containerID;
    if (window.XMLHttpRequest)
    {
        // alert(true);
        xhttp=new XMLHttpRequest();
    }
    else
    {
        // alert(false);
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",path,false);
    xhttp.send();
    //console.log("return " + xhttp.readyState + "; status = " + xhttp.status);
    var XMLtree = new XML.ObjTree();
    //console.log(xhttp.responseText);
    var tree = XMLtree.parseXML(xhttp.responseText);
    //console.log(tree);
    if(tree.PACKAGE!='undefined'){
        tree.PACKAGE.RESOURCE = resourcePath;
        //try{
            player = new InteractiveTask.Player({
                xml : tree.PACKAGE,
                containerID : containerID,
	            progressContainerID : progressContainerID,
                imagesPath : imagesPath,
	            callBack : playerEventsHandler
            });
        /*}catch (error){
            alert("Catch error = "+error);
            return;
        }  */
    }else{
        alert("Package format is undefined");
        return;
    }
    //alert("Start task")
    //player.startTask();
    //alert("End.");
	//resizePlayer();
    //console.log("End...");


}

    $( document ).ready(function() {
        $(document).keydown(function(e) {
            player.setEvent({
                type:"keyboard",
                keyCode: e.keyCode
            })
        });
    });

function canvasCreateError(){
    alert("TODO: introduce FlashPlayer, if browser is old and canvas isn't supported [CALLBACK]");
}
function canvasCreateSuccess(){
    //alert("TODO: reaction on canvas creating");
    player.startTask();
	prepareFullScreenElement();
}
function taskIsComplate(answer){
    //alert("Task complate in main script " + answer);
    //trace(answer);
}



function trace(string){
    console.log(string);
}
function restart(){
	//var audio = new Audio(); // Создаём новый элемент Audio
	//audio.src = 'TestTask/track.mp3'; // Указываем путь к звуку "клика"
	//audio.autoplay = true; // Автоматически запускаем
    player.restart();
}
function dontKnow(){
   player.dontKnow();
}
function understand(){
   player.understand();
}
function playerEventsHandler(event, data){
  switch (event){
	  case InteractiveTask.EVENTS.INIT_PLAYER_ERROR:
		  canvasCreateError();
		  break;
	  case InteractiveTask.Events.prototype.INIT_PROGRESS_ERROR:
		  //alert("Init progress task error");
		  console.error("Init progress task error");
		  break;
	  case InteractiveTask.EVENTS.INIT_PLAYER_SUCCESS:
		  canvasCreateSuccess();
		  break;
	  case InteractiveTask.EVENTS.TASK_COMPLATE:
		  taskIsComplate(data);
		  break;
	  case InteractiveTask.EVENTS.TEST_START:
		  playAudio(data, false);
		  break;
	  case InteractiveTask.EVENTS.TEST_SUCCESS_COMPLATE:
	  case InteractiveTask.EVENTS.TEST_FAIL_COMPLATE:
		  playAudio(data, true);
		  break;
	  case InteractiveTask.EVENTS.MOUSE_OVER_OUT_BUTTON:
		  //console.log(data);
		  break;
	  case InteractiveTask.EVENTS.FULL_SCREEN_CHANGE:
		  onfullscreenchange(null);
		  break;
	  case InteractiveTask.EVENTS.CURRENT_TASK_COMPLATE:
		  currentResult();
		  break;
  }
}


var audio;
function playAudio(src, isDispatch){
	try{
		audio.pause();
	}catch(e){};
	//console.log("play audio");
	audio = new Audio(audioPath+src+".wav");
	var toDispatch = isDispatch;
	audio.loop = false;
	audio.addEventListener('ended', function() {
		if(toDispatch) player.startCurrentTask();
	}, false);
	audio.play();
}
/*Для DL*/
function currentResult(){

}


var element;

function prepareFullScreenElement(){
	element = document.getElementById(contID);
	element.addEventListener("webkitfullscreenchange", setFullScreenToPlayer);
	element.addEventListener("mozfullscreenchange",    setFullScreenToPlayer);
	element.addEventListener("fullscreenchange",       setFullScreenToPlayer);
}

function fullScreenPlayer(){
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.mozRequestFullscreen) {
		element.mozRequestFullScreen();
	}
}
// Выход из полноэкранного режима
function cancelFullscreen() {
    if(document.cancelFullScreen) {
     document.cancelFullScreen();
     } else if(document.mozCancelFullScreen) {
     document.mozCancelFullScreen();
     } else if(document.webkitCancelFullScreen) {
     document.webkitCancelFullScreen();
     }
}
function onfullscreenchange(e){
     var fullscreenElement =
     document.fullscreenElement ||
     document.mozFullscreenElement ||
     document.webkitFullscreenElement;
     var fullscreenEnabled =
     document.fullscreenEnabled ||
     document.mozFullscreenEnabled ||
     document.webkitFullscreenEnabled;
    // console.log( 'fullscreenEnabled = ' + fullscreenEnabled, ',  fullscreenElement = ', fullscreenElement, ',  e = ', e);
     if(fullscreenEnabled){
	     if(fullscreenElement){
		     cancelFullscreen();
	     }else{
		     fullScreenPlayer();
	     }
     }
}

function setFullScreenToPlayer(){
	player.changeFullScreen();
	player.resizePlayer();
}

function logDOMObject(){
	clear();
}

function clear(){
	player.clear();
	player = null;
}