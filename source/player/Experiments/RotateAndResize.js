/**
 * Created with IntelliJ IDEA.
 * User: Yurchik
 * Date: 28.08.15
 * Time: 7:48
 * To change this template use File | Settings | File Templates.
 */
var stage;
var ID;
var width = 800;
var height = 600;

var dorderSize = 20;

var rect;
var border;
var group;
var layer;
function initExample(id){
	ID = id;
	stage = new Kinetic.Stage({
	   container : ID,
	   width: width,
	   height: height
	});

	rect = new Kinetic.Rect({
		fill:"#00FF00",
		stroke: "#000000",
		strokeWidth:1,
		x:0,
		y:0,
		width:300,
		height:200,
		draggable : false,
	});
	border = new Kinetic.Rect({
		stroke: "rgba(0, 0, 0, 0.2)",
		strokeWidth:dorderSize,
		x:dorderSize/2,
		y:dorderSize/2,
		width:300-dorderSize,
		height:200-dorderSize,
		draggable : false,
	});


	group = new Kinetic.Group();
	group.add(rect);
	group.add(border);

	group.x(200);
	group.y(200);

	group.draggable(true);


	layer = new Kinetic.Layer();

	layer.add(group);
	stage.add(layer);

	layer.batchDraw();


	border.on("mousedown touchstart", function(event){
		group.draggable(false);
		this.on("mouseout mouseup touchend", function(event){
			group.draggable(true);
		});
		// Реальная позиция курсора на сцене (меняется в зависимости от масштабирования)
		//  Не меняется в зависимости от скроллирования
		/*console.log("offsetX = " + event.evt["offsetX"]);
		console.log("offsetY = " + event.evt["offsetY"]);     */

		// Реальная позиция курсора на сцене (меняется в зависимости от масштабирования)
		//  Не меняется в зависимости от скроллирования
		/*console.log("layerX = " + event.evt["layerX"]);
		console.log("layerY = " + event.evt["layerY"]); */

		//  Позиция клика на всей странице (меняется при скроллировании)
		//  Отсчет от верхнего левого угла
		/*console.log("X = " + event.evt["x"]);
		console.log("Y = " + event.evt["y"]);   */

		//  Позиция клика на всей странице (меняется при скроллировании)
		//  Отсчет от верхнего левого угла
		/*console.log("pageX = " + event.evt["pageX"]);
		console.log("pageY = " + event.evt["pageY"]); */

		/*console.log("this.width = " + this.width());
		console.log("this.height = " + this.height());

		console.log("this.x = " + this.x());
		console.log("this.y = " + this.y());

		console.log("=============================================");           */


		console.log(group.getAbsolutePosition());
		console.log(group.getAbsoluteTransform());
		/*for(var e in event.evt){
			console.log("target -> " + e + ", object -> " + event.evt[e]);
		}   */
	});
}

window.onresize = function(){
	var contWidth = $("#"+ID).width();
	var contHeight = $("#"+ID).height();
	var scaleX, scaleY, minScale;
	if(contWidth<width){
		scaleX = contWidth/width;
		scaleY = contHeight/height;
		minScale = (scaleX<scaleY)?scaleX:scaleY;
	}else{
		var minScale = 1;
	};
	stage.scaleX(minScale);
	stage.scaleY(minScale);
	stage.width(width*minScale);
	stage.height(height*minScale);
};