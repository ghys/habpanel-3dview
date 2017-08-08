(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('sweetHome3D', SweetHome3DDirective);

    SweetHome3DDirective.$inject = ['OHService', '$ocLazyLoad', '$timeout', '$uibModal', '$templateCache'];
    function SweetHome3DDirective(OHService, $ocLazyLoad, $timeout, $uibModal, $templateCache) {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'EA',
            template: '<canvas class="viewerComponent" width="800" height="600" data-snap-ignore="true"' +
                          'style="background-color: #CCCCCC; border: 1px solid gray; outline:none; touch-action: none;" tabIndex="1"></canvas>' +
                      '<div ng-show="!loadingComplete" id="viewerProgressDiv">' +
                        '<progress id="viewerProgress" class="viewerComponent" value="0" max="200" style="width: 400px"></progress>' +
                        '<label id="viewerProgressLabel" class="viewerComponent" style="margin-top: 2px; display: block; margin-left: 10px"></label>' +
                      '</div>' +
                      '<div ng-show="loadingComplete">' +
                        '<input  id="aerialView"   class="viewerComponent" name="cameraType" type="radio" style="visibility: hidden;"/>' +
                          '<label class="viewerComponent" for="aerialView" style="visibility: hidden;">&nbsp;Aerial view</label>' +
                        '&nbsp;&nbsp;' +
                        '<input  id="virtualVisit" class="viewerComponent" name="cameraType" type="radio" style="visibility: hidden;"/>' +
                          '<label class="viewerComponent" for="virtualVisit" style="visibility: hidden;">&nbsp;Virtual visit</label>' +
                        '<select id="levelsAndCameras" class="viewerComponent" style="visibility: hidden;"></select>' +
                        '<div id="currentObject"></div>' +
                      '</div>',
            scope: {
                libUrl: '@',
                zipUrl: '@'
            }
        };
        return directive;

        function link(scope, element, attrs) {
            var homeUrl = attrs.zipUrl;
            var canvas = element[0].getElementsByTagName('canvas')[0];
            var gridsterItem = element[0].parentElement.parentElement.parentElement.parentElement.parentElement;
            while (!gridsterItem.style.width) {
                gridsterItem = gridsterItem.parentElement;
            }
            var width = parseInt(gridsterItem.style.width.replace('px', ''));
            var height = parseInt(gridsterItem.style.height.replace('px', ''));
            canvas.width = width - 10;
            canvas.height = height - 60;
            canvas.id = "viewerCanvas-" + Math.random().toString(36).substr(2, 10);
            scope.homePreviewComponent = null;
            scope.loadingComplete = false;

            var onerror = function(err) {
                if (err == "No WebGL") {
                    alert("Sorry, your browser doesn't support WebGL.");
                } else {
                    console.log(err.stack);
                    alert("Error: " + (err.message  ? err.constructor.name + " " +  err.message  : err));
                }
            };

            var onprogression = function(part, info, percentage) {
                var progress = document.getElementById("viewerProgress"); 
                if (part === HomeRecorder.READING_HOME) {
                    // Home loading is finished 
                    progress.value = percentage * 100;
                    scope.progress = percentage * 100;
                    info = info.substring(info.lastIndexOf('/') + 1);

                } else if (part === Node3D.READING_MODEL) {
                    // Models loading is finished 
                    progress.value = 100 + percentage * 100;
                    scope.progress = 100 + percentage * 100;
                    if (percentage === 1) {
                        scope.loadingComplete = true;

                        scope.homePreviewComponent.getHome().addFurnitureListener(function (e) {
                            console.log(e);
                        });

                        canvas.addEventListener("mousemove", function (e) {
                            var rect = canvas.getBoundingClientRect();
                            var x = e.clientX; // - rect.left;
                            var y = e.clientY; // - rect.top;
                            //console.log('mouse:' + x + ', ' + y);
                            var obj = scope.homePreviewComponent.getComponent3D().getClosestItemAt(x, y);
                            document.getElementById('currentObject').innerText = (obj) ? obj.getName() : '';
                        });
                        canvas.addEventListener("mouseup", function (e) {
                            var rect = canvas.getBoundingClientRect();
                            var x = e.clientX; // - rect.left;
                            var y = e.clientY; // - rect.top;
                            //console.log('mouse:' + x + ', ' + y);
                            var obj = scope.homePreviewComponent.getComponent3D().getClosestItemAt(x, y);
                            if (obj) {
                                console.log(obj);
                                if (!$templateCache.get('sweethome3d/' + obj.getName())) return;
                                $uibModal.open({
                                    templateUrl: 'sweethome3d/' + obj.getName(),
                                    //windowTemplateUrl: 'sweethome3d/windowTemplate',
                                    windowTopClass: 'sweethome3d-modal',
                                    scope: scope.$parent
                                });

                                OHService.reloadItems(); // because some widgets expect a refresh...
                            }
                        });
                        canvas.addEventListener("touchend", function (e) {
                            var rect = canvas.getBoundingClientRect();
                            var x = e.changedTouches[0].clientX; // - rect.left;
                            var y = e.changedTouches[0].clientY; // - rect.top;
                            //console.log('mouse:' + x + ', ' + y);
                            var obj = scope.homePreviewComponent.getComponent3D().getClosestItemAt(x, y);
                            if (obj) {
                                console.log(obj);
                                document.getElementById('currentObject').innerText = (obj) ? obj.getName() : '';
                                if (!$templateCache.get('sweethome3d/' + obj.getName())) return;
                                $uibModal.open({
                                    templateUrl: 'sweethome3d/' + obj.getName(),
                                    //windowTemplateUrl: 'sweethome3d/windowTemplate',
                                    windowTopClass: 'sweethome3d-modal',
                                    scope: scope.$parent
                                });
                                OHService.reloadItems();
                            }
                        });

                    }
                }

                document.getElementById("viewerProgressLabel").innerHTML = 
                    (percentage ? Math.floor(percentage * 100) + "% " : "") + part + " " + info;

                scope.progressStatus = (percentage ? Math.floor(percentage * 100) + "% " : "") + part + " " + info;
            };

            // Display home in canvas 3D
            // Mouse and keyboard navigation explained at 
            // http://sweethome3d.cvs.sf.net/viewvc/sweethome3d/SweetHome3D/src/com/eteks/sweethome3d/viewcontroller/resources/help/en/editing3DView.html
            // You may also switch between aerial view and virtual visit with the space bar
            // For browser compatibility, see http://caniuse.com/webgl
            $ocLazyLoad.load([
                    attrs.libUrl + '/big.min.js',
                    attrs.libUrl + '/gl-matrix-min.js',
                    attrs.libUrl + '/jszip.min.js',
                    attrs.libUrl + '/core.min.js',
                    attrs.libUrl + '/geom.min.js',
                    attrs.libUrl + '/triangulator.min.js',
                    attrs.libUrl + '/viewmodel.min.js']).then(function () {
                        $ocLazyLoad.load(attrs.libUrl + '/viewhome.min.js').then (function () {
                            $timeout(function (e) {

                            scope.homePreviewComponent = viewHome(canvas.id,    // Id of the canvas
                                homeUrl,           // URL or relative URL of the home to display 
                                onerror,           // Callback called in case of error
                                onprogression,     // Callback called while loading 
                                {roundsPerMinute: 0,                    // Rotation speed of the animation launched once home is loaded in rounds per minute, no animation if missing or equal to 0 
                                navigationPanel: "none",               // Displayed navigation arrows, "none" or "default" for default one or an HTML string containing elements with data-simulated-key 
                                                                        // attribute set "UP", "DOWN", "LEFT", "RIGHT"... to replace the default navigation panel, "none" if missing 
                                aerialViewButtonId: "aerialView",      // Id of the aerial view radio button, radio buttons hidden if missing  
                                virtualVisitButtonId: "virtualVisit",  // Id of the aerial view radio button, radio buttons hidden if missing  
                                levelsAndCamerasListId: "levelsAndCameras"   // Id of the levels select component, hidden if missing
                            /*, selectableLevels: ["Level 0", "Level 1"] */  // List of displayed levels, all viewable levels if missing
                                });
                            }, 200);
                                
                        });
            });

        }
    }
})();