function createAllDocx(button){
	buttonGreen(button);
	var rows = allRow();
	_.each(rows, function(row){
		createDocx($(row), $(row).find(".createdocx"), null, function(){
			buttonRed(button);
		});
	});
}

function sendAllMarks(button){
	var rows = allRow();
	var allUserMarks = [];
	_.each(rows, function(row){
		var markData = rowAsData($(row));
		allUserMarks.push(markData);
	});

	var someZero = _.find(allUserMarks, function(e){
		console.log(e.mark);
		if(e.mark == 0 && e.absent == false){
			return true;
		}
		return false;
	});


	var sendSummaryAction =	function(){
		sendMarkSummary(allUserMarks, button, function(){
			_.each(rows, function(row){
				var markData = rowAsData($(row));
				sendMark(markData, $(row).find(".sendmark"));
				allUserMarks.push(markData);
			});
		});
	};

	if(someZero){
		if (confirm('0/20 it\'s a bit mean. Continue?')) {
			sendSummaryAction();
		} else {
			throw new Error("Something went badly wrong!");
		}
	}else{
		sendSummaryAction();
	}
}

function isAbsent(row) {
	return row.find(".absent").first().is(':checked');
}

function getRowId(row){
	var rowString = row.attr('id').replace("user_row_","");
	var rowId = parseInt(rowString);
	return rowId;
}

function rowAsData(row){
	var postData = {};
	postData["mark"] = getCurrentMark(row);
	postData["userIndex"] = getRowId(row);
	postData["absent"] = isAbsent(row);
	return postData;
}

function buttonGreen(button){
	button.removeClass("btn-danger btn-primary");
	button.addClass("btn-success");
}

function buttonRed(button){
	button.removeClass("btn-success btn-primary");
	button.addClass("btn-danger");
}

function createDocx(row, button, callbackFail){
	var marks = {};
	_.each(getSelect(row), function(select) {
		var name = $(select).attr("name");
		var score = parseInt($(select).val());
		marks[name] = score;
	});

	var postData = rowAsData(row);
	postData["marks"] = marks;
	postToURL('/createDocx', postData, button, null, callbackFail);
}

function sendMarkSummary(studentMarks, button, callbackSuccess, callbackFail){
	postToURL('/sendMarkSummary', studentMarks, button, callbackSuccess, callbackFail);
}

function sendMark(userMarkData, button){
	postToURL('/sendMark', userMarkData, button);
}

function postToURL(url, data, button, callbackSuccess, callbackFail){
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: url,
		success: function(data) {
			console.log(JSON.stringify(data));
			buttonGreen(button);
			if(callbackSuccess != null){
				callbackSuccess();
			}
		}, error: function (xhr, ajaxOptions, thrownError) {
			buttonRed(button);
			if(callbackFail != null){
				callbackFail();
			}
			var br = xhr.responseText.indexOf("<br>");
			var end = (br != -1) ? br : xhr.responseText.length;
			var msg = xhr.responseText.substring(0,end);
			msg += "\r\n\r\nCheck the console for more information";
			alert(msg);
			console.log(xhr.responseText);
			console.log(xhr.status);
			console.log(thrownError);
		}
	});
}

function matchRow(element){
	var classes = element.attr("class").split(" ");
	$.each(classes, function( index, value ){
    	if(value.startsWith("user_row_")){
    		row = $("#"+value);
    	}
	});
	return row;
}

function allRow(){
	return $("[id^=user_row_]");
}

function getCurrentMark(row){
	var allSelect = getSelect(row);
	var total = 0;
	allSelect.each(function(e) {
		total += parseInt($( this ).val());
	});
	return total;
}

function changeAndCompute(row){
	var mark = getCurrentMark(row);
	if(mark > 20){
		mark = 20;
	}
	$(row).find(".umarktotal select").val(mark);
	row.find("#mark_total").text(mark+"/20");
	if(row.hasClass("user_p1")){
		row.removeClass("user_p1");
		row.addClass("user_p1_ok");
	}else if (row.hasClass("user_p2")){
		row.addClass("user_p2_ok");
		row.removeClass("user_p2");
	}
}

function getSelect(row){
	return row.find(".umark select");
}

function resetRow(row){
	var allSelect = getSelect(row);
	allSelect.val('0');
}

function setRowState(row, enable){
	resetRow(row);

	var total = $(row).find(".umarktotal select");
	var allSelect = getSelect(row);
	total.val('0');
	allSelect.attr("disabled", !enable);
	total.attr("disabled", !enable);
	if(enable) {
		allSelect.css("background-color", "");
		total.css("background-color", "");
	} else {
		allSelect.css("background-color", "#D4D4D4");
		total.css("background-color", "#D4D4D4");
	}
}

function weight(select){
	var all = [];
	_.each(select, function(e){
		var max = $(e).find("option").last().val();
		_.times(max, function(){
			all.push($(e));
		})
	});
	return _.shuffle(all);
}

function allocateTotal(row, element){
	resetRow(row);
	var selectWeight = weight(getSelect(row));

	var total = parseInt(element.val());
	var select = _.first(selectWeight, total);
	_.each(select, function(item){
		var current = parseInt(item.val());
		item.val(++current);
	});
	changeAndCompute(row);
}

$( document ).ready(function() {
    $(".absent").change(function () {
    	var row = matchRow($(this));
    	var state = $(this).is(':checked');
    	setRowState(row, !state);
    	changeAndCompute(row);
	});
	$(".umark select").change(function(){
		var row = matchRow($(this));
		changeAndCompute(row);
	});
	$(".umarktotal select").change(function(){
		var row = matchRow($(this));
		allocateTotal(row, $(this));
	});
	$("#all_createdocx").click(function(){
		createAllDocx($(this));
	});
	$("#all_sendmarks").click(function(){
		sendAllMarks($(this));
	});
	$(".createdocx").click(function(){
		var button = $(this);
		var row = matchRow(button);
		createDocx(row, button);
	});
	$(".sendmark").click(function(){
		var button = $(this);
		var row = matchRow(button);
		var markData = rowAsData($(row));
		sendMark(markData, button);
	});


});