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
      "physical": ["physically-weak"],
      "personality": ["hard-working", "determined"],
      "movement": []
    }
  ],
  "main": "tortoise",
  "relationships": [
    {
      "from": "hare",
      "to": "tortoise",
      "how": ["hates"]
    },
    {
      "from": "tortoise",
      "to": "hare",
      "how": ["is-tolerant-of"]
    }
  ],
  "scenes": [
    {
      "name": "taunting",
      "title": "The Taunt",
      "mood": "normal",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "hare"},
          {"kind": "establish-personality", "who": "tortoise"},
          {"kind": "establish-relationship", "from": "hare", "to": "tortoise"},
          {"kind": "chases", "who": "hare", "whom": "tortoise"}
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
        [{"kind": "chases", "who": "tortoise", "whom": "hare"}],
        [
          {
            "kind": "establish-emotional-state",
            "who": "hare",
            "feelings": [{"feeling": "pride", "sign": "positive", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "tortoise",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "low"}]
          }
        ]
      ]
    },
    {
      "name": "finish",
      "title": "The Finish",
      "mood": "joyous",
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
    "scenes": ["race", "finish"],
    "relationships": [
      {"from": "tortoise", "to": "hare"},
      {"from": "hare", "to": "tortoise"}
    ]
  }
}