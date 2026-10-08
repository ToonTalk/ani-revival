
:tctype sail,wholine 1
:DDTSYM BYERUN/ -1
..dirfn1/ 1'cdate
..dirfn1+1/ 1'down
:GMSGS KEN /R /N /D *
:IF N :EXISTS KEN;KEN MAIL
>(
:NO MAIL

)
:e mm rmail