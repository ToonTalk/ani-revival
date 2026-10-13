{
  "characters": [
    {
      "name": "goldilocks",
      "called": "Goldilocks",
      "pronoun": "she",
      "physical": ["pretty"],
      "personality": ["determined", "unfriendly"],
      "movement": []
    },
    {
      "name": "father-bear",
      "called": "the father bear",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["strong", "mean"],
      "movement": []
    },
    {
      "name": "mother-bear",
      "called": "the mother bear",
      "pronoun": "she",
      "physical": ["pretty"],
      "personality": ["kind"],
      "movement": []
    },
    {
      "name": "baby-bear",
      "called": "the baby bear",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["shy"],
      "movement": []
    }
  ],
  "main": "goldilocks",
  "relationships": [
    {"from": "father-bear", "to": "goldilocks", "how": ["hates"]},
    {"from": "goldilocks", "to": "father-bear", "how": ["is-impolite-to"]}
  ],
  "scenes": [
    {
      "name": "discovery",
      "title": "Goldilocks Is Found",
      "mood": "anticipatory",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "goldilocks"},
          {"kind": "establish-relationship", "from": "father-bear", "to": "goldilocks"},
          {"kind": "establish-relationship", "from": "goldilocks", "to": "father-bear"},
          {"kind": "meets", "who": "father-bear", "whom": "goldilocks"}
        ]
      ]
    },
    {
      "name": "the-bears-arrive",
      "title": "The Bears Come Home",
      "mood": "anticipatory",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "mother-bear"},
          {"kind": "establish-personality", "who": "baby-bear"},
          {"kind": "meets", "who": "mother-bear", "whom": "goldilocks"},
          {"kind": "meets", "who": "baby-bear", "whom": "goldilocks"}
        ]
      ]
    },
    {
      "name": "chased-away",
      "title": "The Father Bear Chases Goldilocks",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "father-bear"},
          {"kind": "chases", "who": "father-bear", "whom": "goldilocks"}
        ],
        [
          {"kind": "establish-emotional-state", "who": "baby-bear", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "goldilocks", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]}
        ]
      ]
    }
  ],
  "film": {
    "name": "goldilocks-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "medium",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["chased-away", "the-bears-arrive"],
    "relationships": [
      {"from": "goldilocks", "to": "father-bear"},
      {"from": "father-bear", "to": "goldilocks"}
    ]
  }
}