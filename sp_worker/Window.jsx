var SelChoice = 0;
var SelNum    = -1;
function DynamicScriptUI() 
{ 
    this.windowRef = null;
}
DynamicScriptUI.prototype.run = function(num) 
{
        SelChoice = 0;
        SelNum    = num;
        Log("sc.log","Win");
        PrintSave();
	var resHead =
           "palette { \
                   whichInfo: DropDownList { preferredSize: [200, 20],  alignment:'left' }, \
                   allGroups: Panel { text: 'Comment', orientation:'stack',\
";
         var resWord = CreateStrMenu(SMessage[num]);
//           "info: Group { orientation: 'column', name: Group { orientation: 'row', s: StaticText { text:'Name:'         },} },},";
//        workInfo: Group { orientation: 'column', name: Group { orientation: 'row', s: StaticText { text:'Company name:' },} },},";

         var resButton =
          "         buttons: Group { orientation: 'row', alignment: 'right', \
                           okBtn:     Button { text:'OK',     properties:{name:'ok'    }}, \
                           cancelBtn: Button { text:'Cancel', properties:{name:'cancel'}} \
                   } \
           }";
	// Create the dialog with the components
        Log("sc.log","Res:" + resHead + resWord + resButton);
	var win = new Window (resHead + resWord + resButton,"Replace to");	
	this.windowRef = win;
	
	// Define the behavior for the drop-down list that changes the display
	win.whichInfo.onChange = function () 
	{
	    // In this context, "this" refers to the list component object
		if (this.selection != null) 
		{

			for (var g = 0; g < this.items.length; g++)
			{
				//hide all other groups
				this.items[g].group.visible = false; 
                                if (this.selection == win.whichInfo.items[g])
                                {
                                    SelChoice = g;
                                }
			}

			//show this group
			this.selection.group.visible = true;
		}
	}
	// Define the button behavor
   	win.buttons.okBtn.onClick     = function () { DoReplace(); this.parent.parent.close(1); };
	win.buttons.cancelBtn.onClick = function () { this.parent.parent.close(2); };
		
	// Add list items to the drop-down list
	var item = win.whichInfo.add ('item', SReplace[num]);
	item.group = win.allGroups.info;
//	item = win.whichInfo.add ('item', 'Work Info');
//	item.group = win.allGroups.workInfo;
	win.whichInfo.selection = win.whichInfo.items[0];
	win.center(); 
	// Display the window
	win.show();
	
	return true;
}
function PrintSave()
{
    Log("sc.log","Save pgf:" + SPgf.length + " Rep:" + SReplace.length + " Mes:" + SMessage.length + " Offs:" + SOffset.length);
    for (var i = 0; i < SPgf.length; i++)
    {
        Log("sc.log","Save i:" + i + " Rep:" + SReplace[i] + " Mes:" + SMessage[i] + " Offs:" + SOffset[i]);
    }
}
function CreateStrMenu(name)
{
    var res =  "info: Group { orientation: 'column', name: Group { orientation: 'row', s: StaticText { text:'" 
               + name 
               + "' },} },},";
    return res;
}
function DoReplace()
{
    Log("sc.log","DoReplace:" + SelChoice);
    var TxtLst = SPgf[SelChoice].beg.obj.GetText(Constants.FTI_String);
    Log("sc.log","Beg:" + SPgf[SelChoice].beg.offset + " End:" + SPgf[SelChoice].end.offset);
    for (var i = 0; i < TxtLst.length; i += 1) 
    {  
        Log("sc.log","TxtN" + i + " :" + TxtLst[i].sdata);
    }
    myapp.replace(SelNum);
}