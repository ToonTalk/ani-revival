{
  "characters": [
    {
      "name": "tortoise",
      "called": "the tortoise",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["hard-working", "determined"],
      "movement": []
    },
    {
      "name": "hare",
      "called": "the hare",
      "pronoun": "he",
      "physical": ["elegant"],
      "personality": ["mean", "brazen", "lazy"],
      "movement": ["graceful"]
    }
  ],
  "main": "tortoise",
  "relationships": [
    {
      "from": "hare",
      "to": "tortoise",
      "how": ["hates", "is-impolite-to"]
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
      "title": "The Hare Makes Fun of the Tortoise",
      "mood": "normal",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "tortoise"},
          {"kind": "establish-personality", "who": "hare"},
          {"kind": "establish-relationship", "from": "hare", "to": "tortoise"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "low"}
            ]
          }
        ]
      ]
    },
    {
      "name": "race",
      "title": "The Race Begins",
      "mood": "anticipatory",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "tortoise", "whom": "hare"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"},
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "low"}
            ]
          }
        ]
      ]
    },
    {
      "name": "steady-progress",
      "title": "The Hare Rests and the Tortoise Keeps Going",
      "mood": "hopeful",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "low"},
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          },
          {"kind": "establish-personality", "who": "tortoise"}
        ],
        [
          {"kind": "chases", "who": "tortoise", "whom": "hare"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "victory",
      "title": "The Tortoise Wins",
      "mood": "joyous",
      "rhythm": "normal",
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
              {"feeling": "pride", "sign": "negative", "amount": "high"},
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"},
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "the-hare-and-the-tortoise-film",
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
    "scenes": ["steady-progress", "victory"],
    "relationships": [
      {"from": "tortoise", "to": "hare"},
      {"from": "hare", "to": "tortoise"}
    ]
  }
}