window.addEventListener( 'load', function() {

	var url = new URL( document.location );

	var loader = new THREE.XHRLoader();

	loader.load( 'data/app.json', function( text ) {

		var player = new APP.Player();
		player.load( JSON.parse( text ) );
		player.setSize( window.innerWidth, window.innerHeight );

		document.body.appendChild( player.dom );

		window.addEventListener( 'resize', function() {
			player.setSize( window.innerWidth, window.innerHeight );
		} );

		var orientationAlpha = document.querySelector( '#orientationAlpha' );
		var orientationBeta = document.querySelector( '#orientationBeta' );
		var orientationGamma = document.querySelector( '#orientationGamma' );

		// Listen for device orientation events fired from the emulator
		// and dispatch them on to the parent window
		window.addEventListener( 'deviceorientation', function( event ) {

			// Print deviceorientation data values in GUI
			orientationAlpha.value = printDataValue( event.alpha );
			orientationBeta.value = printDataValue( event.beta );
			orientationGamma.value = printDataValue( event.gamma );

			if ( !window.parent ) return;

			window.parent.postMessage( JSON.stringify( {
				'action': 'newData',
				'data': {
					'alpha': event.alpha,
					'beta': event.beta,
					'gamma': event.gamma,
					'absolute': event.absolute,
					'roll': event.roll
				}
			} ), '*' );

		}, false );

		var actions = {
			'start': function( data ) {
				player.play(); // Go!!!
			},
			'setCoords': function( data ) {
				player.setManualOrientation( data.alpha, data.beta, data.gamma );
			}
		};

		// Receive messages from window.parent
		window.addEventListener( 'message', function( event ) {

			if ( event.origin != url.origin ) return;

			var json = JSON.parse( event.data );

			if ( !json.action || !actions[ json.action ] ) return;

			actions[ json.action ]( json.data );

		}, false );

		// Kick off the controller by telling its parent window that it is now ready
		if ( window.parent ) {
			window.parent.postMessage( JSON.stringify( {
				'action': 'connect'
			} ), '*' );
		}

	} );
}, false );