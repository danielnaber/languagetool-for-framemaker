#include "json2.js"
#include "array.js"

if ( DOING_REMOVE == undefined && DOING_REMOVE_STYLE == undefined && DOING_NONE == undefined ) {
    const DOING_REMOVE = 1, DOING_REMOVE_STYLE = 2, DOING_NONE = 3;
}

var doc = app.ActiveDoc;
var script_file = File($.fileName);
var script_file_path = script_file.path;

var myapp = {
    init: function (d, a) {
        this.document = d;
        this.app = a;
        this.firstpgf = this.document.MainFlowInDoc.FirstTextFrameInFlow.FirstPgf;
        this.origLength = this.getTextLen ();
        this.spellCheckStyle = this.document.GetNamedCharFmt("SpellChecking").ObjectValid ()  ?  this.document.GetNamedCharFmt("SpellChecking").GetProps () : false;
        this.spellReplaceStyle = this.document.GetNamedCharFmt("SpellReplacement").ObjectValid ()  ?  this.document.GetNamedCharFmt("SpellReplacement").GetProps () : false;    
        this.spellMessageStyle = this.document.GetNamedCharFmt("SpellMessage").ObjectValid ()  ?  this.document.GetNamedCharFmt("SpellMessage").GetProps () : false;    
        this.defaultStyle = this.document.GetNamedCharFmt("Default").ObjectValid ()  ?  this.document.GetNamedCharFmt("Default").GetProps () : false;            
        this.spellStyles = ["SpellChecking", "SpellReplacement", "SpellMessage"];
    },
    undoDoing: function (charTag, textRange) {
        if ( this.spellStyles.indexOf (charTag) != -1 ) {
            switch (charTag) {
                case "SpellMessage":
                    this.document.Clear (0);
                    return DOING_REMOVE;
                case "SpellChecking":
                    if ( this.defaultStyle )
                        this.document.SetTextProps (textRange, this.defaultStyle);
                    return DOING_REMOVE_STYLE;
                default:
                    return DOING_NONE;
            }
        }
        else {
            return DOING_NONE;
        }
    },
    undo: function () {
        var pgf = this.firstpgf;
        while(pgf.ObjectValid()) {
            var textList = pgf.GetText (Constants.FTI_CharPropsChange);  
            var begOffset = 0, endOffset = 0, textRange;  
            for (var i = 0; i < textList.length; i += 1) {  
                endOffset = textList[i].offset;  
                if (endOffset  > begOffset) {  
                    textRange = new TextRange(new TextLoc (pgf, begOffset), new TextLoc (pgf, endOffset));  
                    this.document.TextSelection = textRange;  
                    var charTag = this.document.GetTextPropVal(textRange.beg, Constants.FP_CharTag).propVal.sval; 
                    var doing = this.undoDoing (charTag, textRange);
                    begOffset = endOffset;
                    if (doing == DOING_REMOVE)
                        return DOING_REMOVE;
                }  
            }  
            textRange = new TextRange(new TextLoc (pgf, begOffset), new TextLoc (pgf, Constants.FV_OBJ_END_OFFSET));  
            this.document.TextSelection = textRange;  
            var charTag = this.document.GetTextPropVal(textRange.beg, Constants.FP_CharTag).propVal.sval;
            var doing = this.undoDoing (charTag, textRange);
            pgf = pgf.NextPgfInFlow;
            if (doing == DOING_REMOVE)
                return DOING_REMOVE;
        }
        return DOING_NONE;
    },
    getPgfsCnt: function () {
        var pgf = this.firstpgf;
        var cnt = 1;
        while (pgf.ObjectValid()) {
            cnt++;
            pgf = pgf.NextPgfInFlow;
        }
        return cnt;
    },
    openJson: function ( fpath ) {
        this.JSON_file = File ( fpath );
        this.JSON_object = null;
        this.JSON_content = null;
        this.JSON_exists = false;
        try {
            if ( this.JSON_file !== false ) {
                this.JSON_file.open ('r');
                this.JSON_content =  this.JSON_file.read ();
                this.JSON_object =  JSON.parse (this.JSON_content);
                this.JSON_exists = true;
            }
        }
        catch (err) {
            $.writeln (err.message);
        }
        return this.JSON_exists;
    },
    existsJson: function () {
        return this.JSON_exists;
    },
    getJsonObject: function () {
        if ( this.existsJson () ) {
            return this.JSON_object;
        }
        else {
            return false;
        }
    },
    getTextLen: function () {
        var pgf = this.firstpgf, length = 0;
        while ( pgf.ObjectValid() ) {
            var pgfEnd = pgf.GetText(Constants.FTI_PgfEnd);
            if ( pgfEnd.len > 0 ) {
                length += pgfEnd [0].offset;
            }
            pgf = pgf.NextPgfInFlow;
        }
        return length;
    },
    getTextLenOriginal: function () {
        return this.origLength;
    },
    getCharacter: function (offset) {
    },
    getPgfByOffset: function (offset) {
        if ( this.getTextLen ()  >= offset ) {
            var pgf = this.firstpgf, length = 0, begin = 0;
            while ( pgf.ObjectValid() ) {
                var pgfEnd = pgf.GetText(Constants.FTI_PgfEnd);
                if ( pgfEnd.len > 0 ) {
                    length += pgfEnd [0].offset;
                }
                if ( length >= offset ) {
                    this.pgf_local_offset = offset - begin;
                    return pgf;
                }
                begin = length + 2;
                pgf = pgf.NextPgfInFlow;
            }
        }
        return false;
    },
    setSpellcheckStyle: function (textRange) {
        if ( this.spellCheckStyle ) {
            this.document.SetTextProps ( textRange, this.spellCheckStyle );
        }
    },
    setSpellReplaceStyle: function (textRange) {
        if ( this.spellReplaceStyle ) {
            this.document.SetTextProps ( textRange, this.spellReplaceStyle );
        }
    },
    setSpellMessageStyle: function (textRange) {
        if ( this.spellMessageStyle ) {
            this.document.SetTextProps ( textRange, this.spellMessageStyle );
        }
    },
    matchesIterate: function () {
        if ( this.existsJson () ) {
            if ( this.JSON_object.matches.length > 0 ) {
                /// после каждого дополнения смещение увеличивается на эту длину
                var additional = 0; 
                for ( k in this.JSON_object.matches ) {
                    var one = this.JSON_object.matches [k];
                    var pgf = this.getPgfByOffset (one.offset + additional);
                    var textRange;
                    if (pgf) {
                        var textLoc = new TextLoc();
                        textLoc.obj = pgf;
                        textLoc.offset = this.pgf_local_offset;
                        var replacement = one.replacements.length ? one.replacements [0].value : '';
                        if (replacement.length) {
                            textRange = new TextRange();
                            textRange.beg.obj = pgf;
                            textRange.beg.offset =textLoc.offset;
                            textRange.end.obj = pgf;
                            textRange.end.offset = textLoc.offset + one.length;     
                            this.setSpellcheckStyle (textRange);
                        }
                        var append = "{" + one.message + "}";
                        /// после каждого дополнения смещение увеличивается на эту длину
                        additional += append.length;
                        this.document.AddText(textLoc, append);
                        textRange = new TextRange();
                        textRange.beg.obj = pgf;
                        textRange.beg.offset =textLoc.offset;
                        textRange.end.obj = pgf;
                        textRange.end.offset = textLoc.offset + append.length;     
                        this.setSpellMessageStyle (textRange);
                    }
                }
            }
        }
    },
};

/// MENU
var mMenu = app.GetNamedMenu("!MakerMainMenu") ;
var undoSpellMenu =mMenu.DefineAndAddMenu("SpellChecking",  "SpellChecking");
undoSpellMenu.DefineAndAddCommand(1, "cmdSpell", "Spell", "");
undoSpellMenu.DefineAndAddCommand(2, "cmdUndo", "Undo", "");
UpdateMenus();
function Command (cmd) {
    myapp.init (app.ActiveDoc, app);
    myapp.openJson (script_file_path + "/JSONString.json");
    if ( cmd == "1" ) {
        if ( myapp.existsJson () ) {
            myapp.matchesIterate ();
        }
        else {
            alert ( 'Json not found' );
        }
    }
    else if ( cmd == "2" ) {
        while ( myapp.undo () == DOING_REMOVE );
    }
};
/// END MENU