
/**
* @todo REFACTOR and abstract some of these methods
* @author Daniel Beacham
* @date 2013-03-15
*/
var Eidetify = (function(){
    var currentInventory;
    var curSelectedMemoryId;
    var isEdit;
    var editId;

    var retrieveCurrentInventory = function() {
        var url = '_view/memories';
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                currentInventory = {};
                currentInventory.memories = [];

                $.each(data.rows, function(i, v){
                   var tmp = v.value;
                   tmp.id = v.key;

                 currentInventory.memories.push(tmp);
                });
                
                console.log(currentInventory);
            }
        })
    };

    var init = function() {
        isEdit = false;
        editId = null;
        retrieveCurrentInventory();
    };

    var displayMemories = function() {
        var template = $('#memories_list_tpl').html();
        var toHTML = Mustache.to_html(template, currentInventory);

        $('#view_memories').find('section[data-role="content"]').html(toHTML);
    };

    var formValidated = function () {
        var error = false;

        $.each($('#frm_addMemory').find('.required'), function (i, e) {
            var $this = $(this);

            if ($this.is('input') && $this.val() === '') {
                error = true;
                $this.parent('.ui-input-text').css('background-color', 'pink');
            }

            if ($this.is('textarea') && $this.val() === '') {
                error = true;
                $this.css('background-color', 'pink');
            }

            if ($this.is('select') && $this.val() == 'null') {
                error = true;
                $this.parent('.ui-btn-up-c').css('background-color', 'pink');
            }
        });

        return error;
    };

    var retrieveSelectedMemory = function() {
        var selectedMemory = {};
        var template = $('#single_memory_tpl').html();

        $.each(currentInventory.memories, function(i, v){
           if(v.id == curSelectedMemoryId) {
               selectedMemory = v;
               return false;
           }
        });

        var toHTML = Mustache.to_html(template, selectedMemory);
        $('#memory').find('section[data-role="content"]').html(toHTML);
    };

    /**
     * Handles the Form Submission
     * @todo CRUD ADD/EDIT to Cloudant
     */
    var validateAndSubmit = function() {
        if (!formValidated()) {
        }
    };

    var bindForm = function() {
        $('#memory_submit').on('click', validateAndSubmit);
    };

    var setSearchParameter = function(id) {
        curSelectedMemoryId = id;
    };

    var editTheMemory = function(id) {
        isEdit = true;
        editId = id;
        $.mobile.changePage('#add_memory');
    };

    /**
     * @param id
     * @todo CRUD Delete Function with Cloudant
     */
    var deleteTheMemory = function(id) {

    };

    return {
        init: init,
        displayMemories: displayMemories,
        bindForm: bindForm,
        setSearchParameter: setSearchParameter,
        retrieveSelectedMemory: retrieveSelectedMemory,
        editTheMemory: editTheMemory,
        deleteTheMemory: deleteTheMemory
    };
})();


$('#memory').on('pageshow', function(){
    Eidetify.retrieveSelectedMemory();

    $('.btn_editMemory').on('click', function(e){
        Eidetify.editTheMemory($(this).data('memory-id'));
    });

    $('.btn_deleteMemory').on('click', function(e){
        Eidetify.deleteTheMemory($(this).data('memory-id'));
    });

    $(this).trigger('pagecreate');
});

$('#view_memories').on('pageshow', function () {
    Eidetify.displayMemories();

    var $curUL = $('#current_memories_list');
    $curUL.find('a').on('click', function(e){
        Eidetify.setSearchParameter($(this).data('memory-id'));
    });

    $curUL.listview();
    $curUL.listview('refresh');
});

$('#add_memories').on('pageshow', function() {
    Eidetify.bindForm();
});

$(document).on('pageinit', function(){
    Eidetify.init();
});