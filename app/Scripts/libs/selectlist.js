/*
  jQuery Document ready
*/
$(function () {
    $('#demo-htmlselect-basic').ddslick(
	{
	    //callback function: do anything with selectedData
	    onSelected: function (data) {
	        /*
				we are calling custom created function.
				that function will display selected option detail.
			*/
	        displaySelectedData("Callback Function on Dropdown Selection", data);
	    }
	});

    $('#demo-htmlselect-basic1').ddslick(
   {
       //callback function: do anything with selectedData
       onSelected: function (data) {
           /*
               we are calling custom created function.
               that function will display selected option detail.
           */
           displaySelectedData("Callback Function on Dropdown Selection", data);
       }
   });

    /*
		adding click event handler
		for making drop down to custom drop down
	*/
    $('#make-it-custom').on('click', function () {
        /*
			on click it will generate drop down to custom drop down
		*/
        $('#demo-htmlselect').ddslick(
		{
		    //callback function: do anything with selectedData
		    onSelected: function (data) {
		        /*
					we are calling custom created function.
					that function will display selected option detail.
				*/
		        displaySelectedData("Callback Function on Dropdown Selection", data);
		    }
		});
    });

    //Restore Original
    $('#restore').on('click', function () {
        $('#demo-htmlselect').ddslick('destroy');
        $('#dd-display-data').empty();
    });

    /*
		callback function when selection made
		demoIndex : 
			heading for result
		ddData :
			drop down selected object
	*/
    function displaySelectedData(demoIndex, ddData) {
        /*
			add heading to div
		*/
        $('#dd-display-data').html("<h3>Data from Demo " + demoIndex + "</h3>");
        /*
			append selected drop down index to result.
			also added code so you can check
			in browser console for selected object
		*/
        $('#dd-display-data').append('<strong>selectedIndex:</strong> ' + ddData.selectedIndex + '<br/><strong>selectedItem:</strong> Check your browser console for selected "li" html element');

        /*
			check if selection made.
		*/
        if (ddData.selectedData) {
            /*
				appeding more data to result div.
			*/
            $('#dd-display-data').append
			(
				'<br/><strong>Value:</strong>  ' + ddData.selectedData.value +
				'<br/><strong>Description:</strong>  ' + ddData.selectedData.description +
				'<br/><strong>ImageSrc:</strong>  ' + ddData.selectedData.imageSrc
			);
        }
        /*
			browser console code
		*/
        //console.log(ddData);
    }
});