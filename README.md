# languagetool-for-framemaker

## Setup:
1. Starting spellcheker server
2. Move work_one.jsx and sp_worker folde into the directory "startup" inside FrameMaker ( AppData/Roaming/Adobe/FrameMaker XX/startup).
   No other files should be there except these
3. Run ESTK (i.e toolkit, it's needed for the socket and some another functions)
4. Run FrameMaker

##  Work:
  In the menu SpellChecking we press Spell and waiting for the ending of the spell checking work.
After that we see underlined word parts and underlined whole words. If you point to them of mouse
pointer and press LEFT muse button, you see the window with variants to change (the top part of
the window) and the comments in the bottom parts of the window. If you press OK then the exchange
will be applied to the text. Cancel hides the window and nothing changes.
  Now underlined word parts and words with possible change variants have the red color. After the
change the color becomes green.

