/* ──────────────────────────────────────────────────────────────
   THE 221B CASE ROOM — Case file data
   Case No. 1894/06/21 — The Ashcombe Sapphire
   ────────────────────────────────────────────────────────────── */

window.CASE = {
  id: "ashcombe-sapphire",
  number: "No. 221-B / 94",
  title: "The Ashcombe Sapphire",
  subtitle: "Theft of the Tear of Kandy from Ravensworth House",
  date: "Midsummer Night, 21st June 1894",
  brief:
    "At the stroke of 10:52 the electric lamps of Ravensworth House failed for four minutes. " +
    "When light returned, the Tear of Kandy — a sapphire of forty-eight carats — had vanished from " +
    "its locked case in the Long Gallery. The glass was whole. The lock unforced. Five people had " +
    "reason, means or opportunity. Each has an alibi. One of them is lying.",
  facts: [
    "The display case takes a Chubb lever key. Only two exist.",
    "The Long Gallery is on the second floor; its windows were found latched from within.",
    "The fuse box stands in the service corridor directly behind the library.",
    "A back stair runs from that corridor to the Long Gallery."
  ],
  timeline: [
    { t: "4:30 pm", text: "Mr. Marlowe borrows the housekeeper's key “to check the fittings of the case.” He returns it within ten minutes." },
    { t: "8:00 pm", text: "At Lady Ashcombe's request, Miss Thorne arranges the sapphire on its velvet cushion in the Long Gallery." },
    { t: "10:15 pm", text: "Whist begins in the smoking room: Lord Percival, Colonel Hargreaves, Sir Edwin Cole and the Hon. Mr. Pryce." },
    { t: "10:40 pm", text: "Mrs. Pemberton faints in the conservatory. Dr. Vance carries her out through the garden doors for air." },
    { t: "10:45 pm", text: "Jennings the butler is summoned from the library to the kitchens for ice. He remains there until five past eleven." },
    { t: "10:52 pm", text: "The lamps fail throughout the house. The piano in the ballroom falls silent." },
    { t: "10:56 pm", text: "A footman replaces the fuse. Light returns. The piano resumes within the minute." },
    { t: "11:10 pm", text: "Lady Ashcombe enters the gallery to show the stone to a guest. The case is locked — and empty." }
  ],
  suspects: [
    {
      id: "percival",
      questions: [
        { q: "Why pawn your watch three days before the party?", a: "Because a gentleman's debts don't wait for a gentleman's convenience, sir. Attenborough's are discreet. I'd have redeemed it by Michaelmas." },
        { q: "Did you leave the whist table at all?", a: "Not once. Hargreaves deals like a tortoise and I was eleven pounds down — a man doesn't walk away from that, he digs in." },
        { q: "What did you do when the lights failed?", a: "Lit a cigar and kept playing. Pryce held the candle. You may ask all three of them, though I'd rather you didn't ask about the eleven pounds." },
      ],
      name: "Lord Percival Ashcombe",
      short: "Percival",
      role: "Brother of the late Lord Ashcombe",
      age: 44,
      traits: ["Gambler", "In debt", "Charming"],
      portrait: "percival",
      alibi: {
        quote: "I never left the whist table, sir. Ask Hargreaves — the brute took eleven pounds off me in the dark alone.",
        detail: "Claims to have been playing whist in the smoking room from a quarter past ten until after midnight.",
        witnesses: ["Colonel Hargreaves", "Sir Edwin Cole", "The Hon. Mr. Pryce"]
      },
      clueId: "c1",
      movements: [
        ["9:30 pm", "Seen in the ballroom, arguing quietly with his sister-in-law about money."],
        ["10:15 pm", "Sits down to whist in the smoking room."],
        ["10:52 pm", "In darkness, continues to play by the light of a cigar — according to the Colonel."],
        ["12:10 am", "Rises from the table, eleven pounds the poorer."]
      ],
      verdict: {
        guilty: false,
        text: "Motive, certainly — the pawn ticket proves the debts. But three gentlemen at the whist table swear he never rose, and the Colonel took eleven pounds from him during the blackout alone. The alibi holds."
      }
    },
    {
      id: "thorne",
      questions: [
        { q: "You handled the sapphire that evening?", a: "At eight o'clock, yes. Lady Ashcombe asked me to set it on its cushion — she trusts my eye for such things, if nothing else about me." },
        { q: "Could anyone have left the ballroom unseen in the dark?", a: "The dark lasted four minutes, Inspector. The gallery is two floors up by the main stair. One would have needed wings, or the back stair — and the back stair runs from the service corridor, not the ballroom." },
        { q: "Where were you at a quarter to eleven?", a: "Nine bars into a Chopin nocturne, with forty people pretending to listen. When the lamps failed I stopped mid-phrase. When they returned, I resumed. Several guests remarked on it." },
      ],
      name: "Miss Evangeline Thorne",
      short: "Evangeline",
      role: "Lady Ashcombe's paid companion & pianist",
      age: 27,
      traits: ["Observant", "Quiet", "Poor"],
      portrait: "thorne",
      alibi: {
        quote: "I was at the Broadwood, playing Chopin. The music stopped when the lights failed — I cannot play what I cannot see.",
        detail: "Claims to have been at the piano in the ballroom all evening, before forty guests.",
        witnesses: ["Some forty guests", "Lady Ashcombe"]
      },
      clueId: "c2",
      movements: [
        ["8:00 pm", "Arranges the sapphire on its cushion in the Long Gallery at Lady Ashcombe's request."],
        ["9:00 pm", "Takes her place at the piano in the ballroom."],
        ["10:52 pm", "The nocturne stops mid-phrase as the lamps fail."],
        ["10:57 pm", "Resumes playing within a minute of the light returning."]
      ],
      verdict: {
        guilty: false,
        text: "Forty guests watched her at the Broadwood until the dark, and heard her resume within the minute. The gallery is two floors up and a long corridor away. The thread? She dressed the cushion herself at eight o'clock. The alibi holds."
      }
    },
    {
      id: "marlowe",
      questions: [
        { q: "Why did you need the housekeeper's key that afternoon?", a: "The insurers require me to confirm the case fittings in person. Ten minutes, with Mrs. Finch watching the clock. I returned it the moment I was done." },
        { q: "Your valuation doubled the stone's worth. Why?", a: "The market for Ceylon sapphires has moved considerably since 1889. I stand by every figure I have ever put my name to." },
        { q: "Was Jennings with you the entire time?", a: "Of course. We were discussing the varnish on the Turner — he has surprising opinions on varnish. He may have stepped out for a moment… I was absorbed in the painting, I confess." },
      ],
      name: "Mr. Silas Marlowe",
      short: "Silas",
      role: "Jeweller & insurance appraiser for Lloyd's",
      age: 51,
      traits: ["Meticulous", "Ambitious", "Well-connected"],
      portrait: "marlowe",
      alibi: {
        quote: "I was in the library with Jennings, examining the Turner. We were discussing varnish when the lights went. Ask him.",
        detail: "Claims to have been in the library with the butler from half past ten until the alarm was raised.",
        witnesses: ["Jennings, the butler (until 10:45 pm)"]
      },
      clueId: "c3",
      movements: [
        ["4:30 pm", "Borrows the housekeeper's key to “check the fittings.” Returns it after ten minutes."],
        ["10:30 pm", "Retires to the library with Jennings to examine a Turner watercolour."],
        ["10:45 pm", "Jennings is called away to the kitchens. Marlowe remains — alone."],
        ["11:10 pm", "Is found in the library when the alarm is raised, the Turner in his hands."]
      ],
      verdict: {
        guilty: true,
        text: "The butler was in the kitchens fetching ice — Mrs. Finch's own words. From a quarter to eleven Mr. Marlowe was alone in the library, with a wax impression of a Chubb key in his waistcoat and the fuse box six paces away. He cut the lights, climbed the service stair, lifted the stone in the dark and relocked an empty case. A valuation at twice the worth — the insurers would pay handsomely for a jewel he already held."
      }
    },
    {
      id: "vance",
      questions: [
        { q: "How did mud come to be on your evening shoes?", a: "Mrs. Pemberton is not a small woman. I carried her through the conservatory doors onto the terrace and the quickest line crosses the flowerbed. I'd do it again." },
        { q: "Did you go anywhere near the gallery windows?", a: "The gallery is two floors above the terrace, Inspector. Unless you suspect me of climbing ivy in patent leather with a dowager under one arm." },
        { q: "Who can confirm your whereabouts in the dark?", a: "Mrs. Pemberton, once she came round, and her daughter, who never left her side. Also, I suspect, half the terrace — she was not quiet about her recovery." },
      ],
      name: "Dr. Hugo Vance",
      short: "Hugo",
      role: "The family physician",
      age: 38,
      traits: ["Practical", "Discreet", "Tired"],
      portrait: "vance",
      alibi: {
        quote: "I had my hands full of smelling salts and a very heavy dowager. Mrs. Pemberton fainted in the conservatory — I carried her out for air.",
        detail: "Claims to have been attending a fainted guest in the conservatory and on the terrace from twenty to eleven.",
        witnesses: ["Mrs. Pemberton", "Miss Pemberton"]
      },
      clueId: "c4",
      movements: [
        ["10:20 pm", "In the conservatory, discussing orchids with Mrs. Pemberton."],
        ["10:40 pm", "Mrs. Pemberton faints. He carries her out through the garden doors."],
        ["10:52 pm", "On the terrace, in the dark, with his patient and her daughter."],
        ["11:00 pm", "Returns Mrs. Pemberton indoors, shoes muddied from the flowerbed."]
      ],
      verdict: {
        guilty: false,
        text: "The mud is the conservatory's; he carried Mrs. Pemberton onto the terrace, and the flowerbed lies between. The gallery windows were latched from within — no one came or went that way. Two witnesses. The alibi holds."
      }
    },
    {
      id: "finch",
      questions: [
        { q: "You lent the only duplicate key to Mr. Marlowe?", a: "For ten minutes, with the insurers' letter in his hand and me counting every one of them. I have regretted it since the moment Lady Ashcombe screamed." },
        { q: "Why send for Jennings at a quarter to eleven?", a: "Because Cook had let the ice run short and there were forty covers for supper. Jennings knows the cellar. He stayed to help until past eleven — I'd not have let him go sooner." },
        { q: "Did you leave the kitchens at any point?", a: "Not for a breath. Mrs. Dalloway and both the girls will tell you so. Thirty years in this house, and you'd have me creeping about galleries in the dark?" },
      ],
      name: "Mrs. Cordelia Finch",
      short: "Cordelia",
      role: "Housekeeper of Ravensworth House",
      age: 59,
      traits: ["Loyal", "Exacting", "Thirty years' service"],
      portrait: "finch",
      alibi: {
        quote: "Forty covers and a cook in tears — I hadn't a moment to breathe, let alone go wandering the gallery.",
        detail: "Claims to have been in the kitchens overseeing supper service from ten o'clock until the alarm.",
        witnesses: ["Mrs. Dalloway, the cook", "Two kitchen maids", "Jennings, the butler (from 10:45 pm)"]
      },
      clueId: "c5",
      movements: [
        ["4:30 pm", "Lends her key to Mr. Marlowe, against her better judgment."],
        ["10:00 pm", "Takes command of the kitchens for supper service."],
        ["10:45 pm", "Sends for Jennings to fetch ice from the cellar — and keeps him."],
        ["11:10 pm", "Is still in the kitchens when the alarm is raised."]
      ],
      verdict: {
        guilty: false,
        text: "She lent the key, yes — and told you so herself. But the cook, two maids and, from a quarter to eleven, the butler place her among forty covers the entire evening. The alibi holds."
      }
    }
  ],
  clues: [
    {
      id: "c1",
      exhibit: "A",
      title: "A pawnbroker's ticket",
      summary: "Attenborough's of Fleet Street, dated three days ago. Found in a monogrammed overcoat.",
      detail:
        "A pledge ticket from Attenborough's, Fleet Street, dated the 18th of June, for a gold hunter watch against forty pounds. " +
        "It was found in the pocket of a gentleman's overcoat hanging in the cloakroom. The coat is monogrammed P. A.",
      suggests: "Someone at this party is short of money — badly enough to pawn an heirloom.",
      answer: "percival"
    },
    {
      id: "c2",
      exhibit: "B",
      title: "A thread of blue velvet",
      summary: "Identical to the display cushion. Caught in the clasp of a jet bracelet beneath the piano stool.",
      detail:
        "A single thread of sapphire-blue velvet, identical to that of the cushion on which the stone lay, " +
        "caught in the clasp of a lady's jet bracelet. The bracelet was found beneath the piano stool in the ballroom.",
      suggests: "Whoever wore this bracelet handled the cushion at some point — but when?",
      answer: "thorne"
    },
    {
      id: "c3",
      exhibit: "C",
      title: "The valuation",
      summary: "A Lloyd's certificate dated last week — naming the stone at twice its previous worth.",
      detail:
        "A valuation certificate lodged with Lloyd's on the 14th of June, naming the Tear of Kandy at twelve thousand pounds — " +
        "double the figure of the 1889 appraisal. The signatory also examined the display case in person on the afternoon of the party.",
      suggests: "If the stone is lost, the insurers pay twice over. Who profits from a generous number?",
      answer: "marlowe"
    },
    {
      id: "c4",
      exhibit: "D",
      title: "Garden mud",
      summary: "Fresh loam on patent evening shoes. Prints in the bed beneath the gallery windows.",
      detail:
        "Fresh loam on a pair of patent-leather evening shoes, size nine. A trail of matching prints runs through the flowerbed " +
        "beneath the Long Gallery windows, heading in the direction of the conservatory.",
      suggests: "Someone was outside in the dark. Was it a way in — or merely a way out?",
      answer: "vance"
    },
    {
      id: "c5",
      exhibit: "E",
      title: "The second key",
      summary: "Two Chubb keys exist. One never left Lady Ashcombe's wrist. The other hangs on a chatelaine.",
      detail:
        "The case is secured by a Chubb lever lock. Two keys exist. One was on Lady Ashcombe's wrist all evening. " +
        "The other hangs on the housekeeper's chatelaine — and, by her own admission, was out of her keeping for ten minutes that afternoon.",
      suggests: "The case was not forced. Whoever opened it had a key — or a copy of one.",
      answer: "finch"
    },
    {
      id: "c6",
      exhibit: "F",
      title: "Beeswax in the lock",
      summary: "A film of wax inside the Chubb lock. A cold stub of candle in the library wastepaper basket.",
      detail:
        "A thin film of beeswax inside the levers of the display case lock, and the cold stub of a candle in the wastepaper basket of the library. " +
        "Pressed into warm wax, a key gives up its shape in under a minute — and a copy can be cut in an afternoon.",
      suggests: "Someone copied a key. Who held one long enough to press it — and had the trade to use the impression?",
      answer: "marlowe"
    },
    {
      id: "c7",
      exhibit: "G",
      title: "The whist score sheet",
      summary: "Colonel Hargreaves's tally: four hands between half past ten and eleven, each initialled by all four players.",
      detail:
        "The Colonel's score sheet from the smoking room. Four hands dealt between half past ten and eleven o'clock, the stakes rising with each. " +
        "Every hand is initialled by all four players — the last of them, P. A., in a hand that wavers as if written by candlelight.",
      suggests: "A record kept minute by minute. It accuses one man of losing money — but of nothing else.",
      answer: "percival"
    }
  ]
};
