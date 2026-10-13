{
  "characters": [
    {
      "name": "tortoise",
      "called": "the tortoise",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["hard-working", "determined"],
      "movement": []
    },
    {
      "name": "hare",
      "called": "the hare",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["mean", "brazen", "lazy"],
      "movement": []
    }
  ],
  "main": "tortoise",
  "relationships": [
    {
      "from": "hare",
      "to": "tortoise",
      "how": ["dominates", "is-impolite-to"]
    },
    {
      "from": "tortoise",
      "to": "hare",
      "how": ["is-tolerant-of"]
    }
  ],
  "scenes": [
    {
      "name": "boasting",
      "title": "The Boastful Hare",
      "mood": "normal",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "tortoise"},
          {"kind": "establish-personality", "who": "hare"}
        ],
        [
          {"kind": "establish-relationship", "from": "hare", "to": "tortoise"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "pushed-around",
      "title": "The Determined Tortoise",
      "mood": "depressing",
      "rhythm": "(changes fast slow)",
      "length": "short",
      "steps": [
        [
          {"kind": "pushes", "who": "hare", "whom": "tortoise"}
        ],
        [
          {"kind": "establish-personality", "who": "tortoise"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "pride-and-shame",
      "title": "Pride and Shame",
      "mood": "joyous",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "pride", "sign": "negative", "amount": "high"},
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "hare-and-tortoise-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "low",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["pushed-around", "pride-and-shame"],
    "relationships": [
      {"from": "tortoise", "to": "hare"},
      {"from": "hare", "to": "tortoise"}
    ]
  }
}