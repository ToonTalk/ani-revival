{
  "characters": [
    {
      "name": "hare",
      "called": "the hare",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["brazen", "lazy", "mean"],
      "movement": []
    },
    {
      "name": "tortoise",
      "called": "the tortoise",
      "pronoun": "he",
      "physical": ["strong"],
      "personality": ["hard-working", "determined"],
      "movement": []
    }
  ],
  "main": "tortoise",
  "relationships": [
    {
      "from": "hare",
      "to": "tortoise",
      "how": ["dominates", "hates"]
    },
    {
      "from": "tortoise",
      "to": "hare",
      "how": ["is-tolerant-of"]
    }
  ],
  "scenes": [
    {
      "name": "the-taunt",
      "title": "The Taunt",
      "mood": "depressing",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "tortoise"},
          {"kind": "establish-personality", "who": "hare"},
          {"kind": "establish-relationship", "from": "hare", "to": "tortoise"},
          {"kind": "establish-relationship", "from": "tortoise", "to": "hare"},
          {"kind": "pushes", "who": "hare", "whom": "tortoise"}
        ]
      ]
    },
    {
      "name": "the-bullying",
      "title": "Pushed Around",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [{"kind": "pushes", "who": "hare", "whom": "tortoise"}],
        [
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "the-finish",
      "title": "The Tortoise Triumphs",
      "mood": "(very joyous)",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
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
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "hare-and-tortoise-film",
    "variety": "low",
    "complexity": "low",
    "originality": "medium",
    "rhythm": "medium",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["the-bullying", "the-finish"],
    "relationships": [
      {"from": "tortoise", "to": "hare"},
      {"from": "hare", "to": "tortoise"}
    ]
  }
}