function TextArea(o, stage){
	var s = this;
	this._text = '';
	this._x = o.x || 0; //положение на экране по х
	this._y = o.y || 0; //положение на экране по у
	this._width = o.width || 200; //ширина поля
	this._height = o.height || 100; //высота поля
	this._curPos = 0; //положение курсора
	this._fontSize = o.fontSize || 20; //размер шрифта
	this._fontFamily = 'Courier New'; //шрифт
	this._sign = -1;
	this._stage = stage;
	this._indentX = 3; //отступ текста по х
	this._indentY = 1; //отступ текста по у
	this._fillColor = '#eeeeee'; //цвет заливки поля
	this._startOfVisibleText = 0; //номер знака с которого начинается отображение текста
	this._lines = ~~(this._height / this._fontSize); //количество строк, которые помещаются в рамки поля
	
	this._group = new Kinetic.Group(); //группа элементов
	
	this._rect = new Kinetic.Rect({ //рамка поля ввода
		x: this._x,
		y: this._y,
		width: this._width,
		height: this._height,
		stroke: '#888888',
		fill: this._fillColor,
		strokeWidth: 1
	});
	
	this._cursorRect = new Kinetic.Rect({ // курсор
		x: this._x + this._indentX,
		y: this._y + this._indentY,
		width: 1,
		height: this._fontSize,
		fill: this._fillColor
	});
	
	this._textElement = new Kinetic.Text({ //текст
		x: this._x + this._indentX,
		y: this._y + this._indentY,
		text: this._text,
		fontSize: this._fontSize,
		fontFamily: this._fontFamily,
		fill: 'black',
		width: this._width - this._indentX,
		height: this._height
	});
	
	this._aText = new Kinetic.Text({ //дополнительный текст для замера ширины / высоты текста
		fontSize: this._fontSize,
		fontFamily: this._fontFamily
	});
	
	window.addEventListener('mouseup', function(evt){ // событие щелчка мыши
        var x = evt.clientX;
        var y = evt.clientY;
		s._isActive = (s._x < x && (s._x + s._width) > x) && (s._y < y && (s._y + s._height) > y); // если курсор внутри поля - активируем его
		if(s._isActive){
			s._calculatePosition(x - s._x - s._indentX, s._fontSize * ~~((y - s._y - s._indentY) / s._fontSize)); // установка курсора в место щелчка
			console.log(s._text.substring(0, s._startOfVisibleText) + '[' + s._text.substring(s._startOfVisibleText, s._curPos) + '|' + s._text.substring(s._curPos));
			console.log(s._curPos + '/' + s._text.length);
		}
    });
	
	window.addEventListener('keypress', function(evt){ //событие нажатия символьных клавиш
		if(s._isActive && evt.which != 13){ //если активно, то вставить символ
			var charCode = String.fromCharCode(evt.which); //получаем символ
			s._insert(charCode); //вставляем символ в текст
			s._redraw(); //перерисовываем поле ввода
        }
    });
	
	window.addEventListener('keydown', function(evt){ //событие нажатия несимвольных клавиш
		if(!s._isActive) return;
		else if(evt.keyCode == 8) s._backspace(); 	//Backspace
		else if(evt.keyCode == 37) s._left(); 		//Left arrow
		else if(evt.keyCode == 39) s._right(); 		//Right arrow
		else if(evt.keyCode == 46) s._delete(); 	//Delete
		else if(evt.keyCode == 13) s._enter(); 		//Enter
		else if(evt.keyCode == 38) s._up(); 		//Up arrow
		else if(evt.keyCode == 40) s._down(); 		//Down arrow
		s._redraw();
	});
	
	window.addEventListener('keyup', function(evt){
		if(s._isActive){
			console.log(s._text.substring(0, s._startOfVisibleText) + '[' + s._text.substring(s._startOfVisibleText, s._curPos) + '|' + s._text.substring(s._curPos));
			console.log(s._curPos + '/' + s._text.length);
		}
	});
	
	var cursorAnimation = new Kinetic.Animation(function(frame){ //анимация курсора
		if(s._isActive)
			if((Math.sin(frame.time/180) < 0 && s._sign == 1) || (Math.sin(frame.time/180) > 0 && s._sign == -1)){
				s._cursorRect.fill(s._sign == 1 ? 'black' : s._fillColor);
				s._sign *= -1;
			}
    }, this._group);

    cursorAnimation.start();
	
	this._group.add(this._rect);
	this._group.add(this._cursorRect);
	this._group.add(this._textElement);
};	

TextArea.prototype._afterChange = function(){
	if(this._curPos + 1 == this._text.length) //если курсор стоит на последнем символе
		this._textElement.text(this._getPreparedTextToCursor());//установка подходящего по высоте текста
	else if(this._getTextHeight(this._text.substring(this._startOfVisibleText, this._curPos)) == this._fontSize) //если курсор стоит на первой видимой строке
		this._textElement.text(this._text.substring(this._startOfVisibleText, this._getEndOfVisibleText()));
	else if(this._height < this._cursorRect.y() + 2 * this._fontSize) // если курсор стоит на последней видимой строке
		this._textElement.text(this._getPreparedTextToCursor());
	else
		this._textElement.text(this._text.substring(this._startOfVisibleText, this._getEndOfVisibleText()));
};

TextArea.prototype._insert = function(sm){ //функция вставки символа
	this._text = this._text.substring(0, this._curPos) + sm + this._text.substring(this._curPos); //вставка символа на место курсора
	this._afterChange();
	this._moveCursorToRigth(); //сдвиг курсора вправо
};

TextArea.prototype._delete = function(){ //функция удаления символа клавишей Del
	this._text = this._text.substring(0, this._curPos) + this._text.substring(this._curPos + 1);
	this._afterChange();
	this._moveCursorToCurrentPosition();
};

TextArea.prototype._backspace = function(){ //функция удаления символа клавишей Backspace
	this._text = this._text.substring(0, this._curPos - 1) + this._text.substring(this._curPos);
	this._afterChange();
	this._moveCursorToLeft(); //сдвиг курсора влево
};

TextArea.prototype._right = function(){ //функция вызываемая при нажатии клавиши влево
	if(this._curPos < this._text.length) //если курсор не на последнем месте
		this._curPos++;
	if(this._textIsHigher(this._text.substring(this._startOfVisibleText, this._curPos))) //если курсор находится на последнем месте в видимом тексте
		this._textElement.text(this._getPreparedTextToCursor());
	this._moveCursorToCurrentPosition();
};

TextArea.prototype._left = function(){ //функция вызываемая при нажатии клавиши вправо
	if(this._startOfVisibleText == this._curPos) //если курсор находится на первом месте в видимом тексте и требуется опустить текст на строку вниз
		this._textElement.text(this._getPreparedTextFromCursor());
	this._moveCursorToLeft();
	
};

TextArea.prototype._up = function(){ //функция вызываемая при нажатии клавиши вверх
	var x = this._cursorRect.x() - this._x; 				//текущие координаты
	var y = this._cursorRect.y() - this._y - this._indentY; //курсора
	if(y == 0){ //если курсору нельзя двигаться выше
		if(this._startOfVisibleText != 0){ //и отображается текст не с самого начала
			this._curPos = this._startOfVisibleText; //курсор перемещается на предыдущую строку
			this._textElement.text(this._getPreparedTextFromCursor()); //устанавливается новый текст
			this._calculatePosition(x, y); //высчитывается новая позиция курсора
		}
	}
	else{
		y -= this._fontSize;
		if(y == 0 && x == this._indentX){
			this._curPos = this._startOfVisibleText;
			this._moveCursorToCurrentPosition();
		}
		else
			this._calculatePosition(x, y);
	}
	
};

TextArea.prototype._down = function(){ //функция вызываемая при нажатии клавиши вниз
	var x = this._cursorRect.x() - this._x;					//координаты курсора
	var y = this._cursorRect.y() - this._y - this._indentY;
	if(this._cursorRect.y() + 2 * this._fontSize > this._y + this._height && this._textIsHigher(this._text.substring(this._startOfVisibleText, this._text.length))){ //если курсору нельзя двигаться вниз
		for(var i = this._startOfVisibleText; i < this._text.length; i++)//расчет символа с которого начинается новая строка
			if(this._getTextHeight(this._text.substring(this._startOfVisibleText, i + 1)) > this._fontSize)
				break;
		this._startOfVisibleText = this._charAt(i) == '\n' ? i + 1 : i;
		this._calculatePosition(x, y);
		this._textElement.text(this._text.substring(this._startOfVisibleText, this._getEndOfVisibleText())); //установка подходящего текста
		this._moveCursorToCurrentPosition(); //пересчет координат курсора
	}
	else{
		y += this._fontSize;
	}
	this._calculatePosition(x, y);
};

TextArea.prototype._enter = function(){ //вставка перехода на новую строку
	this._insert('\n');
};

TextArea.prototype._setPreparedText = function(){ //функция установки текста вмещающегося в поле
	if(this._textIsHigher(this._text)) //выше ли текст чем поле
		this._textElement.text(this._getPreparedText()); //установить текст по размеру поля
	else{
		this._textElement.text(this._text); //иначе установить весь текст
		this._startOfVisibleText = 0;
	}
};

TextArea.prototype._getPreparedTextFromCursor = function(){ //функция возвращающая текст, начинающийся с курсора, и который поместится в поле
	return this._getPreparedTextFrom(this._curPos);
};

TextArea.prototype._getEndOfVisibleText = function(){ //функция возвращает номер символа, на котором закончится видимый текст
	for(i = this._startOfVisibleText; i < this._text.length; i++)
		if(this._charAt(i) != '\n')
			if(this._getTextHeight(this._text.substring(this._startOfVisibleText, i + 1)) > this._height)
				break;
	return i;
};

TextArea.prototype._getPreparedTextFrom = function(pos){
	if(this._charAt(pos - 1) == '\n')
		pos--;
	var textHeight = this._getTextHeight(this._text.substring(0, pos));
	for(var i = pos - 1; i >= 0; i--)//поиск начала строки
		if(this._getTextHeight(this._text.substring(0, i)) < textHeight || this._charAt(i - 1) == '\n')
			break;
	this._startOfVisibleText = i == -1 ? 0 : i;
	return this._text.substring(this._startOfVisibleText, this._getEndOfVisibleText());
};

TextArea.prototype._getPreparedTextToCursor = function(){ //функция возвращающая текст, который закончится на курсоре, и который поместится в поле
	if(!this._textIsHigher(this._text)){
		this._startOfVisibleText = 0;
		return this._text;
	}
	for(var i = 0, s = 0; i < this._text.length; i++){
		if(this._getTextHeight(this._text.substring(s, i + 1) + 'W') > this._fontSize || this._charAt(i) == '\n'){
			s = i + 1;
			if(!this._textIsHigher(this._text.substring(s, this._curPos + 1)))
				break;
		}
	}
	this._startOfVisibleText = s;
	return this._text.substring(s, this._getEndOfVisibleText());
};

TextArea.prototype._getPreparedText = function(){ //возвращает последние n знаков, которые подходят по высоте
	var curHeight = this._getTextHeight(this._text), temp;
	for(var i = this._text.length - 1; i >= 0; i--)
		if(curHeight > this._getTextHeight(this._text.substring(0, i))){
			for(var j = i; j >= 0; j--)
				if(this._textIsHigher(this._text.substring(j - 1, i) + '\n'))
					break;
			break;
		}
	this._startOfVisibleText = j;
	temp = this._text.substring(j, this._getEndOfVisibleText());
	return temp;
};

TextArea.prototype._moveCursorToRigth = function(){ //сдвиг курсора вправо
	if(this._curPos < this._text.length){ //если курсор не на последнем месте
		this._curPos++;
		this._moveCursorToCurrentPosition();
	}
};

TextArea.prototype._moveCursorToLeft = function(){ //сдвиг курсора влево
	if(this._curPos > 0){ //если курсор не на первом месте
		this._curPos--;
		this._moveCursorToCurrentPosition();
	}
};

TextArea.prototype._moveCursorToCurrentPosition = function(){ //функция устанавливает нужные координаты курсору
	var localPos = this._curPos - this._startOfVisibleText; //положение курсора относительно начала видимого текста
	var text = this._textElement.text();	//получение видимого текста
	var cText = text;
	var curHeight = this._getTextHeight(text);
	var y = this._y + this._getTextHeight(text.substring(0, localPos)) - this._fontSize + this._indentY;
	
	if(localPos == 0){
		this._cursorRect.x(this._x + this._indentX);
		this._cursorRect.y(this._y + this._indentY);
		return;
	}
	
	if(this._curPos != this._text.length && localPos == text.length){
		this._curPos++;
		this._textElement.text(this._getPreparedTextToCursor());
		this._curPos--;
		localPos = this._curPos - this._startOfVisibleText;
		text = this._textElement.text(); 
		curHeight = this._getTextHeight(text);
		y = this._y + this._getTextHeight(text.substring(0, localPos + 1)) - this._fontSize + this._indentY;
	}
	
	if(this._charAt(this._curPos - 1) == '\n' && this._curPos != this._text.length){
		this._cursorRect.x(this._x + this._indentX);
		if(this._text.substring(this._curPos - 1, this._curPos + 1) == '\n\n')
			this._cursorRect.y(y);// - this._fontSize);
		else
			this._cursorRect.y(y);
		return;
	}
	
	text = this._getTextWithoutSpaces(text);
	
	for(var i = text.length - 1; i >= 0; i--){
		var textHeight = this._getTextHeight(text.substring(0, i + 1));
		for(var j = i, e = i; j >= 0; j--){
			if(text.charAt(e) == '\n'){
				var s = e;
				break;
			}
			else if(this._getTextHeight(text.substring(0, j)) < textHeight){
				var s = j;
				i = text.charAt(s - 1) == '\n' ? s - 1 : s;
				break;
			}
			else if(text.charAt(j - 1) == '\n' && text.charAt(j - 2) != '\n'){
				var s = j;
				i = text.charAt(s - 1) == '\n' ? s - 1 : s;
				break;
			}
		}
		if(s == localPos){
			if(y + 2 * this._fontSize < this._height + this._y + this._indentY)
				y += this._fontSize;
			break;
		}
		else if(s <= localPos - 1 && localPos - 1 <= e && (text.charAt(localPos - 1) != '\n'))
			break;
		else if(localPos == text.length)
			break;
		else if(s == e && s == localPos - 1)
			break;
	}
	s = i == -1 ? 0 : s; 
	this._cursorRect.x(this._x + this._indentX + this._getTextWidth(cText.substring(s, localPos)));
	this._cursorRect.y(y);
	if(text.charAt(s - 1) == '\n' && s == localPos && text.charAt(s - 2) != ' ' && text.charAt(s - 2) != '\n')
		this._cursorRect.y(this._cursorRect.y() + this._fontSize);
};

TextArea.prototype._getTextWithoutSpaces = function(text){ //возвращает текст без пробелов, на которых оканчивается строка
	for(var i = 0; i < text.length; i++){
		if(text.charAt(i) == ' ' && text.charAt(i + 1) != ' ' && text.charAt(i + 1) != '\n'){
			var sP = i;
			var textHeight = this._getTextHeight(text.substring(0, i + 1));
			for(var j = i + 1; j < text.length; j++){
				if(text.charAt(j) != '\n')
					break;
				else if(this._getTextHeight(text.substring(0, j + 1)) > textHeight){
					text = text.substring(0, sP) + '\n' + text.substring(sP + 1);
					i = sP;
					break;
				}
			}
		}
	}
	return text;
};

TextArea.prototype._calculatePosition = function(x, y){ //расчет положения курсора
	var cText = this._text;
	this._text = this._getTextWithoutSpaces(this._text);
	for(var i = this._startOfVisibleText; i < this._text.length; i++){
		if(this._getTextHeight(this._text.substring(this._startOfVisibleText, i + 1)) > y){
			var s = this._charAt(i) == '\n' ? i + 1 : i; //номер символа, с которого начинается строка
			var e;
			for(var j = s; j < this._text.length; j++)
				if(this._getTextHeight(this._text.substring(s, j + 1)) > this._fontSize)
					break;
			e = j - 1; //номер символа, которым кончается строка
			var line = this._text.substring(s, e + 1);
			var m = 0;
			if(this._charAt(e + 1) == '\n' && cText.charAt(e + 1) != '\n'){
				line += ' ';
				m++;
			}
			if(this._getTextWidth(line) < x){
				this._text = cText;
				this._cursorRect.x(this._x + this._indentX + this._getTextWidth(line));
				this._curPos = e + 1 + m;
			}
			else
				for(var k = 0; k < line.length; k++){
					if(this._getTextWidth(line.substring(0, k + 1)) >= x){
						this._curPos = s + k;
						this._text = cText;
						this._cursorRect.x(this._x + this._indentX + this._getTextWidth(line.substring(0, k)));
						break;
					}
				}
			var sY = y + this._y + this._indentY;
			if(sY < this._y + this._height - this._fontSize && sY > this._x)
				this._cursorRect.y(sY);
			break;
		}
	}
	this._text = cText;
};

TextArea.prototype._charAt = function(pos){//возвращает символ на переданной позиции
	return this._text.charAt(pos);
};

TextArea.prototype._textIsWider = function(text){ //является ли текст более широким чем поле
	return this._getTextWidth(text) > this._width;
};

TextArea.prototype._textIsHigher = function(text){ //является ли текст более высоким чем поле
	return this._getTextHeight(text) > this._height;
};

TextArea.prototype._getTextWidth = function(text){ //функция возвращает ширину введенного текста
	this._aText.width('auto');
	this._aText.text(text);
	return this._aText.width();
};

TextArea.prototype._getTextHeight = function(text){ //функция возвращает высоту переданного текста
	this._aText.width(this._width - this._indentX);
	this._aText.text(text);
	return this._aText.height();
};

TextArea.prototype._redraw = function(){ //перерисовка
	this._stage.draw();
};

TextArea.prototype.get = function(){ //возвращает группу элементов
	return this._group;
};

TextArea.prototype.getText = function(){ //возвращает текст введенный в поле
	return this._text;
};

TextArea.prototype.setText = function(text){ //устанавливает переданный текст в поле
	this._text = text;
	this._curPos = text.length;
	this._setPreparedText();
	this._moveCursorToCurrentPosition();
};

TextArea.prototype.isActive = function(active){ //устанавливает активность поля
	this._isActive = active;
};