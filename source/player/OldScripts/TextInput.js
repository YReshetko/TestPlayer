function TextInput(o, stage){
    var self = this;
    this._text = ''; //полный текст элемента
    this._curPos = 0; //текущая позиция курсора
	this._sText = 0; //номер символа, с которого начинается видимый текст
    this._isActive = false; //активно ли поле
	this._stage = stage;
	this._sign = -1;
	this._fill = '#eeeeee';
	this._fontFamily = 'Courier New';
	this._m = false; //больший ли текст чем поле
    
    this._x = o.x;
    this._y = o.y;
    this._width = o.width;
    this._height = o.height;
    
    this._group = new Kinetic.Group();
    
    this._rect = new Kinetic.Rect({
        x: this._x,
        y: this._y,
        width: this._width,
        height: this._height,
        stroke: '#888888',
        strokeWidth: 1,
		fill: this._fill
    });
    this._cursorRect = new Kinetic.Rect({ // курсор
		x: this._x + 3,
		y: this._y + 2,
		width: 1,
		height: this._height - 7,
		fill: this._fillColor,
		strokeWidth: 0
	});
    this._textElement = new Kinetic.Text({
        x: this._x + 3,
        y: this._y + 1,
        text: this._text,
        fontSize: this._height - 3,
        fontFamily: 'Courier New',
        fill: 'black',
		height: this._height
    });
	this._symbol = new Kinetic.Text({
		fontSize: this._height - 3,
		fontFamily: 'Courier New'
	});
    
    window.addEventListener('mousedown', function(evt){
        var x = evt.clientX;
        var y = evt.clientY;
		self._isActive = (self._x < x && (self._x + self._width) > x) && (self._y < y && (self._y + self._height) > y);
		if(self._isActive)
			self._calculatePosition(x);
		self._cursorRect.fill(self._fill);
		self._redraw();
    });

    window.addEventListener('keypress', function(evt){
		if(self._isActive){
			var charCode = String.fromCharCode(evt.which);
			self._formatText('input', charCode);
        }
    });

	window.addEventListener('keydown', function(evt){
		if(self._isActive){
			if(evt.keyCode === 8 && self._curPos != 0) //Backspace
				self._formatText('backspace', '');
			else if(evt.keyCode === 37) //Left arrow
				self._formatText('left', '');
			else if(evt.keyCode === 39) //Right arrow
				self._formatText('right', '');
			else if(evt.keyCode === 46 && self._curPos != self._text.length) //Delete
				self._formatText('delete', '');
		}
	});

    var cursorAnimation = new Kinetic.Animation(function(frame){
		if(self._isActive){
			var a = Math.sin(frame.time/180);
			if((a < 0 && self._sign === 1) || (a > 0 && self._sign === -1)){
				self._cursorRect.stroke(self._sign == 1 ? 'black' : '#eeeeee');
				self._sign *= -1;
			}
        }
    }, this._group);

    cursorAnimation.start();
    
	this._group.add(this._rect);
	this._group.add(this._cursorRect);
    this._group.add(this._textElement);
};

TextInput.prototype.get = function(){ //возвращает группу элементов
	return this._group;
}

TextInput.prototype._moveCursor = function(x1){ //перемещение курсора
	this._curPos += x1;
	this._cursorRect.x(this._x + 3 + this._getTextWidth(this._text.substring(this._sText, this._curPos)));
	this._redraw();
};

TextInput.prototype._getLocalCursorPosition = function(){ //возвращает положение курсора относительно видимого текста
	return this._curPos - this._sText;
}

TextInput.prototype._formatText = function(type, s){ //изменение и подгонка текста под поле
	if(!this._isActive)
		return;
	if(type === 'input'){ //ввод символа
		if(this._curPos == this._text.length)
			this._text += s;
		else
			this._text = this._text.substring(0, this._curPos) + s + this._text.substring(this._curPos);
		var tempText = '';
		if(this._getLocalCursorPosition() != this._textElement.text().length){
			for(var i = this._sText; i < this._text.length; i++){//расчет видимого текста
				tempText += this._text.charAt(i);
				if(this._getTextWidth(tempText) > this._width){
					this._m = true;
					tempText = tempText.substring(0, tempText.length - 1);
					break;
				}
			}
		}
		else{
			for(var i = this._text.length - 1; i >= 0; i--){
				tempText = this._text.charAt(i) + tempText;
				if(this._getTextWidth(tempText) > this._width){
					this._m = true;
					tempText = tempText.substring(1, tempText.length);
					break;
				}
				this._sText = i;
			}
		}
		this._textElement.text(tempText);
		this._moveCursor(1);
	}
	else if(type === 'backspace'){ //удаление
		var tempText = '';
		this._text = this._text.substring(0, this._curPos - 1) + this._text.substring(this._curPos);
		if(this._getLocalCursorPosition() === this._textElement.text().length){
			for(var i = this._curPos; i >= 0; i--){
				tempText = this._text.charAt(i) + tempText;
				if(this._getTextWidth(tempText) > this._width){
					tempText = tempText.substring(1, tempText.length);
					break;
				}
				this._sText = i;
			}
		}
		else if(this._getLocalCursorPosition() > 0){
			for(var i = this._sText; i < this._text.length; i++){
				tempText += this._text.charAt(i);
				if(this._getTextWidth(tempText) > this._width){
					tempText = tempText.substring(0, tempText.length - 1);
					break;
				}
			}
		}
		else{
			if(this._getTextWidth(this._text) < this._width){
				tempText = this._text;
				this._sText = 0;
			}
			else{
				tempText = this._textElement.text();
				this._sText--;
			}
		}
		this._textElement.text(tempText);
		this._moveCursor(-1);
	}
	else if(type === 'delete'){ //удаление
		this._text = this._text.substring(0, this._curPos) + this._text.substring(this._curPos + 1);
		this._textElement.text(this._text);
		this._m = this._width < this._textElement.width();
		if(this._m){
			var tempText = '';
			for(var i = this._sText; i < this._text.length; i++){
				tempText += this._text.charAt(i);
				if(this._getTextWidth(tempText) > this._width){
					tempText = tempText.substring(0, tempText.length - 1);
					break;
				}
			}
			this._textElement.text(tempText);
		}
		else
			this._sText = 0;
		this._moveCursor(0);
	}
	else if(type === 'left'){ //перемещение курсора влево
		var tempText = '';
		if(this._curPos > 0){
			if(this._m && this._getLocalCursorPosition() === 0){
				this._sText = this._curPos - 1;
				for(var i = this._sText; i < this._text.length; i++){
					tempText += this._text.charAt(i);
					if(this._getTextWidth(tempText) > this._width){
						tempText = tempText.substring(0, tempText.length - 1);
						break;
					}
				}
				this._textElement.text(tempText);
			}
			this._moveCursor(-1);
		}	
	}
	else if(type === 'right'){ //перемещение курсора вправо
		var tempText = '';
		if(this._curPos < this._text.length){
			if(this._m && this._getLocalCursorPosition() === this._textElement.text().length){
				for(var i = this._curPos; i >= 0; i--){
					tempText = this._text.charAt(i) + tempText;
					if(this._getTextWidth(tempText) > this._width){
						tempText = tempText.substring(1, tempText.length);
						break;
					}
				}
				this._textElement.text(tempText);
				this._sText = i + 1;
			}
			this._moveCursor(1);
		}	
	}
	this._redraw();
	console.log(this._sText + '   ' + this._curPos + '    ' + this._text.substring(0, this._curPos) + '|' + this._text.substring(this._curPos));
};

TextInput.prototype._redraw = function(){ //перерисовка
	this._stage.draw();
};

TextInput.prototype._getTextWidth = function(text){ //возвращает ширину переданного текста
	this._symbol.text(text);
	return this._symbol.width();
};

TextInput.prototype.getText = function(){ //возвращает текст
	return this._text;
};

TextInput.prototype.setText = function(text){ //установка переданного текста
	this._text = text;
	this._formatText('input', '');
	this._formatText('backspace', '');
};

TextInput.prototype._calculatePosition = function(x){ //функция вычисляет ближайшее к переданному параметру положение курсора
	for(var i = this._sText; i < this._text.length; i++)
		if(this._getTextWidth(this._text.substring(this._sText, i + 1)) > x)
			break;
	this._curPos = i == 0 ? 0 : i;
	this._moveCursor(0);
	console.log(this._curPos);
};