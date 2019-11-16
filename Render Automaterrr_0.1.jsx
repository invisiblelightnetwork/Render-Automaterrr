{
	function myScript(thisObj){
		function myScript_buildUI(thisObj){
			var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette","Render Automaterrr",undefined,{resizeable:true,closeButton:true});
			var res =
			"group { \
				orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], spacing:5, margins:[0,0,0,0], \
				groupOne: Group { \
				}, \
				dailiesRow: Group { \
					alignment:['fill','top'], \
					dailiesStr: StaticText { text:'Dailies Folder:', alignment:['left','center'] }, \
					dailiesEditText: EditText { text:'', characters:60, alignment:['fill','center'] }, \
				}, \
				compsFolderRow: Group { \
					alignment:['fill','top'], \
					compsFolderStr: StaticText { text:'Output Comps Folder:', alignment:['left','center'] }, \
					compsFolderEditText: EditText { text:'', characters:20, alignment:['fill','center'] }, \
				}, \
				selectCompsRow: Group { \
					alignment:['fill','top'], \
					compList: ListBox { preferredSize:[500,500], properties:{\ multiselect:true, \ numberOfColumns:1, \ showHeaders:true, \ columnTitles: ['Select Comps To Render', ]} }, \
				}, \
				activate: Group { \
					alignment:['fill','top'], \
					chooseDailiesFolderButton: Button { text:'Select Dailies Folder' }, \
					chooseOutputFolderButton: Button { text:'Select Output Folder' }, \
					scanOutputButton: Button { text:'Scan Output Folder For Comps' }, \
					renderOutputButton: Button { text:'Render Selected Comps' }, \
					helpButton: Button { text:'?' }, \
				}, \
			}";
			

			//myPanel.margins = [10,10,10,10];
			myPanel.grp = myPanel.add(res);
			
			//Functionality goes here
			var compsInOutput = [];
			//var compsToRender = [];
		
			function onDailiesStringChanged()
			{
				myDailiesString = this.text;
			}	
			function onCompsFolderStringChanged()
			{
				myCompsFolderString = this.text;
			}
			
			function getCompsInFolder(myFolder)
			{
				for (var k = 1; k <= myFolder.numItems; k++){
					if (myFolder.item(k) instanceof CompItem){
						compsInOutput.push(myFolder.item(k).name);
					}
					else if (myFolder.item(k) instanceof FolderItem){
						getCompsInFolder(myFolder.item(k));
					}
				}
			}
			
			function clearListbox()
			{
				//Clear Listbox contents
				var listLength = myPanel.grp.selectCompsRow.compList.items.length;
				
				//alert("listLength: " + listLength);
				for (var k = 0; k <= (listLength-1); k++) {
						//alert(myPanel.grp.selectCompsRow.compList.items[0]);
						//alert("in loop");
						myPanel.grp.selectCompsRow.compList.remove(myPanel.grp.selectCompsRow.compList.items[0]);
				}
				
				//Clear compsInOutput
				compsInOutput = [];
				
			}			
			
			myPanel.grp.dailiesRow.dailiesEditText.onChange = myPanel.grp.dailiesRow.dailiesEditText.onChanging = onDailiesStringChanged; //Runs whenever the dailies location text box changes
			myPanel.grp.compsFolderRow.compsFolderEditText.onChange = myPanel.grp.compsFolderRow.compsFolderEditText.onChanging = onCompsFolderStringChanged; //Runs whenever the comps location text box changes

			myPanel.grp.activate.helpButton.onClick = function(){
				//Brief help 
				alert("Render Automaterr lets you render multiple comps painlessly.\nHere's how.\n\n...Step 1: Enter the address of your dailies folder. Either copy and paste the location or press the 'Select Dailies Folder' button.\n\n...Step 2: Select the folder where you have your Output Comps - the ones that need rendering - in the project tab and click the 'Select Output Folder' button. Nested folders are fine.\n\n...Step 3: Press the 'Scan Output Folder For Comps' button, and all of the comps in the project folder you selected will appear in the listbox.\n\n...Step 4: Choose the comps you want to render.\n\n...Step 5: Press the 'Render Selected Comps' button - the selected comps will be sent to Media Encoder for render. Media Encoder will use the settings from the last video it rendered as the default.\n\n...Step 5: A window will pop up with the full filenames of everything that's rendering. You can copy the filenames by clicking the window and hitting CTRL-C - great for notifying the team.");
			}
			
			myPanel.grp.activate.chooseDailiesFolderButton.onClick = function(){
				//Choose dailies folder
				
				// Ask the user for a folder whose contents are to be imported.
				var targetFolder = Folder.selectDialog("Choose dailies folder...");
				
				if(targetFolder) {
					myPanel.grp.dailiesRow.dailiesEditText.text = targetFolder;
				}
			}
			
			myPanel.grp.activate.chooseOutputFolderButton.onClick = function(){
				//Choose output folder
				var outputFolder = app.project.activeItem;
				
				if(outputFolder instanceof FolderItem) {
					myPanel.grp.compsFolderRow.compsFolderEditText.text = outputFolder.name;
					myCompsFolderString = outputFolder.name;
				}
				else {
					alert("Not a folder.")
				}
			}			
			
			myPanel.grp.activate.scanOutputButton.onClick = function(){
				//Clear out any existing items in the listbox
				clearListbox();
				
				//Get list of all comps in output folder
				for (var i = 1; i <= app.project.numItems; i++){
					if ((app.project.item(i).name == myCompsFolderString) && (app.project.item(i) instanceof FolderItem)){
						folder = app.project.item(i);
						getCompsInFolder(folder);
						break;
					}
				}				
				
				//List compsInOutput[] for choice in panel
				for (var j = 0; j <= compsInOutput.length; j++){
					///	Row 1 Contents
					if(compsInOutput[j] != undefined) {
						var myItem = myPanel.grp.selectCompsRow.compList.add ('item', compsInOutput[j]);
					}
				}
				
				//alert(myPanel.grp.selectCompsRow.compList.items.length);
				//alert(myPanel.grp.selectCompsRow.compList.items[1].text);
				//myPanel.grp.selectCompsRow.compList.remove(myPanel.grp.selectCompsRow.compList.items[1]);
				
			}
			
			myPanel.grp.activate.renderOutputButton.onClick = function(){
				//Functionality to render output				
				if((myDailiesString.length > 0) && (myDailiesString != undefined) && (compsInOutput.length > 0) && (myPanel.grp.selectCompsRow.compList.selection.length > 0)) {
					var notificationText = "Latest renders here:\n"; //Text to notify team
					var time = new Date(); //Get current time
					var myDateString = time.getFullYear() + "_" + ('0' + (time.getMonth()+1)).slice(-2) + '_' + ('0' + time.getDate()).slice(-2);
					var outputFolder = myDailiesString + "\\" + myDateString + "\\"; //Base output folder					
					

					//Add selected comps in list to the render queue
					for (var j = 0; j <= (myPanel.grp.selectCompsRow.compList.selection.length-1); j++){
						var comp = null; // assume the worst
						for (var i = 1; i <= app.project.numItems; i++){
							if ((app.project.item(i).name == myPanel.grp.selectCompsRow.compList.selection[j].text) && (app.project.item(i) instanceof CompItem)){
								comp = app.project.item(i);
							break;
							}
						}
						if (comp != null){				
							//Add comp to render queue
							var item = app.project.renderQueue.items.add(comp);
							var outputModule = item.outputModule(1); //Only one output module for this render
							var fileLocation = "";
							fileLocation = outputFolder + comp.name + "_" + myDateString + "_" + time.getHours() + time.getMinutes();
							outputModule.file = File(fileLocation); //Set output file name
							notificationText += "   " + fileLocation + "\n";
						}
					}
										
					app.project.renderQueue.queueInAME(true); //Send to AME and render - AME uses same output format as last render...
					
					//Pop up alert with list of all files rendered with full path info
					alert(notificationText);					
				}
				else {
					alert("Make sure you have a dailies folder + a output comps folder + at least one comp selected.");
				}
			}
			
			
			myPanel.layout.layout(true);
			
			return myPanel;
		}
		
		var myScriptPal = myScript_buildUI(thisObj);
		
		if (myScriptPal != null && myScriptPal instanceof Window) {
			myScriptPal.center();
			myScriptPal.show();
		}
	}
	myScript(this);
}