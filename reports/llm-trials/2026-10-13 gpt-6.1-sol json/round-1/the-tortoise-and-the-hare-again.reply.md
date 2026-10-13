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
      "physical": ["elegant"],
      "personality": ["brazen", "lazy", "selfish"],
      "movement": ["graceful"]
    }
  ],
  "main": "tortoise",
  "relationships": [
    {
      "from": "hare",
      "to": "tortoise",
      "how": ["is-impolite-to"]
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
      "rhythm": "normal",
      "length": "medium",
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
      "title": "The Race",
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
              {"feeling": "pride", "sign": "positive", "amount": "high"}
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
      "name": "rest-and-persistence",
      "title": "The Hare Rests and the Tortoise Persists",
      "mood": "hopeful",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "hare"},
          {"kind": "establish-personality", "who": "tortoise"}
        ],
        [
          {"kind": "meets", "who": "tortoise", "whom": "hare"}
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
          {"kind": "establish-relationship", "from": "tortoise", "to": "hare"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "the-tortoise-and-the-hare-film",
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
    "scenes": ["rest-and-persistence", "victory"],
    "relationships": [
      {"from": "tortoise", "to": "hare"},
      {"from": "hare", "to": "tortoise"}
    ]
  }
}