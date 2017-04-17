//
if ( DOING_REMOVE == undefined && DOING_REMOVE_STYLE == undefined && DOING_NONE == undefined ) {
    const DOING_REMOVE = 1, DOING_REMOVE_STYLE = 2, DOING_NONE = 3;
}

#include "./sp_worker/json2.js"
#include "./sp_worker/array.js"

var doc = app.ActiveDoc;
var script_file = File($.fileName);
var script_file_path = script_file.path;
var scanned = false;
var SPgf     = [];
var SReplace = [];
var SMessage = [];
var SOffset  = [];
var SLen     = [];
var MyNumPgf = 0;

SPgf.length     = 0;
SReplace.length = 0;
SMessage.length = 0;
SOffset.length  = 0;
SLen.length     = 0;
//
#include "./sp_worker/sc.jsx"
/// MENU
var mMenu = app.GetNamedMenu("!MakerMainMenu") ;
var undoSpellMenu =mMenu.DefineAndAddMenu("SpellChecking",  "SpellChecking");
undoSpellMenu.DefineAndAddCommand(1, "cmdSpell", "Spell", "");
undoSpellMenu.DefineAndAddCommand(2, "cmdUndo", "Undo", "");
UpdateMenus();


//Notification(Constants.FA_Note_BackToUser,true);
//Notification(Constants.FA_Note_DisplayClientTiDialog,true); 
//Notification(Constants.FA_Note_UpdateAllClientTi,true); 
//Notification(Constants.FA_Note_UpdateClientTi,true); 
//Notification(Constants.FA_Note_PreMouseCommand,true); 
Notification(Constants.FA_Note_PostMouseCommand,true); 
function Notify(note, objnot, sparam, iparam)
{
#include "./sp_worker/Window.jsx"
             switch (note) {
                         case Constants.FA_Note_BackToUser:  // на любое мышкино нажатие + старт
                                alert("BackToUser:" + sparam + " i:" + iparam);
                               break;
                         case Constants.FA_Note_DisplayClientTiDialog:  // 
                                alert(".FA_Note_DisplayClientTiDialog " + sparam + " i:" + iparam);
                               break;
                         case Constants.FA_Note_UpdateAllClientTi:  // 
                                alert("FA_Note_UpdateAllClientTi " + sparam + " i:" + iparam);
                               break;
                         case Constants.FA_Note_UpdateClientTi:  // 
                                alert(".FA_Note_UpdateClientTi:" + sparam + " i:" + iparam);
                               break;
                         case Constants.FA_Note_PreMouseCommand:  // мышиное тыкание до
                               alert("PreMouseCommand:" + sparam + " o:" + objnot.TextSelection.beg.offset + " i:" + iparam);
//                               ReturnValue(Constants.FR_CancelOperation);
                               ReturnValue(Constants.FR_CancelInsertElementOperation);
                               break;
                         case Constants.FA_Note_PostMouseCommand:  // мышиное тыкание после
//                               alert("PostMouseCommand:" + sparam + " Beg:" + objnot.TextSelection.beg.offset + " End:" + objnot.TextSelection.beg.obj.UserString);
                               if (scanned)
                               {
                                   for (var i = 0; i < SOffset.length; i++)
                                   {
                                       Log("sc.log","Offs:" + objnot.TextSelection.beg.offset + " look:" + SOffset[i] + " len:" + SLen[i]);
                                       if (objnot.TextSelection.beg.offset  >= SOffset[i] &&
                                           objnot.TextSelection.beg.offset <= (SOffset[i] + SLen[i]))
                                        {
                                            var sa = DynamicScriptUI.prototype.run(i);
                                            break;
                                        }
                                   }
                               }
                               break;
                               
              }
} 
var FileIsOk = true;
function Log(logFile,textLine)
{
   if (FileIsOk)
   {
       file = new File ("C:\\1\\"+logFile);
       if (file.open("a+", "TEXT", "????") !=  "undefined")
       {
           file.write(textLine+"\r");
           file.close();
       }
       else
       {
           FileIsOk = false;
       }
   }
}
function Command (cmd) {
    myapp.init (app.ActiveDoc, app);
    SPgf.length     = 0;
    SReplace.length = 0;
    SMessage.length = 0;
    SOffset.length  = 0;
    SLen.length     = 0;
    if ( cmd == "1" ) {
//        alert ("Spelling h!");
//        Notification(Constants.FA_Note_PreMouseCommand,true); 
        myapp.matchesIterate ();
    }
    else if ( cmd == "2" ) {
//           alert ("Undo here!");
//        Notification(Constants.FA_Note_PreMouseCommand,false); 
        while ( myapp.undo () == DOING_REMOVE );
    }
    else
    {
           alert ("Unknown!");
    }
};
/// END MENU