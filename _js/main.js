// JS for ASD
$(document).on('pageinit', function(){
	bindFormElements();
});

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

