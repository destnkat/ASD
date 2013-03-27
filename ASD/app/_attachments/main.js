
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
    var $db;

    var retrieveCurrentInventory = function() {
        $db.view('eidetify/memories', {
            success: function(data) {
                currentInventory = {};
                currentInventory.memories = [];

                $.each(data.rows, function(i, v){
                  currentInventory.memories.push(v.value);
                }); 
            }
        });
    };

    var init = function() {
        isEdit = false;
        editId = null;
        $db = $.couch.db("asd_eidetify");

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

    var getNewID = function() {
        var id = 0;

        $.each(currentInventory.memories, function(i, v){
            var cleanedId = v.id.substr(10);
            if (cleanedId > id) {
                id = cleanedId;
            }
        });

        return ++id;
    };

    /**
     * Handles the Form Submission
     * @todo CRUD ADD/EDIT to Cloudant
     */
    var validateAndSubmit = function() {
        if (!formValidated()) {
            var id = getNewID();
            var json = {
                _id: 'memory:id:' + id,
                memory_name: $('#memory_name').val(),
                memory_theme: $('#memory_theme').val(),
                memory_description: $('#memory_description').val(),
                memory_geotag: $('#memory_geotag').val(),
                memory_update: $('#memory_update').val(),
                memory_privacy: $('#memory_privacy').val(),
                memory_date: $('#memory_date').val()
            };

            $db.saveDoc(json, {
                success: function(data) {
                    alert("Successfully Saved");
                    retrieveCurrentInventory();
                    $('#memory_reset').trigger('click');
                    $.mobile.changePage('#view_memories');
                },
                error: function(status) {
                    alert('There was an issue saving your memory, Please Try again');
                    console.log(status);
                }
            });
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

    var deleteTheMemory = function(id, rev) {
        var doc = {
            _id: id, 
            _rev: rev
        };

        $db.removeDoc(doc, {
            success: function(data) {
                retrieveCurrentInventory();
                alert('The Item has been successfully deleted!');
                $.mobile.changePage('#view_memories');
            },
            error: function(status) {
                alert('There was a problem, please try again!');
                console.log(status);
            }
        });
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
        var $self = $(this);
        var memoryId = $self.data('memory-id');
        var revId = $self.data('memory-rev');
        Eidetify.deleteTheMemory(memoryId, revId);
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

$('#add_memory').on('pageshow', function() {
    Eidetify.bindForm();
});

$(document).on('pageinit', function(){
    Eidetify.init();
});