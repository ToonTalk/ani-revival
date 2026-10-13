{
  "characters": [
    {
      "name": "crow",
      "called": "the crow",
      "pronoun": "she",
      "physical": ["beautiful"],
      "personality": ["selfish"],
      "movement": []
    },
    {
      "name": "fox",
      "called": "the fox",
      "pronoun": "he",
      "physical": ["elegant"],
      "personality": ["selfish", "determined"],
      "movement": []
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
      "name": "the-proud-crow",
      "title": "The Proud Crow",
      "mood": "normal",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "crow"},
          {
            "kind": "establish-emotional-state",
            "who": "crow",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          },
          {"kind": "establish-personality", "who": "fox"},
          {"kind": "establish-relationship", "from": "fox", "to": "crow"}
        ]
      ]
    },
    {
      "name": "the-flattery",
      "title": "The Flattery",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "wants", "who": "fox", "meets": ["fox", "crow"]}
        ],
        [
          {"kind": "accompanys", "who": "fox", "whom": "crow"},
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
      "name": "the-fox-escapes",
      "title": "The Fox Escapes",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "crow", "whom": "fox"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "crow",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "fox",
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
    "name": "crow-and-fox-film",
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
    "scenes": ["the-flattery", "the-fox-escapes"],
    "relationships": [{"from": "fox", "to": "crow"}]
  }
}