
KEN@MIT-AI 03/26/78 05:51:24
should think about a script actor that can remember the state of the planning to date by
copying the actors-to-run-next and their things-to-do-next
   
KEN@MIT-AI 10/13/78 06:53:31
see why text managed to call xorwindow in color
  
KEN@MIT-AI 10/14/78 20:41:53
some ideas for director:
import some of the action > stuff 
should be able to say something like
(sequence: (ask foo gradually forward 200)
	   (ask foo wait 2.5 seconds)
	   (ask foo right 90))
and also
(and ...)
or maybe
(ask foo sequence: (gradually forward 200) ...)
since can always (ask so-and-so to ...)

should write a dump movie which asks each of the actors-to-run-next and the move
 and scrreen to save
save should be smartered up so that if compiled actor then uses (define-or-add-to ...)

   
KEN@MIT-AI 10/17/78 22:37:59
see if I should be using something other than startdisplay so often
ie initialize-all-of-it or something since I often dont want the turtle shown for example
(or the outline)
 
KEN@MIT-AI 10/17/78 22:35:53
interpolation from star to circle (angle 10) failed --- check it out
   
KEN@MIT-AI 10/27/78 02:25:18
bugs in instant relating to control-l especially
   
JERRYB@MIT-AI 11/08/78 04:22:04
something wrong with saving away uninterned interpolation functions with smart comile
   
KEN@MIT-AI 11/18/78 07:36:24
think about predicates being named by only the message pattern and being shared when
possible
  

JONL@MIT-MC 11/13/78 21:18:43 Re: BREAK during a macro-expansion
To: KEN at MIT-AI
CC: (BUG COMPLR) at MIT-MC
The normal state of the complr is to have TTY output off (^W is T),
and I guess the BREAK functions does  not reset it.  I wrote a debuggin
break kfunction for myself which rebound the obarray and readtable and ^W.

 
KEN@MIT-AI 11/15/78 04:36:50
well just a little bit left


 KEN@MIT-AI 11/08/78 07:31:41
a few things left to do

5) restore some version of define-plain-lisp-macro


12) think more about multiple extensions and whether some way of holding on to them better
isn't needed (also need to have remove-method-named ... be a method too)

