# 3D WebGL interactive smarthome control with openHAB, HABPanel & Sweet Home 3D

This repository contains a directive to display and interact with WebGL views generated with http://www.sweethome3d.com, and an example template to include to your HABPanel dashboard.

They use the [Sweet Home 3D JS Viewer](http://prdownloads.sourceforge.net/sweethome3d/SweetHome3DJSViewer-5.5.zip) to render the 3D view and allow interacting with objects to show modal dialogs including other HABPanel widgets. The example template shows how to do that, based on the [SweetHome3DExample3.sh3d](http://www.sweethome3d.com/examples/SweetHome3DExample3.sh3d) example from http://www.sweethome3d.com/gallery.jsp (you can also use the _default.sh3d_ file bundled with the Sweet Home 3D JS Viewer).

Both the aerial view and the first-person view (aka. "Virtual Visit") can be used. Use the space bar or the radio buttons to switch between the two.

![](http://i.imgur.com/ozVRcSF.gif)
![](http://i.imgur.com/umDrLMZ.gif)

## Prerequisites

- openHAB 2.1 or later with HABPanel
- Sweet Home 3D
- A browser supporting WebGL

## Instructions

- Install Sweet Home 3D from http://www.sweethome3d.com and the _ExportToHTML5-1.2.sh3p_ plugin from http://www.sweethome3d.com/plugins/ExportToHTML5-1.2.sh3p
- Run Sweet Home 3D and design your house (or load an example)
- Important Note: the directive will use the object names to display the appropriate modal window, so ensure all your objects have unique names unlike this:

    ![Imgur](http://i.imgur.com/yVZJMaY.png)
    
  (unless you want all the radiators to behave the same way)
  
- Download [Sweet Home 3D JS Viewer](http://prdownloads.sourceforge.net/sweethome3d/SweetHome3DJSViewer-5.5.zip) and extract the contents of the archive to a subfolder (e.g. `sweethome3d`) of your openHAB instance's `conf/html` folder

- The extracted contents will be available as static files served by openHAB:
   * `/static/sweethome3d/lib` - contains the additional JavaScript libs to display the WebGL view;
   * `/static/sweethome3d/default.sh3d` - contains the contents of your design
   * `/static/sweethome3d/SweetHome3DJSViewer.html` - test page
   * `/static/sweethome3d/SweetHome3DJSViewerInOverlay.html` - test page with an overlay

- You can test whether the viewer is working properly on your browser first by navigating to the test page's URL: http://<your_openhab_instance>:8080/static/sweethome3d/SweetHome3DJSViewer.html

- Place the directive (_sweethome3d.directive.js_) from this repository in your `conf/html` folder

- Copy the .sh3d file you created in Sweet Home 3D to your `conf/html` folder as well

- Open HABPanel, create a dashboard (refer to the documentation or go to https://community.openhab.org/ for support), and add a Template widget

- Edit the Template widget and choose the "Import from file..." option in the <key>⋮</key> menu. Import the _3d-view.tpl.html_ from this repository

- You have to customize the template to fit your needs: near the end, change the values of `lib-url` and `sh3d-url` to where the lib folder resp. the sh3d file of your house resides

- Write a modal dialog template above for each object you wish to interact with:
A modal template for an object named 'My Object' in Sweet Home 3D looks like this:
```html
<script type="text/ng-template" id="sweethome3d/My Object">
	Your template...
</script>
```
   You can use HABPanel widgets and functions (like `itemState()`) in these templates too. Refer to https://community.openhab.org/t/habpanel-development-advanced-features-start-here/30755 for more details

   For now you have to write templates for each object, but the good news is, you can even have multiple widgets or complex views displayed for a single object!

- Run the dashboard and the 3d view should appear - it may take a while to load depending on the complexity of your house and the performance of your client machine!

### Known issues

- Only one 3d view per dashboard, multiple concurrent views will not work
- Sometimes the view doesn't appear, refresh the page with your browser until it does
- Object might not be clickable in the initial view, rotate the view a bit and it will work again
