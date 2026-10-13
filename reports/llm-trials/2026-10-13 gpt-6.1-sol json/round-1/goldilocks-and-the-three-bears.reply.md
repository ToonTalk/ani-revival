{
  "characters": [
    {
      "name": "goldilocks",
      "called": "Goldilocks",
      "pronoun": "she",
      "physical": ["pretty"],
      "personality": ["brazen", "forward", "unfriendly"],
      "movement": []
    },
    {
      "name": "father-bear",
      "called": "the father bear",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["strong", "determined"],
      "movement": []
    },
    {
      "name": "mother-bear",
      "called": "the mother bear",
      "pronoun": "she",
      "physical": ["physically-strong"],
      "personality": ["kind", "good"],
      "movement": []
    },
    {
      "name": "baby-bear",
      "called": "the baby bear",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["shy"],
      "movement": []
    }
  ],
  "main": "goldilocks",
  "relationships": [
    {
      "from": "goldilocks",
      "to": "father-bear",
      "how": ["is-impolite-to"]
    },
    {
      "from": "father-bear",
      "to": "goldilocks",
      "how": ["is-intolerant-of"]
    },
    {
      "from": "mother-bear",
      "to": "baby-bear",
      "how": ["is-protective-to"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "Goldilocks and the Bears",
      "mood": "normal",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "goldilocks"},
          {"kind": "establish-personality", "who": "father-bear"},
          {"kind": "establish-personality", "who": "baby-bear"}
        ],
        [
          {
            "kind": "establish-relationship",
            "from": "goldilocks",
            "to": "father-bear"
          }
        ]
      ]
    },
    {
      "name": "discovery",
      "title": "The Bears Find Goldilocks",
      "mood": "depressing",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "mother-bear"}
        ],
        [
          {"kind": "meets", "who": "father-bear", "whom": "goldilocks"},
          {"kind": "accompanys", "who": "mother-bear", "whom": "baby-bear"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "baby-bear",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "chased-away",
      "title": "Goldilocks Is Chased Away",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "father-bear", "whom": "goldilocks"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "father-bear",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "goldilocks",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "baby-bear",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "goldilocks-film",
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
    "scenes": ["discovery", "chased-away"],
    "relationships": [
      {"from": "goldilocks", "to": "father-bear"},
      {"from": "father-bear", "to": "goldilocks"}
    ]
  }
}