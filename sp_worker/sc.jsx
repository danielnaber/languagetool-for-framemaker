
var myapp = {
    //--------------
    init: function (d, a) {
        scanned  = false;
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
        scanned  = false;
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
        scanned  = false;
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
//        alert("Iterate");
//--------------------------  PS++ Get text from document (all text)
        var pgfMain = this.firstpgf;
        var TxtAll = "";
            while ( pgfMain.ObjectValid() ) {
                  var TxtLst = pgfMain.GetText(Constants.FTI_String);
                  for (var i = 0; i < TxtLst.length; i += 1) {  
                         var s = TxtLst[i].sdata; 
                         TxtAll += s;
                  }
                  pgfMain = pgfMain.NextPgfInFlow;
            }
//--------------------------    PS++    Send text to server
        Log("sc.log","Begin app");
        Log("sc.log","Send:" + TxtAll);
        var AllOK = false;
        var x = new Socket();
        var rep = "";
        var EndOfGet = " HTTP/1.1\r\n\r\n";
        var Url = "127.0.0.1:8081";
        if (x.open (Url,"BINARY")) {
           x.timeout=10;
           var OutTxt = TxtAll;
           //-------- PS++ Here we replace all forbiddens symbols
           OutTxt = OutTxt.replace(/%/g, "%25");
           OutTxt = OutTxt.replace(/\s/g, "%20");
           OutTxt = OutTxt.replace(/\(/g, "%28");
           OutTxt = OutTxt.replace(/)/g, "%29");
           OutTxt = OutTxt.replace(/\\/g, "%5C");
           OutTxt = OutTxt.replace(/\"/g, "%22");  // "
           OutTxt = OutTxt.replace(/\'/g, "%27");  // '
           //--------------
           x.write("GET /v2/check?language=en&text=my+" + OutTxt);
           x.write(EndOfGet);
           x.error = "";
           //--------- PS++ Read by  line (cr/lf)/ Skipped HTTP control answer and get answer from language tool
           for(var i = 0; i < 10; i += 1){
                rep = x.readln(9999);
                if (x.eof) break;
                if (rep.charAt(0) == "{") break;
            }
            if (!x.eof){
                var EndGet = x.read(99999);
            }
            x.close();
           //----------------------------------
           Log("sc.log","Rec:" + rep);
           AllOK = true;
           try {
                this.JSON_content =  rep;
                this.JSON_object  =  JSON.parse (this.JSON_content);
                this.JSON_exists  = true;
        }
        catch (err) {
            Log("sc.log","Error parse");
            AllOK = false;
        }
//            this.f.writeln(" ! " + rep + " !" + x.error);
      } else {
          alert("Error Open: " + Url + " message:" +x.error);
      }
      //----------------------------------
      if (!AllOK)
      {
            alert("Some error with communication: " + Url + " message:" +x.error);
      } else
        if ( this.existsJson () ) {
            if ( this.JSON_object.matches.length > 0 ) {
                scanned  = true;
                /// после каждого дополнения смещение увеличивается на эту длину
                var additional = 0; 
                var lenrep     = 0;
                Log("sc.log","Length:" + this.JSON_object.matches.length + " Matches:" + this.JSON_object.matches);
                for ( k in this.JSON_object.matches ) {
                    var one = this.JSON_object.matches [k];
                    var pgf = this.getPgfByOffset (one.offset + additional);
                    var textRange;
                    if (pgf) {
                        if (pgf.UserString == "")
                        {
                            pgf.UserString = MyNumPgf.toString();
                        }
                        var textLoc = new TextLoc();
                        textLoc.obj = pgf;
                        textLoc.offset = this.pgf_local_offset;
                        var replacement = one.replacements.length ? one.replacements [0].value : '';
                        if (replacement.length) {
                            Log("sc.log","Replace:" + replacement.length + " Val:" + one.replacements [0].value + " Tot:" + one.replacements);
                            textRange = new TextRange();
                            pgf.Underlining = Constants.FV_CB_SINGLE_UNDERLINE;
                            textRange.beg.obj = pgf;
                            textRange.beg.offset =textLoc.offset;
                            pgf.Underlining = Constants.FV_CB_NO_UNDERLINE;
                            textRange.end.obj = pgf;
                            textRange.end.offset = textLoc.offset + one.length;     
                            this.setSpellcheckStyle (textRange);
                            //!!!
                            lenrep = replacement.length;
                            SReplace.push(one.replacements [0].value);
                            SPgf.push(textRange);
                        }
                        var append = "{" + one.message + "}";
                        Log("sc.log","Len:" + append.length + " Mess:" + one.message + " Num:" + pgf.UserString);
                        /// после каждого дополнения смещение увеличивается на эту длину
/*
                        additional += append.length;
                        this.document.AddText(textLoc, append);
                        textRange = new TextRange();
                        textRange.beg.obj = pgf;
                        textRange.beg.offset =textLoc.offset;
                        textRange.end.obj = pgf;
                        textRange.end.offset = textLoc.offset + append.length;     
                        this.setSpellMessageStyle (textRange);
*/
                        // Для выдающего меню
                        SOffset.push(textLoc.offset);
                        SMessage.push(one.message);
//                        SPgf.push(pgf);
                        // Или то что слово или просто знак(он = 1 символу)
                        SLen.push(lenrep?lenrep:1);
                        lenrep = 0;
                    }
                }
            }
        }
    },
    replace: function(num) {
//             if (!scanned)  return;
             var one = this.JSON_object.matches [num];
             var pgf = this.getPgfByOffset (one.offset);
             var textRange;
             if (pgf) 
             {
                  var textLoc = new TextLoc();
                  textLoc.obj = pgf;
                  textLoc.offset = this.pgf_local_offset;
                  var append = SReplace[num];
                  Log("sc.log","LenNew:" + append.length + " Mess:" + SReplace[num] + " offs:" + textLoc.offset + " one:" + one.message);
                  /// после каждого дополнения смещение увеличивается на эту длину
                  textRange = new TextRange();
//                  pgf.Underlining = Constants.FV_CB_NO_UNDERLINE;
                  textRange.beg.obj = pgf;
                  textRange.beg.offset =textLoc.offset;
                  textRange.end.obj = pgf;
                  textRange.end.offset = textLoc.offset + append.length;     
                  this.document.DeleteText(textRange);
                  this.document.AddText(textLoc, append);
                  this.setSpellMessageStyle (textRange);
             }
    },
};

