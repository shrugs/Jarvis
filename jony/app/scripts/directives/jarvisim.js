'use strict';

angular.module('tonyApp')
.directive('jarvisim', function (Physics, TWEEN) {
    return {
        template: '<div id="JarviSIM"></div>',
        restrict: 'AE',
        scope: {
            warp: '@isListening'
        },
        link: function postLink(scope, element, attrs) {
            Physics(function(world) {
                var viewWidth = element.innerWidth(),
                    viewHeight = element.innerHeight(),
                    center = Physics.vector(viewWidth, viewHeight).mult(0.5),
                    viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight),
                    attractor,
                    edgeBounce,
                    renderer;

                    // create a renderer
                    renderer = Physics.renderer('canvas', {
                        el: 'JarviSIM',
                        width: viewWidth,
                        height: viewHeight
                    });

                    // add the renderer
                    world.add(renderer);
                    // render on each step
                    world.on('step', function () {
                        world.render();
                    });

                    // attract bodies to a point
                    attractor = Physics.behavior('attractor', {
                        pos: center,
                        strength: 0.1,
                        order: 1
                    });

                    // constrain objects to these bounds
                    edgeBounce = Physics.behavior('edge-collision-detection', {
                        aabb: viewportBounds,
                        restitution: 0.2,
                        cof: 0.8
                    });

                    // resize events
                    window.addEventListener('resize', function () {

                        viewWidth = window.innerWidth;
                        viewHeight = window.innerHeight;

                        renderer.el.width = viewWidth;
                        renderer.el.height = viewHeight;

                        viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
                        // update the boundaries
                        edgeBounce.setAABB(viewportBounds);

                    }, true);

                    // move the attractor position to match the mouse coords
                    // renderer.el.addEventListener('mousemove', function( e ){
                    //     attractor.position({ x: e.pageX, y: e.pageY });
                    // });

                    // some fun colors
                    var colors = [
                        '#4FC1E9',
                        '#F7841B',
                        '#dc322f',
                        '#FF2900',
                        '#FF2900',
                        '#17A3D5',
                        '#F7501B'
                    ];
                    // create some bodies
                    var l = 9;
                    var bodies = [];
                    var v = Physics.vector(0, 300);
                    var b, r;

                    while ( l-- ) {
                        r = (20 + Math.random()*30)||0;
                        b = Physics.body('circle', {
                            radius: r,
                            mass: r,
                            x: v.x + center.x,
                            y: v.y + center.y,
                            vx: v.perp().mult(0.0001).x,
                            vy: v.y,
                            styles: {
                                fillStyle: colors[ l % colors.length ]
                            }
                        });
                        bodies.push(b);
                        v.perp(true)
                            .mult(10000)
                            .rotate(l / 3);
                    }

                    // add things to the world
                    world.add( bodies );
                    world.add([
                        Physics.behavior('newtonian', {
                            strength: 0.005,
                            min: 10
                        }),
                        Physics.behavior('body-impulse-response'),
                        edgeBounce,
                        attractor
                    ]);

                    // subscribe to ticker to advance the simulation
                    Physics.util.ticker.on(function( time ) {
                        world.step(time);
                        TWEEN.update();
                    });

                    // start the ticker
                    Physics.util.ticker.start();

                    setInterval(function() {
                        attractor.strength = 0.5;
                        setTimeout(function() {
                            attractor.strength = 0.1;
                        }, 300);
                    }, 5000);

                    scope.$parent.$watch('isListening', function() {
                        var to;
                        if (scope.$parent.isListening) {
                            to = 1;
                        } else {
                            to = 0.3;
                        }

                        var tween = new TWEEN.Tween( { warp: world.warp() } )
                            .to( { warp: to }, 600 )
                            .easing( TWEEN.Easing.Quadratic.Out )
                            .onUpdate( function () {
                                // set the world warp on every tween step
                                world.warp( this.warp );
                            })
                            .start();

                    });

                    // scope.$parent.$watch('lastChange', function() {
                    //     if (scope.$parent.lastChange === undefined) {
                    //         return;
                    //     }
                    //     var circle = bodies[scope.$parent.lastChange];
                    //     var origR = circle.radius;
                    //     var tween = new TWEEN.Tween( { r: origR } )
                    //         .to( { r: origR*4 }, 2000 )
                    //         .easing( TWEEN.Easing.Quadratic.Out )
                    //         .onUpdate( function () {
                    //             circle.options({radius:this.r});
                    //         })
                    //         .start()
                    //         .chain(new TWEEN.Tween({r: origR*2})
                    //                 .to({r: origR})
                    //                 .easing(TWEEN.Easing.Quadratic.InOut)
                    //                 .onUpdate(function() {
                    //                     circle.options({radius:this.r});
                    //                 }));

                    // });

            });
        }
    };
});
