﻿// whither.js for Perlenspiel 3.1

// Whither
// By Ryan Melville and Patrick Petersen
// Updated by Brian Moriarty

// Music by Kevin MacLeod: "Fantastic Dim Bar"
// <http://freepd.com/Piano/Fantastic%20Dim%20Bar>

/*jslint nomen: true, white: true */
/*global PS */

var W; // global namespace variable

( function () {
	"use strict";
	// Private constants

	var IS_FLOOR = "floor"; // floor ID
	var IS_GOAL = "goal"; // goal ID
	var IS_WALL = "wall"; // wall ID
	var IS_FOOD = "food"; // food ID

	var STEP1 = 255;
	var STEP2 = 128;
	var STEP3 = 85;
	var STEP4 = 64;
	var STEP5 = 51;
	var STEP6 = 43;
	var STEP7 = 36;
	var STEP8 = 32;
	var STEP9 = 28;
	var STEP10 = 26;
	var STEP11 = 24;
	var STEP12 = 22;
	var STEP13 = 20;

	var COLOR_FLOOR = PS.COLOR_GRAY;
	var COLOR_FLOOR_BORDER = PS.COLOR_GRAY;
	var COLOR_GOAL = PS.COLOR_GRAY;
	var COLOR_GOAL_BORDER = PS.COLOR_BLACK;
	var COLOR_ACTOR = PS.COLOR_BLACK;
	var COLOR_ACTOR_BORDER = PS.COLOR_GRAY;
	var COLOR_WALL = PS.COLOR_WHITE;
	var COLOR_WALL_BORDER = PS.COLOR_GRAY;
	var COLOR_FOOD = PS.COLOR_BLACK;
	var COLOR_FOOD_BORDER = PS.COLOR_GRAY;

	var WIDTH_GOAL_BORDER = 3;
	var WIDTH_FOOD_BORDER = 20;

	// Private variables

	var play = true; // false if movement enabled
	var music = false; // true if music started

	var xmax; // maximum actor x-pos
	var ymax; // maximum actor y-pos

	var level = 20; // starting/current level

	var ax; // current actor x-pos
	var ay; // current actor y-pos
	var asize; // current actor border size (0 = full)

	var gx; // current goal x-pos
	var gy; // current goal y-pos
	var gdelta; // goal alpha delta

	var foods; // list of foods: [x, y]

	var fadewalls; // list of fade walls: [x, y, delta]
	var fadefoods; // list of fade foods: [x, y, delta]

	// This array of objects contains the
	// initialization data for each level
	// (required) ax, ay = actor x/y
	// (required) asize = actor size
	// (optional) gx, gy = goal x/y
	// (optional) gdelta = goal alpha delta
	// (optional) walls = list of walls: [x, y]
	// (optional) fadewalls = list of fading walls: [x, y, delta]
	// (optional) foods = list of foods: [x, y]
	// (optional) fadefoods = list of fading foods: [x, y, delta]

	var levelData = [
		// Level 0
		{
			ax : 1, ay : 1, // actor x/y
			asize : 0 // actor size
		},

		// Level 1
		{
			ax : 2, ay : 6, // actor x/y
			asize : 2, // actor size

			gx : 7, gy: 6 // goal x/y
		},

		// Level 2
		{
			ax : 2, ay : 2, // actor x/y
			asize : 2, // actor size

			gx : 7, gy: 7 // goal x/y
		},

		// Level 3
		{
			ax : 3, ay : 5, // actor x/y
			asize : 4, // actor size

			gx : 7, gy: 5, // goal x/y

			walls : [
				[ 5, 4 ], [ 5, 5 ], [ 5, 6 ]
			]
		},

		// Level 4
		{
			ax : 7, ay : 7, // actor x/y
			asize : 2, // actor size

			gx : 2, gy: 2, // goal x/y

			walls : [
				[ 0, 4 ], [ 2, 4 ], [ 2, 6 ], [ 2, 8 ],
				[ 3, 3 ], [ 4, 0 ], [ 4, 6 ], [ 4, 8 ],
				[ 5, 3 ], [ 5, 5 ], [ 6, 6 ], [ 7, 3 ],
				[ 8, 4 ], [ 8, 6 ], [ 9, 9 ]
			]
		},

		// Level 5
		{
			ax : 1, ay : 4, // actor x/y
			asize : 0, // actor size

			gx : 8, gy: 3, // goal x/y

			walls : [
				[ 3, 2 ], [ 3, 3 ], [ 3, 5 ], [ 3, 6 ],
				[ 5, 3 ], [ 5, 4 ], [ 5, 5 ], [ 7, 3 ],
				[ 5, 3 ], [ 5, 5 ], [ 6, 6 ], [ 7, 3 ],
				[ 7, 4 ], [ 7, 6 ], [ 7, 7 ]
			]
		},

		// Level 6
		{
			ax : 2, ay : 5, // actor x/y
			asize : 6, // actor size

			gx : 6, gy: 2, // goal x/y

			foods : [
				[ 4 , 4 ]
			]
		},

		// Level 7
		{
			ax : 7, ay : 2, // actor x/y
			asize : 4, // actor size

			gx : 2, gy: 7, // goal x/y

			foods : [
				[ 1 , 2 ]
			]
		},

		// Level 8
		{
			ax : 3, ay : 7, // actor x/y
			asize : 4, // actor size

			gx : 8, gy: 2, // goal x/y

			walls : [
				[ 4, 3 ], [ 5, 3 ], [ 6, 3 ], [ 6, 4 ]
			],

			foods : [
				[ 5 , 4 ]
			]
		},

		// Level 9
		{
			ax : 1, ay : 8, // actor x/y
			asize : 2, // actor size

			gx : 8, gy: 1, // goal x/y

			walls : [
				[ 0, 6 ], [ 1, 6 ], [ 2, 6 ], [ 3, 6 ],
				[ 5, 8 ], [ 5, 9 ], [ 6, 0 ], [ 6, 3 ],
				[ 7, 3 ], [ 8, 3 ], [ 9, 3 ]
			],

			foods : [
				[ 4, 1 ], [ 5, 5 ]
			]
		},

		// Level 10
		{
			ax : 3, ay : 5, // actor x/y
			asize : 4, // actor size

			gx : 7, gy: 5, // goal x/y

			walls : [
				[ 5, 2 ], [ 5, 3 ], [ 5, 4 ], [ 5, 5 ],
				[ 5, 6 ], [ 5, 7 ], [ 5, 8 ]
			],

			fadewalls : [
				[ 5, 5, STEP4 ] // x, y, alpha delta
			]
		},

		// Level 11
		{
			ax : 8, ay : 8, // actor x/y
			asize : 2, // actor size

			gx : 3, gy: 3, // goal x/y

			walls : [
				[ 3, 6 ], [ 3, 7 ], [ 3, 8 ], [ 3, 9 ],
				[ 5, 0 ], [ 5, 1 ], [ 5, 2 ], [ 4, 5 ],
				[ 5, 3 ], [ 5, 7 ], [ 6, 4 ], [ 6, 5 ],
				[ 6, 6 ]

			],

			fadewalls : [
				[ 5, 3, STEP5 ] // x, y, alpha delta
			]
		},

		// Level 12
		{
			ax : 4, ay : 0, // actor x/y
			asize : 6, // actor size

			gx : 8, gy: 5, // goal x/y

			walls : [
				[ 6, 0 ], [ 6, 1 ], [ 6, 2 ], [ 6, 3 ],
				[ 6, 4 ], [ 6, 5 ], [ 6, 6 ]
			],

			fadewalls : [
				[ 6, 3, STEP4 ] // x, y, alpha delta
			],

			foods : [
				[ 5, 7 ], [ 7, 7 ]
			]
		},

		// Level 13
		{
			ax : 2, ay : 7, // actor x/y
			asize : 8, // actor size

			gx : 5, gy: 2, // goal x/y

			fadefoods : [
				[ 5, 5, STEP5 ] // x, y, alpha delta
			]
		},

		// Level 14
		{
			ax : 6, ay : 1, // actor x/y
			asize : 10, // actor size

			gx : 1, gy: 2, // goal x/y

			foods : [
				[ 5, 5 ]
			],

			fadefoods : [
				[ 5, 4, STEP3 ] // x, y, alpha delta
			]
		},

		// Level 15
		{
			ax : 5, ay : 2, // actor x/y
			asize : 8, // actor size

			gx : 6, gy: 7, // goal x/y

			walls : [
				[ 6, 2 ], [ 5, 3 ], [ 5, 4 ]
			],

			foods : [
				[ 2, 4 ]
			],

			fadefoods : [
				[ 6, 3, STEP6 ] // x, y, alpha delta
			]
		},

		// Level 16
		{
			ax : 1, ay : 5, // actor x/y
			asize : 8, // actor size

			gx : 7, gy: 2, // goal x/y

			walls : [
				[ 5, 0 ], [ 5, 1 ], [ 5, 2 ], [ 5, 3 ],
				[ 5, 4 ], [ 5, 5 ], [ 6, 5 ], [ 7, 5 ],
				[ 8, 5 ], [ 9, 5 ]
			],

			fadewalls : [
				[ 5, 4, STEP13 ]
			],

			foods : [
				[ 2, 0 ], [ 6, 4 ], [ 4, 3 ]
			],

			fadefoods : [
				[ 3, 1, STEP6 ] // x, y, alpha delta
			]
		},

		// Level 17
		{
			ax : 4, ay : 8, // actor x/y
			asize : 6, // actor size

			gx : 1, gy: 3, // goal x/y
			gdelta : 32 // goal alpha delta
		},

		// Level 18
		{
			ax : 3, ay : 2, // actor x/y
			asize : 0, // actor size

			gx : 5, gy: 5, // goal x/y
			gdelta : 24, // goal alpha delta

			walls : [
				[ 2, 5 ], [ 3, 7 ], [ 3, 6 ], [ 3, 4 ],
				[ 4, 3 ], [ 5, 3 ], [ 6, 3 ], [ 7, 4 ]
			],

			foods : [
				[ 1, 6 ], [ 4, 8 ]
			]
		},

		// Level 19
		{
			ax : 7, ay : 5, // actor x/y
			asize : 6, // actor size

			gx : 1, gy: 4, // goal x/y
			gdelta : 26, // goal alpha delta

			walls : [
				[ 4, 3 ], [ 3, 4 ], [ 5, 2 ], [ 4, 5 ],
				[ 6, 6 ], [ 7, 6 ]
			],

			fadewalls : [
				[ 3, 4, STEP4 ]  // 60
			],

			fadefoods : [
				[ 3, 7, STEP5 ]
			]
		},

		// Level 20
		//{
		//	ax : 0, ay : 7, // actor x/y
		//	asize : 0, // actor size
        //
		//	gx : 9, gy: 7, // goal x/y
		//	gdelta : 32 // goal alpha delta
		//}
		{
			ax : 0, ay : 7, // actor x/y
			asize : 0, // actor size

			gx : 5, gy: 7, // goal x/y
			gdelta : 32 // goal alpha delta
		},

		{
			ax : 5, ay : 7, // actor x/y
			asize : 0, // actor size

			gx : 0, gy: 0 // goal x/y
		}
	];

	// PRIVATE FUNCTIONS

	// Place actor at x, y with size

	function place ( x, y, size ) {
		ax = x;
		ay = y;
		asize = size;
		PS.color( x, y, COLOR_ACTOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.border( x, y, size );
		PS.borderColor( x, y, COLOR_ACTOR_BORDER );
		PS.borderAlpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, IS_FLOOR ); // set id
	}

	// Change x, y to floor

	function makeFloor ( x, y ) {
		PS.color( x, y, COLOR_FLOOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.border( x, y, 0 );
		PS.borderColor( x, y, COLOR_FLOOR_BORDER );
		PS.borderAlpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, IS_FLOOR ); // set id
	}

	function makeWall ( x, y ) {

		PS.color( x, y, COLOR_WALL );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.border( x, y, 0 );
		PS.borderColor( x, y, COLOR_WALL_BORDER );
		PS.borderAlpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, IS_WALL ); // set id
	}

	// Change x, y to food

	function makeFood ( x, y ) {

		PS.color( x, y, COLOR_FOOD );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.border( x, y, WIDTH_FOOD_BORDER );
		PS.borderColor( x, y, COLOR_FOOD_BORDER );
		PS.borderAlpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, IS_FOOD ); // set id
	}

	// Start specified level

	function start ( val ) {
		var data, len, i, pos, x, y;

		level = val;
		if ( !music && ( level > 0 ) ) {
			music = true;
			PS.statusText( "Whither" );
			W.audio = PS.audioPlay( "whither" );
		}

		// Completely reset grid

		PS.color( PS.ALL, PS.ALL, COLOR_FLOOR );
		PS.alpha( PS.ALL, PS.ALL, PS.ALPHA_OPAQUE );
		PS.border( PS.ALL, PS.ALL, 0 ); // hide borders
		PS.borderColor( PS.ALL, PS.ALL, COLOR_FLOOR_BORDER );
		PS.borderAlpha( PS.ALL, PS.ALL, PS.ALPHA_OPAQUE );
		PS.data( PS.ALL, PS.ALL, IS_FLOOR ); // all floor

		// Init level from data

		data = levelData[ level ];

		// Setup actor

		place( data.ax, data.ay, data.asize );

		// Setup goal if defined

		gx = data.gx;
		if ( gx !== undefined )
		{
			gy = data.gy;
			gdelta = data.gdelta;
			if ( gdelta === undefined ) {
				gdelta = 0; // default delta
			}
			PS.color( gx, gy, COLOR_GOAL );
			PS.border( gx, gy, WIDTH_GOAL_BORDER );
			PS.borderColor( gx, gy, COLOR_GOAL_BORDER );
			PS.data( gx, gy, IS_GOAL ); // set id
		}

		// Set up walls if any defined

		if ( data.walls !== undefined ) {
			len = data.walls.length;
			for ( i = 0; i < len; i += 1 ) {
				pos = data.walls[ i ];
				x = pos[ 0 ];
				y = pos[ 1 ];
				makeWall( x, y );
			}
		}

		// Set up fading walls if any defined

		fadewalls = data.fadewalls;
		if ( fadewalls !== undefined ) {
			len = fadewalls.length;
			for ( i = 0; i < len; i += 1 ) {
				pos = fadewalls[ i ];
				x = pos[ 0 ];
				y = pos[ 1 ];
				makeWall( x, y );
				pos[ 3 ] = true; // mark as active
			}
		}

		// Set up foods if any defined

		foods = data.foods;
		if ( foods !== undefined ) {
			len = foods.length;
			for ( i = 0; i < len; i += 1 ) {
				pos = foods[ i ];
				x = pos[ 0 ];
				y = pos[ 1 ];
				makeFood( x, y );
				pos[ 3 ] = true; // mark as active
			}
		}

		// Set up fading foods if any defined

		fadefoods = data.fadefoods;
		if ( fadefoods !== undefined ) {
			len = fadefoods.length;
			for ( i = 0; i < len; i += 1 ) {
				pos = fadefoods[ i ];
				x = pos[ 0 ];
				y = pos[ 1 ];
				makeFood( x, y );
				pos[ 3 ] = true; // mark as active
			}
		}
	}

	// Blackout for level fail

	function blackout () {
		var timer;

		play = false; // disable play
		PS.color( PS.ALL, PS.ALL, PS.COLOR_BLACK );
		PS.border( PS.ALL, PS.ALL, 0 );
		PS.alpha( PS.ALL, PS.ALL, 255 );
		timer = PS.timerStart( 60, function () {
			PS.timerStop( timer );
			start( level ); // restart level
			play = true; // enable play
		} );
	}

	// Definition of public W object

	W = {
		// PUBLIC CONSTANTS

		WIDTH : 10, // grid width
		HEIGHT : 10, // grid height

		// PUBLIC FUNCTIONS

		// Initialize game

		init : function () {
			xmax = W.WIDTH - 1; // establish maximum x
			ymax = W.HEIGHT - 1; // and y

			start( level );
		},

		// Move actor relative to current position

		move : function ( x, y ) {
			var nx, ny, data, len, i, pos, xp, yp, delta, alpha, found;

			if ( !play ) { // if play disabled, abort
				return;
			}

			// Calc proposed position

			nx = ax + x;
			ny = ay + y;

			// If move is off grid, abort

			if ( ( nx < 0 ) || ( nx > xmax ) || ( ny < 0 ) || ( ny > ymax ) ) {
				return;
			}

			// Check data at new position for bead type

			data = PS.data( nx, ny );
			if ( data === IS_WALL ) {
				return; // done
			}

			if ( data === IS_GOAL ) {
				//len = levelData.length; // check # levels
				//if ( ( level + 1 ) < len ) {
				//	level += 1; // loop on last level
				//}
				//start( level ); // next level
				W.end = true;

				PS.audioPause(W.audio);

				makeFloor( nx, ny );

				W.plrspr = PS.spriteSolid(1, 1);
				PS.spriteMove(W.plrspr, nx, ny);
				PS.spritePlane(W.plrspr, 2);
				PS.spriteSolidColor(W.plrspr, PS.COLOR_BLACK);
				PS.spriteSolidAlpha(W.plrspr, PS.ALPHA_OPAQUE);
				PS.color(PS.ALL, PS.ALL, PS.COLOR_GRAY);
				PS.border(PS.ALL, PS.ALL, 0);

				//PS.statusColor(PS.COLOR_GRAY);
				//PS.statusText("");
				//PS.statusFade(300);
				//PS.statusColor(PS.COLOR_WHITE);


				return;
			}

			if ( data === IS_FOOD ) {
				asize -= 4; // grow actor

				// If food is on foods list, deactivate

				found = false;
				if ( foods !== undefined ) {
					len = foods.length;
					for ( i = 0; i < len; i += 1 ) {
						pos = foods[ i ];
						xp = pos[ 0 ];
						yp = pos[ 1 ];
						if ( ( nx === xp ) && ( ny === yp ) ) {
							pos[ 3 ] = false; // deactivate
							found = true; // don't search fadefoods
							break;
						}
					}
				}

				// If food is on fadefoods list, deactivate

				if ( !found && ( fadefoods !== undefined ) ) {
					len = fadefoods.length;
					for ( i = 0; i < len; i += 1 ) {
						pos = fadefoods[ i ];
						xp = pos[ 0 ];
						yp = pos[ 1 ];
						if ( ( nx === xp ) && ( ny === yp ) ) {
							pos[ 3 ] = false; // deactivate
							break;
						}
					}
				}
			}
			else {
				asize += 2; // shrink actor
				if ( asize > 20 ) {
					if ( level > 0 ) {
						blackout();
					}
					else {
						start( 1 );
					}
					return;
				}
			}

			// Change previous actor position to floor

			makeFloor( ax, ay );

			// Move actor

			place( nx, ny, asize );

			// Handle fadewalls

			if ( fadewalls !== undefined ) {
				len = fadewalls.length;
				for ( i = 0; i < len; i += 1 ) {
					pos = fadewalls[ i ];
					if ( pos[ 3 ] ) { // active?
						xp = pos[ 0 ];
						yp = pos[ 1 ];
						delta = pos[ 2 ];
						alpha = PS.alpha( xp, yp ) - delta;
						if ( alpha <= 0 ) {
							makeFloor( xp, yp );
							pos[ 3 ] = false; // deactivate
						}
						else { // fade it
							PS.alpha( xp, yp, alpha );
						}
					}
				}
			}

			// Handle fadefoods

			if ( fadefoods !== undefined ) {
				len = fadefoods.length;
				for ( i = 0; i < len; i += 1 ) {
					pos = fadefoods[ i ];
					if ( pos[ 3 ] ) { // active?
						xp = pos[ 0 ];
						yp = pos[ 1 ];
						delta = pos[ 2 ];
						alpha = PS.alpha( xp, yp ) - delta;
						if ( alpha <= 0 ) {
							makeFloor( xp, yp );
							pos[ 3 ] = false; // deactivate
						}
						else { // fade it
							PS.alpha( xp, yp, alpha );
						}
					}
				}
			}

			// Handle goal alpha

			if ( gdelta > 0 ) {
				alpha = PS.borderAlpha( gx, gy ) - gdelta;
				if ( alpha <= 0 ) {
					gdelta = 0; // deactivate
					makeFloor( gx, gy );
				}
				else {
					PS.borderAlpha( gx, gy, alpha );
				}
			}
		},

		plrspr : null,
		plrw : 1,
		plrh : 1,

		end : false,
		end2 : false,

		audio : ""
	};
}() );

PS.init = function( system, options )
{
	"use strict";

	PS.gridSize( W.WIDTH, W.HEIGHT );
	PS.gridColor( PS.COLOR_GRAY );
	PS.statusText( "" );
	PS.statusColor( PS.COLOR_WHITE );
	PS.audioLoad( "whither" );
	W.init();

	//var title1 = "Whither";
	//var makeTitle = function(space){
	//	var title = "";
	//	for(var i = 0; i < title1.length - 1; i++){
	//		title = title + title1[i];
	//		for(var j = 0; j < space; j++){
	//			title = title + " ";
	//		}
	//	}
	//	title = title + title1[title1.length - 1];
	//	return title;
	//};
	//PS.debug(makeTitle(3));

};

PS.keyDown = function( key, shift, ctrl, options )
{
	"use strict";
	if(W.end2)
		return;
	if(!W.end && !W.end2) {
		switch (key) {
			case PS.KEY_ARROW_UP:
			case 87:
			case 119:
			{
				W.move(0, -1);
				break;
			}
			case PS.KEY_ARROW_DOWN:
			case 83:
			case 115:
			{
				W.move(0, 1);
				break;
			}
			case PS.KEY_ARROW_LEFT:
			case 65:
			case 97:
			{
				W.move(-1, 0);
				break;
			}
			case PS.KEY_ARROW_RIGHT:
			case 68:
			case 100:
			{
				W.move(1, 0);
				break;
			}
			default:
			{
				break;
			}
		}
	}

	else if (W.end){

		var title1 = "Whither";
		var makeTitle = function(space){
			var title = "";
			for(var i = 0; i < title1.length - 1; i++){
				title = title + title1[i];
				for(var j = 0; j < space; j++){
					title = title + "_";
				}
			}
			title = title + title1[title1.length - 1];
			return title;
		};

		PS.gridPlane(0);
		PS.color( 9, 7, PS.COLOR_GRAY );
		PS.alpha( 9, 7, PS.ALPHA_OPAQUE );
		PS.border( 9, 7, 0 );

		var out = function(x, y)
		{
			return (x < 0) || (x > 9) || (y < 0) || (y > 9);
		};

		var map = function (x, in_min, in_max, out_min, out_max) {
			return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
		};

		var down = (key == 1008) || (key == 115);
		var right = (key == 1007) || (key == 100);
		var up = (key == 1006) || (key == 119);
		var left = (key == 1005) || (key == 97);

		//stop if not using the arrows
		if (!(down || right || up || left)) {
			return;
		}

		var direction = "";
		if (down) {
			direction = "down";
		} else if (right) {
			direction = "right";
		} else if (left) {
			direction = "left";
		} else if (up) {
			direction = "up";
		}
		var plrpos = PS.spriteMove(W.plrspr);
		var oldx = plrpos.x;
		var oldy = plrpos.y;
		var newX = oldx;
		var newY = oldy;
		//clean up old boarder
		if        (direction == "right"){
			newX = oldx+1;
		} else if (direction == "up"){
			newY = oldy-1;
		} else if (direction == "left"){
			newX = oldx-1;
		} else if (direction == "down"){
			newY = oldy+1;
		}

		W.plrh++;
		W.plrw++;

		if(out(newX))
			newX--;
		if(out(newY))
			newY--;
		while(out(newX + W.plrw))
			newX--;
		while(out(newY + W.plrh))
			newY--;

		if(W.plrh >= 9 && !W.end2){
			PS.spriteDelete(W.plrspr);
			PS.gridPlane(10);
			PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
			PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_OPAQUE);
			PS.fade(PS.ALL, PS.ALL, 300);
			PS.alpha(PS.ALL, PS.ALL, PS.ALPHA_TRANSPARENT);
			W.end2 = true;

			PS.statusFade(300);
			PS.statusColor(PS.COLOR_GRAY);

			PS.statusColor(PS.COLOR_GRAY);

			return;
		}
		if(W.end2){
			return;
		}
		PS.statusFade(15);
		var cVal = map(W.plrh, 1, 10, 255, 149);
		PS.statusColor([cVal, cVal, cVal]);
		//PS.statusText(makeTitle(W.plrh));
		//PS.debug(makeTitle(W.plrh) + "\n");

		W.plrspr = PS.spriteSolid(W.plrw, W.plrh);
		PS.spritePlane(W.plrspr, 2);
		PS.spriteMove(W.plrspr, newX, newY);
		PS.spriteSolidColor(W.plrspr, PS.COLOR_BLACK);
		PS.spriteSolidAlpha(W.plrspr, PS.ALPHA_OPAQUE);

	}

};

PS.keyUp = function(key,shift,ctrl,options)
{
	"use strict";
};

PS.input = function(sensors,options)
{
	"use strict";
};

PS.touch = function(x,y,data,options)
{
	"use strict";
};

PS.release = function(x,y,data,options)
{
	"use strict";
};

PS.enter = function(x,y,data,options)
{
	"use strict";
};

PS.exit = function(x,y,data,options)
{
	"use strict";
};

PS.exitGrid = function(options)
{
	"use strict";
};
