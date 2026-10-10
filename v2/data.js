/* 221B Case Room: case data for "The Blue Duchess" */
window.CASE = {
  title: "The Blue Duchess",
  number: "221B / 1887",
  summary: "A 42-carat Kashmir sapphire vanished from Lady Ashworth's study safe between 9:00 and 9:30 pm. No forced entry. Five guests, five alibis, eight pieces of evidence.",
  culprit: "julian",
  method: "door",
  proof: "roll",

  suspects: [
    { id:"hayes", name:"Col. Reginald Hayes", short:"Hayes", role:"Retired army officer", age:61, relation:"Old friend of the host",
      room:"billiard", motive:"Gambling debts at his club",
      alibi:"I was in the billiard room from nine until the alarm. Barnaby the butler racked every frame for me.",
      exonerate:["f_hayes_seen","f_ash_early"],
      rebuttal:"Colonel Hayes was at the billiard table the whole half hour. The butler and two guests saw him there, and the cigar ash fell before the window was shut at 8:40.",
      questions:[
        { q:"Where were you between nine and half past?", a:"At the billiard table, Inspector. Barnaby racked every frame and the Pryce brothers took three guineas off me. Ask any of them.", fact:"f_hayes_seen" },
        { q:"You smoke Havanas, I believe?", a:"Every evening. I stepped to the study window for air at half past eight, before the stone was locked away. Barnaby shut the window behind me." },
        { q:"I hear you have debts.", a:"Had. Settled last month, every penny. My club secretary will show you the ledger." }
      ] },
    { id:"marsh", name:"Miss Evelyn Marsh", short:"Marsh", role:"Governess to the household", age:29, relation:"Employed by the host",
      room:"library", motive:"Given notice of dismissal",
      alibi:"I was reading alone in the library. I heard nothing until the commotion.",
      exonerate:["f_book_lent","f_footman"],
      rebuttal:"Miss Marsh never crossed the hall: the footman watched the study door all evening. And the gemstone book was one she had lent to Lady Ashworth herself.",
      questions:[
        { q:"Can anyone confirm you were in the library?", a:"No one, I'm afraid. But the library opens only onto the main hall. Thomas the footman was at his post there all evening." },
        { q:"Your library book was found open on the study desk.", a:"I lent it to Lady Ashworth on Tuesday. She wished to read about her own sapphire. You will find her note inside.", fact:"f_book_lent" },
        { q:"You were dismissed, weren't you?", a:"I leave at Christmas, with a good reference. A theft would ruin me for life. I am not so foolish." }
      ] },
    { id:"lang", name:"Mr. Victor Lang", short:"Lang", role:"Jeweller, Hatton Garden", age:47, relation:"Valued the sapphire last spring",
      room:"cab", motive:"A rival dealer offered a fortune for the stone",
      alibi:"I left the party at a quarter to nine. A hansom took me straight home to Hampstead.",
      exonerate:["f_lang_cab","f_lang_dust","f_lang_ticket"],
      rebuttal:"Mr. Lang was in a hansom to Hampstead before the sapphire was last seen at 9:00. His loupe had lain under the desk for days.",
      questions:[
        { q:"When did you leave the house?", a:"A quarter to nine. The cabman, Doyle, drove me to Hampstead and my night porter let me in at twenty to ten. Both will swear to it.", fact:"f_lang_cab" },
        { q:"Your loupe was under the study desk.", a:"So that is where it went! I lost it last Thursday when I valued the stone. I wrote to Lady Ashworth asking after it." },
        { q:"A rival offered you a fortune for the sapphire.", a:"Offers are not thefts, Inspector. I told him the stone was not for sale. I tell everyone that." }
      ] },
    { id:"pell", name:"Dr. Arthur Pell", short:"Pell", role:"Family physician", age:54, relation:"Guest of the host",
      room:"conservatory", motive:"His medical practice is near bankrupt",
      alibi:"At ten past nine a guest fainted in the conservatory. I tended her until the alarm was raised.",
      exonerate:["f_pell_patient","f_pell_mud","f_pell_watch"],
      rebuttal:"Dr. Pell knelt beside Mrs. Pryce from 9:10 in front of two witnesses. The conservatory soil in the study was dry and hours old.",
      questions:[
        { q:"Where were you during the theft?", a:"In the conservatory with Mrs. Pryce, who fainted at ten past nine. Her husband and I did not leave her side until the bell.", fact:"f_pell_patient" },
        { q:"There was conservatory soil on the study carpet.", a:"Then ask the gardener. He was in and out with plants all afternoon. I have not set foot in the study tonight." },
        { q:"Your practice is in trouble.", a:"It is. That is no secret, and it is no crime. I would not steal from a woman I have treated for twenty years." }
      ] },
    { id:"julian", name:"Julian Ashworth", short:"Julian", role:"The host's nephew", age:26, relation:"Heir to the Ashworth estate",
      room:"drawing", motive:"A new will, to be signed Monday, cuts him out",
      alibi:"I was playing the piano in the drawing room all evening. Everyone heard me.",
      contradict:["f_roll_30","f_door"],
      questions:[
        { q:"Did anyone see you at the piano?", a:"See me? Well, no. I had the door closed. But they all heard me, didn't they? Half an hour of it.", fact:"f_julian_unseen" },
        { q:"What did you play?", a:"Oh, this and that. Chopin, mostly. A medley. I don't recall the order." },
        { q:"Who knows the safe combination?", a:"Aunt Clara, naturally. And, well, I do. Family, you see. But so what?", fact:"f_combo" }
      ] }
  ],

  clues: [
    { id:"ash", no:"01", title:"Havana cigar ash", img:"cigar", where:"Study windowsill", truth:"hayes",
      text:"Fresh cigar ash on the study windowsill. Only one guest smokes Havanas.",
      detail:"The ash is a long, unbroken cone. It fell while the window stood open, and the butler shut and latched that window at 8:40.", fact:"f_ash_early" },
    { id:"book", no:"02", title:"A borrowed book", img:"book", where:"Study desk", truth:"marsh",
      text:"'A Treatise on Precious Stones' lies open on the desk. It carries a library stamp.",
      detail:"A slip of notepaper inside reads 'With thanks for the loan, C.A.' in Lady Ashworth's hand.", fact:"f_book_lent" },
    { id:"loupe", no:"03", title:"Jeweller's loupe", img:"loupe", where:"Under the desk", truth:"lang",
      text:"A brass 10x loupe under the desk, engraved with the initials V.L.",
      detail:"A fine film of dust coats the lens and the brass. It has lain here for days, not hours.", fact:"f_lang_dust" },
    { id:"mud", no:"04", title:"Conservatory soil", img:"mud", where:"Study carpet", truth:"pell",
      text:"Red soil on the study carpet. It matches the conservatory beds.",
      detail:"The soil is dry and cracked right through. It was trodden in hours before the theft, not tonight.", fact:"f_pell_mud" },
    { id:"roll", no:"05", title:"Pianola roll receipt", img:"piano", where:"Coat in the cloakroom", truth:"julian",
      text:"A music shop receipt for a player-piano roll, found in a gentleman's coat.",
      detail:"Stamped: 'Grand Medley, continuous play, 30 minutes.' Paid for at 10:15 this morning. The drawing room piano is a pianola: it plays itself.", fact:"f_roll_30" },
    { id:"thread", no:"06", title:"Crimson silk thread", img:"latch", where:"Study side of the tapestry", truth:"julian",
      text:"A strand of crimson silk snagged on an old iron latch hidden behind the study tapestry.",
      detail:"The latch was oiled today and opens without a sound. The silk matches the crimson cravat worn by one guest tonight, and it is torn fresh.", fact:"f_thread" },
    { id:"watch", no:"07", title:"Stopped pocket watch", img:"watch", where:"Hall table, outside the study", truth:"pell",
      text:"A gentleman's watch with a cracked glass, stopped at 9:14, left beside the study door.",
      detail:"Engraved 'A.P., from grateful patients'. Grit from the conservatory tiles is lodged in the crack. The footman picked it up in the conservatory doorway at 9:20 and set it here.", fact:"f_pell_watch" },
    { id:"ticket", no:"08", title:"Hansom cab ticket", img:"cab", where:"Front steps", truth:"lang",
      text:"A cab ticket, No. 4471, trodden into the mud by the front steps.",
      detail:"Punched 8:47 pm, Ashworth House to Hampstead. The cab rank's book shows No. 4471 never came back before ten.", fact:"f_lang_ticket" }
  ],

  rooms: [
    { id:"library", name:"Library", x:10, y:10, w:120, h:100, img:"book",
      text:"Opens only onto the main hall. Miss Marsh claims she read here alone." },
    { id:"study", name:"Study", x:140, y:10, w:120, h:100, img:"sapphire", crime:true,
      text:"The scene of the crime. The safe was opened with its combination. One window, latched at 8:40. Two doors: one to the hall, and one more besides." },
    { id:"drawing", name:"Drawing Room", x:270, y:10, w:120, h:100, img:"drawing",
      text:"Home to the pianola. Behind a tapestry, a connecting door leads straight into the study. Julian claims he played here, door closed.", fact:"f_door" },
    { id:"hall", name:"Main Hall", x:10, y:118, w:380, h:36, img:"house",
      text:"Thomas the footman stood here from 8:30 to 9:45. He swears no one entered the study by the hall door.", fact:"f_footman" },
    { id:"billiard", name:"Billiard Room", x:10, y:162, w:180, h:88, img:"billiard",
      text:"Colonel Hayes, the butler and the Pryce brothers played here all evening." },
    { id:"conservatory", name:"Conservatory", x:200, y:162, w:190, h:88, img:"conservatory",
      text:"Mrs. Pryce fainted here at 9:10. Dr. Pell and Mr. Pryce stayed with her." }
  ],

  witnesses: [
    { id:"host", name:"Lady Clara Ashworth", role:"Host and owner of the sapphire",
      says:"Only two people know the safe's combination: myself and my nephew Julian." },
    { id:"butler", name:"Barnaby", role:"Butler",
      says:"I saw the sapphire in the safe at nine o'clock and locked the study. I racked billiards for the Colonel until the alarm." }
  ],

  timeline: [
    { t:"8:30", d:"Lady Ashworth shows the Blue Duchess to her guests." },
    { t:"8:40", d:"Butler latches the study window." },
    { t:"8:45", d:"Mr. Lang leaves by hansom cab." },
    { t:"9:00", d:"Sapphire seen in the safe. Study locked.", key:true },
    { t:"9:00", d:"Piano music begins in the drawing room." },
    { t:"9:10", d:"Mrs. Pryce faints in the conservatory." },
    { t:"9:30", d:"Music stops. Safe found open, sapphire gone.", key:true }
  ],

  facts: {
    f_hayes_seen:"Hayes was seen at the billiard table throughout.",
    f_ash_early:"The cigar ash fell before the study window was latched at 8:40.",
    f_book_lent:"Miss Marsh had lent the gemstone book to Lady Ashworth.",
    f_footman:"The footman watched the study's hall door all evening. No one used it.",
    f_lang_cab:"Lang left at 8:45, before the sapphire was last seen.",
    f_lang_dust:"The loupe had lain under the desk for days.",
    f_pell_patient:"Dr. Pell never left the fainted guest's side.",
    f_pell_mud:"The soil in the study was hours old.",
    f_julian_unseen:"Nobody actually saw Julian at the piano.",
    f_combo:"Only Lady Ashworth and Julian know the safe combination.",
    f_roll_30:"Julian's pianola roll plays itself for exactly 30 minutes.",
    f_door:"A hidden connecting door joins the drawing room to the study.",
    f_thread:"Crimson silk from a cravat was torn on the hidden door's latch tonight.",
    f_pell_watch:"Pell's watch broke on the conservatory tiles at 9:14.",
    f_lang_ticket:"Lang's cab ticket was punched at 8:47 and the cab never returned."
  },

  methods: [
    { id:"hall", label:"Through the hall door", rebut:"The footman watched that door from 8:30 to 9:45. Nobody used it." },
    { id:"door", label:"Through the connecting door from the drawing room" },
    { id:"window", label:"In through the study window", rebut:"The butler latched the window at 8:40, and it was still latched when the theft was found." },
    { id:"force", label:"By forcing the safe", rebut:"The safe shows no damage. It was opened with the combination." }
  ],

  hints: [
    "Four alibis rest on what people saw. One rests only on what people heard.",
    "Study the floor plan. Which room has a second way into the study?",
    "Examine the receipt closely. How long does that roll play, and when did the music start and stop?"
  ],

  credits: [
    ["Suspect and witness portraits", "Cabinet-card photographs, 1860s–1880s, unidentified sitters (photographers incl. James Bragge, Alexander Tait). Public domain, via rawpixel.", "https://www.rawpixel.com/image/9888964/portrait-man-1880s-james-bragge"],
    ["Victoria Embankment in fog", "'Thick weather, Victoria Embankment'. Public domain, via rawpixel.", "https://www.rawpixel.com/image/13030119/image-paper-plant-person"],
    ["Victorian house", "[Victorian House], The Met. Public domain, via rawpixel.", "https://www.rawpixel.com/image/12837841/victorian-house"],
    ["Drawing room", "Interior Room (c. 1862), Viscountess Jocelyn. Public domain, via rawpixel.", "https://www.rawpixel.com/image/10044459/interior-room-c-1862-viscountess-jocelyn"],
    ["Billiard room", "The Billiard Room. Public domain, via rawpixel.", "https://www.rawpixel.com/image/9201887/the-billiard-room"],
    ["Conservatory", "Two young women, conservatory (1850s), Roger Fenton. Public domain, via rawpixel.", "https://www.rawpixel.com/image/9787093/two-young-women-conservatory-1850s-roger-fenton"],
    ["Evidence photographs", "Cigar, open book, magnifying glass, soil, piano keys, pocket watch and sapphire. CC0, via rawpixel.", "https://www.rawpixel.com/category/53/public-domain"],
    ["Door latch", "Door Latch (c. 1939), Fritz Boehmer, Index of American Design, National Gallery of Art. Public domain, via rawpixel.", "https://www.rawpixel.com/image/3369677/free-illustration-image-antique-architecture-art"],
    ["Hansom cab", "Whistler in a Hansom Cab, George du Maurier. Public domain, via rawpixel.", "https://www.rawpixel.com/image/8993358/whistler-hansom-cab-george-maurier"]
  ]
};
