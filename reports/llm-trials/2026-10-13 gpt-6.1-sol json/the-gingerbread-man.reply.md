{
  "characters": [
    {
      "name": "gingerbread-man",
      "called": "the gingerbread man",
      "pronoun": "he",
      "physical": ["pretty", "physically-weak"],
      "personality": ["brazen", "forward"],
      "movement": ["graceful"]
    },
    {
      "name": "pursuers",
      "called": "the pursuers",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["determined", "stubborn"],
      "movement": []
    },
    {
      "name": "fox",
      "called": "the fox",
      "pronoun": "he",
      "physical": ["powerful"],
      "personality": ["evil", "selfish"],
      "movement": ["graceful"]
    }
  ],
  "main": "gingerbread-man",
  "relationships": [
    {
      "from": "gingerbread-man",
      "to": "pursuers",
      "how": ["is-impolite-to"]
    },
    {
      "from": "pursuers",
      "to": "gingerbread-man",
      "how": ["is-intolerant-of"]
    },
    {
      "from": "fox",
      "to": "gingerbread-man",
      "how": ["hates", "is-polite-to"]
    },
    {
      "from": "gingerbread-man",
      "to": "fox",
      "how": ["is-polite-to"]
    }
  ],
  "scenes": [
    {
      "name": "cheeky-gingerbread-man",
      "title": "The Cheeky Gingerbread Man",
      "mood": "joyous",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "gingerbread-man"},
          {"kind": "establish-personality", "who": "pursuers"}
        ],
        [
          {"kind": "establish-relationship", "from": "gingerbread-man", "to": "pursuers"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gingerbread-man",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "running-away",
      "title": "Running Away",
      "mood": "joyous",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "pursuers", "whom": "gingerbread-man"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "pursuers",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "gingerbread-man",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "false-friend",
      "title": "A False Friend",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "meets", "who": "fox", "whom": "gingerbread-man"}
        ],
        [
          {"kind": "accompanys", "who": "fox", "whom": "gingerbread-man"}
        ],
        [
          {
            "kind": "change-relationship",
            "who": "gingerbread-man",
            "whom": "fox",
            "from": ["is-polite-to"],
            "to": ["is-grateful-to"],
            "causedBy": "fox"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gingerbread-man",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "fox-catches-him",
      "title": "The Fox Catches Him",
      "mood": "depressing",
      "rhythm": "(changes fast slow)",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "fox", "whom": "gingerbread-man"}
        ],
        [
          {"kind": "hurts", "who": "fox", "whom": "gingerbread-man"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "fox",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "gingerbread-man",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "gingerbread-man-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "medium",
    "rhythm": "high",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "medium",
    "energy": "high"
  },
  "focus": {
    "scenes": ["false-friend", "fox-catches-him"],
    "relationships": [
      {"from": "gingerbread-man", "to": "fox"},
      {"from": "fox", "to": "gingerbread-man"}
    ]
  }
}