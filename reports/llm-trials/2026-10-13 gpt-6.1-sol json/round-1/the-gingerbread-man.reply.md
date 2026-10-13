{
  "characters": [
    {
      "name": "gingerbread-man",
      "called": "the gingerbread man",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["brazen", "forward"],
      "movement": ["graceful"]
    },
    {
      "name": "pursuers",
      "called": "the pursuers",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["determined", "stubborn"],
      "movement": ["clumsy"]
    },
    {
      "name": "fox",
      "called": "the fox",
      "pronoun": "he",
      "physical": ["powerful"],
      "personality": ["friendly", "selfish"],
      "movement": ["graceful"]
    }
  ],
  "main": "gingerbread-man",
  "relationships": [
    {
      "from": "pursuers",
      "to": "gingerbread-man",
      "how": ["is-intolerant-of"]
    },
    {
      "from": "fox",
      "to": "gingerbread-man",
      "how": ["is-polite-to"]
    },
    {
      "from": "gingerbread-man",
      "to": "fox",
      "how": ["is-polite-to"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "The Cheeky Gingerbread Man",
      "mood": "joyous",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "gingerbread-man"},
          {"kind": "establish-personality", "who": "pursuers"},
          {
            "kind": "establish-relationship",
            "from": "pursuers",
            "to": "gingerbread-man"
          }
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
      "name": "the-chase",
      "title": "Everyone Chases Him",
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
      "title": "The Fox Seems Friendly",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "fox"},
          {"kind": "meets", "who": "fox", "whom": "gingerbread-man"}
        ],
        [
          {
            "kind": "establish-relationship",
            "from": "fox",
            "to": "gingerbread-man"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gingerbread-man",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "betrayal",
      "title": "The Fox Turns Against Him",
      "mood": "(changes hopeful depressing)",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {
            "kind": "change-personality",
            "who": "fox",
            "from": ["friendly"],
            "to": ["bad", "determined"],
            "causedBy": ""
          },
          {
            "kind": "change-relationship",
            "who": "fox",
            "whom": "gingerbread-man",
            "from": ["is-polite-to"],
            "to": ["dominates"],
            "causedBy": ""
          }
        ],
        [
          {"kind": "chases", "who": "fox", "whom": "gingerbread-man"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "gingerbread-man",
            "feelings": [
              {"feeling": "pride", "sign": "negative", "amount": "high"},
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "caught",
      "title": "The Fox Catches Him",
      "mood": "depressing",
      "rhythm": "(changes fast slow)",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "fox"}
        ],
        [
          {"kind": "pushes", "who": "fox", "whom": "gingerbread-man"}
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
    "energy": "medium"
  },
  "focus": {
    "scenes": ["false-friend", "betrayal", "caught"],
    "relationships": [
      {"from": "gingerbread-man", "to": "fox"},
      {"from": "fox", "to": "gingerbread-man"}
    ]
  }
}