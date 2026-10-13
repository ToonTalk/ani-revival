{
  "characters": [
    {
      "name": "shepherd-boy",
      "called": "the shepherd boy",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["brazen", "forward", "selfish"],
      "movement": []
    },
    {
      "name": "villagers",
      "called": "the villagers",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["hard-working", "kind", "stubborn"],
      "movement": []
    },
    {
      "name": "wolf",
      "called": "the wolf",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["mean", "determined"],
      "movement": []
    },
    {
      "name": "sheep",
      "called": "the sheep",
      "pronoun": "they",
      "physical": ["physically-weak"],
      "personality": ["shy", "weak"],
      "movement": []
    }
  ],
  "main": "shepherd-boy",
  "relationships": [
    {
      "from": "villagers",
      "to": "shepherd-boy",
      "how": ["is-helpful-towards"]
    },
    {
      "from": "shepherd-boy",
      "to": "villagers",
      "how": ["is-impolite-to"]
    },
    {
      "from": "wolf",
      "to": "sheep",
      "how": ["hates"]
    }
  ],
  "scenes": [
    {
      "name": "bored-shepherd",
      "title": "The Bored Shepherd",
      "mood": "normal",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "shepherd-boy"},
          {"kind": "establish-personality", "who": "villagers"}
        ],
        [
          {"kind": "establish-relationship", "from": "villagers", "to": "shepherd-boy"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "shepherd-boy",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "low"}
            ]
          }
        ]
      ]
    },
    {
      "name": "first-trick",
      "title": "The First Trick",
      "mood": "normal",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "meets", "who": "villagers", "whom": "shepherd-boy"}
        ],
        [
          {"kind": "establish-relationship", "from": "shepherd-boy", "to": "villagers"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "shepherd-boy",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "villagers",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "tricked-again",
      "title": "Tricked Again",
      "mood": "(changes hopeful depressing)",
      "rhythm": "(changes fast slow)",
      "length": "short",
      "steps": [
        [
          {"kind": "meets", "who": "villagers", "whom": "shepherd-boy"}
        ],
        [
          {
            "kind": "change-relationship",
            "who": "villagers",
            "whom": "shepherd-boy",
            "from": ["is-helpful-towards"],
            "to": ["is-intolerant-of"],
            "causedBy": "shepherd-boy"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "shepherd-boy",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "villagers",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "real-wolf",
      "title": "The Real Wolf",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "meets", "who": "wolf", "whom": "shepherd-boy"}
        ],
        [
          {"kind": "wants", "who": "shepherd-boy", "meets": ["shepherd-boy", "villagers"]}
        ],
        [
          {"kind": "establish-relationship", "from": "villagers", "to": "shepherd-boy"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "shepherd-boy",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "sheep-chased",
      "title": "The Sheep Are Chased",
      "mood": "depressing",
      "rhythm": "(changes fast slow)",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "wolf", "whom": "sheep"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "sheep",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "shepherd-boy",
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
    "name": "boy-who-cried-wolf-film",
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
    "scenes": ["tricked-again", "real-wolf", "sheep-chased"],
    "relationships": [
      {"from": "shepherd-boy", "to": "villagers"},
      {"from": "villagers", "to": "shepherd-boy"},
      {"from": "wolf", "to": "sheep"}
    ]
  }
}