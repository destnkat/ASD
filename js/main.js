// JS for ASD

var isEdit = false;
var editKey = null;
var currentSearchId = null;
var currentInventory;

var bindFormElements = function() {
	var $mapContainer = $('#map_container');

	$mapContainer.hide();

	$('#memory_geotag').on('change', function(e) {
		var val = $(this).val();
		if (val == 1 && $mapContainer.is(':hidden')) {
			$mapContainer.show();
		} else {
			$mapContainer.hide();
		}
	});
};

var getInventory = function() {
    currentInventory = $.parseJSON(localStorage.getItem('memories'));
};

var formValidated = function() {
    var error = false;

    $.each($('#frm_addMemory').find('.required'), function(i, e) {
       var $this = $(this);

       if($this.is('input') && $this.val() == '') {
           error = true;
           $this.parent('.ui-input-text').css('background-color', 'pink');
       }

       if ($this.is('textarea') && $this.val() == '') {
           error = true;
            $this.css('background-color', 'pink');
       }

        if( $this.is('select') && $this.val() == 'null') {
            error = true;
            $this.parent('.ui-btn-up-c').css('background-color', 'pink');
        }
    });

    return error;
};

var getNewKey = function() {
    var currentIds = [];

    if (currentInventory) {
        $.each(currentInventory, function(i, e){
            currentIds.push(e.memory_id);
        });

        return Math.max.apply( Math, currentIds) + 1;
    }

    return 1;
}

var formSubmit = function(e) {
    e.stopPropagation();
    var memories = $.parseJSON(localStorage.getItem('memories'));

    if(!memories) {
        memories = [];
    }

    if (!formValidated()) {
        var newObj = {};
        newObj.memory_id          = isEdit ? editKey : getNewKey();
        newObj.memory_name        = $('#memory_name').val();
        newObj.memory_description = $('#memory_description').val();
        newObj.memory_theme       = $('#memory_theme').val();
        newObj.memory_date        = $('#memory_date').val();
        newObj.memory_privacy     = $('#memory_privacy').val();
        newObj.memory_update      = $('#memory_update').val();
        newObj.memory_geotag      = $('#memory_geotag').val();

        memories.push(newObj);
        localStorage.setItem('memories', JSON.stringify(memories));
        getInventory();
        $('#frm_addMemory')[0].reset();
        $.mobile.changePage('#view_memories');
    }

};

var retrieveCurrentMemories = function() {
    var template = $('#memories_list_tpl').html();
    
    if (currentInventory) {
        $('#view_memories section[data-role="content"]').html(Mustache.to_html(template, {
            "memories": currentInventory
        }));
     }
};

var setCurrentSearchParam = function(id) {
    currentSearchId = id;
}

var getSelectedMemory = function() {
    var tpl = $('#single_memory_tpl').html();
    $.each(currentInventory, function(i, e){ 
        if (e.memory_id == currentSearchId) { 
            $('#memory section[data-role="content"]').html(Mustache.to_html(tpl, e));
        }
    });
}

var deleteMemory = function(id) {
    var tmp = [];

    $.each(currentInventory, function(i, e) {
        if ( e.memory_id != id) {
            tmp.push(e);    
        }
    });

    localStorage.setItem('memories', JSON.stringify(tmp));
    getInventory();
    $.mobile.changePage('#view_memories');
};

var setEditKey = function(id) {
    editKey = id;
};

$('#memory').on('pageshow', function(){
    getSelectedMemory();
    $(this).page('destroy').page();
    
    $('.btn_deleteMemory').on('click', function(e){
        deleteMemory($(this).data('memory-id'));
    });

    $('.btn_editMemory').on('click', function(e){
       setEditKey($(this).data('memory-id'));
        $.mobile.changePage('#add_memory');
    });
});

$('#view_memories').on('pageshow', function(){
    retrieveCurrentMemories();
    var $curList = $('#current_memories_list');
    $curList.listview();
    $curList.listview('refresh');

    $curList.find('a').on('click', function(e){ 
        setCurrentSearchParam($(this).data('memory-id'));
    });
});

var prepopulateEditForm = function() {
    var tmpObj;
    
    $.each(currentInventory, function(i, e){
       if (e.memory_id == editKey) {
           tmpObj = e;
           return false;
       }
    });

    $('#memory_name').val(tmpObj.memory_name);
    $('#memory_date').val(tmpObj.memory_date);
    $('#memory_description').val(tmpObj.memory_description);
    $('#memory_privacy').val(tmpObj.memory_privacy);
};

$('#add_memory').on('pageshow', function(e){
    $('#memory_submit').on('click', formSubmit);
    if (editKey) {
        prepopulateEditForm();
    }
});

$('#add_memory').on('pagehide', function(e){
    $('#memory_submit').off('click', formSubmit);
});

$(document).on('pageinit', function(){
	bindFormElements();
    getInventory();
});