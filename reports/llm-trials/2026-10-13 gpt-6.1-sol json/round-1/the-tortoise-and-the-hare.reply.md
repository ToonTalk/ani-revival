{
  "characters": [
    {
      "name": "tortoise",
      "called": "the tortoise",
      "pronoun": "they",
      "physical": ["physically-weak"],
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
      "how": ["hates", "dominates", "is-impolite-to"]
    }
  ],
  "scenes": [
    {
      "name": "boasting",
      "title": "The Boastful Hare",
      "mood": "normal",
      "rhythm": "normal",
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
      "title": "The Tortoise Is Pushed Around",
      "mood": "depressing",
      "rhythm": "normal",
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
      "name": "tortoise-triumph",
      "title": "The Tortoise's Triumph",
      "mood": "joyous",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "meets", "who": "tortoise", "whom": "hare"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          },
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
    "scenes": ["pushed-around", "tortoise-triumph"],
    "relationships": [
      {"from": "hare", "to": "tortoise"}
    ]
  }
}