{
  "characters": [
    {
      "name": "goldilocks",
      "called": "Goldilocks",
      "pronoun": "she",
      "physical": ["pretty"],
      "personality": ["brazen", "forward", "selfish"],
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
      "personality": ["kind", "friendly"],
      "movement": []
    },
    {
      "name": "baby-bear",
      "called": "the baby bear",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["shy", "good"],
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
    },
    {
      "from": "baby-bear",
      "to": "mother-bear",
      "how": ["loves"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "Goldilocks and the Father Bear",
      "mood": "normal",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "goldilocks"},
          {"kind": "establish-personality", "who": "father-bear"}
        ],
        [
          {
            "kind": "establish-relationship",
            "from": "goldilocks",
            "to": "father-bear"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "goldilocks",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "low"}
            ]
          }
        ]
      ]
    },
    {
      "name": "bears-find-goldilocks",
      "title": "The Bears Find Goldilocks",
      "mood": "anticipatory",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "mother-bear"},
          {"kind": "establish-personality", "who": "baby-bear"}
        ],
        [
          {"kind": "accompanys", "who": "mother-bear", "whom": "baby-bear"}
        ],
        [
          {"kind": "meets", "who": "father-bear", "whom": "goldilocks"}
        ]
      ]
    },
    {
      "name": "chased-away",
      "title": "Goldilocks Is Chased Away",
      "mood": "depressing",
      "rhythm": "(changes fast slow)",
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
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "baby-bear",
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
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "goldilocks-film",
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
    "scenes": ["bears-find-goldilocks", "chased-away"],
    "relationships": [
      {"from": "goldilocks", "to": "father-bear"},
      {"from": "father-bear", "to": "goldilocks"}
    ]
  }
}