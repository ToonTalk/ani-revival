{
  "characters": [
    {
      "name": "crow",
      "called": "the crow",
      "pronoun": "she",
      "physical": ["pretty"],
      "personality": ["forward"],
      "movement": []
    },
    {
      "name": "fox",
      "called": "the fox",
      "pronoun": "he",
      "physical": ["elegant"],
      "personality": ["selfish", "determined"],
      "movement": ["graceful"]
    }
  ],
  "main": "crow",
  "relationships": [
    {
      "from": "fox",
      "to": "crow",
      "how": ["is-polite-to"]
    }
  ],
  "scenes": [
    {
      "name": "proud-crow",
      "title": "The Proud Crow",
      "mood": "normal",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "crow"},
          {"kind": "establish-personality", "who": "fox"},
          {"kind": "establish-relationship", "from": "fox", "to": "crow"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "crow",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "flattery",
      "title": "The Fox's Flattery",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "meets", "who": "fox", "whom": "crow"}
        ],
        [
          {"kind": "establish-relationship", "from": "fox", "to": "crow"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "crow",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "tricked",
      "title": "The Crow Is Tricked",
      "mood": "depressing",
      "rhythm": "(changes fast slow)",
      "length": "short",
      "steps": [
        [
          {"kind": "pushes", "who": "fox", "whom": "crow"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "fox",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "crow",
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
    "name": "the-crow-and-the-fox-film",
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
    "scenes": ["flattery", "tricked"],
    "relationships": [
      {"from": "fox", "to": "crow"}
    ]
  }
}