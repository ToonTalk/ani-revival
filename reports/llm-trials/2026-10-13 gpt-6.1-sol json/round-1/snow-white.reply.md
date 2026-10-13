{
  "characters": [
    {
      "name": "snow-white",
      "called": "Snow White",
      "pronoun": "she",
      "physical": ["beautiful"],
      "personality": ["good", "kind"],
      "movement": ["graceful"]
    },
    {
      "name": "queen",
      "called": "the queen",
      "pronoun": "she",
      "physical": ["beautiful", "powerful"],
      "personality": ["evil", "selfish"],
      "movement": []
    },
    {
      "name": "dwarfs",
      "called": "the dwarfs",
      "pronoun": "they",
      "physical": ["physically-strong"],
      "personality": ["good", "kind"],
      "movement": []
    },
    {
      "name": "prince",
      "called": "the prince",
      "pronoun": "he",
      "physical": ["beautiful"],
      "personality": ["good", "kind"],
      "movement": []
    }
  ],
  "main": "snow-white",
  "relationships": [
    {
      "from": "queen",
      "to": "snow-white",
      "how": ["hates"]
    },
    {
      "from": "dwarfs",
      "to": "snow-white",
      "how": ["is-protective-to", "is-helpful-towards"]
    },
    {
      "from": "snow-white",
      "to": "dwarfs",
      "how": ["is-grateful-to"]
    },
    {
      "from": "snow-white",
      "to": "prince",
      "how": ["loves"]
    },
    {
      "from": "prince",
      "to": "snow-white",
      "how": ["loves"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "Snow White and the Queen",
      "mood": "normal",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "snow-white"},
          {"kind": "establish-personality", "who": "queen"}
        ],
        [
          {"kind": "establish-relationship", "from": "queen", "to": "snow-white"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "queen",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "chased-away",
      "title": "The Queen Chases Snow White",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "queen", "whom": "snow-white"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "queen",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "snow-white",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "protected",
      "title": "The Kind Dwarfs",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "dwarfs"}
        ],
        [
          {"kind": "meets", "who": "snow-white", "whom": "dwarfs"}
        ],
        [
          {"kind": "establish-relationship", "from": "dwarfs", "to": "snow-white"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "snow-white",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "prince-arrives",
      "title": "The Prince Arrives",
      "mood": "(and joyous anticipatory)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "prince"}
        ],
        [
          {"kind": "meets", "who": "prince", "whom": "snow-white"}
        ],
        [
          {"kind": "establish-relationship", "from": "prince", "to": "snow-white"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "snow-white",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "happy-together",
      "title": "Happy Together",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "alone", "who": "snow-white", "whom": "prince"}
        ],
        [
          {"kind": "getting-it-on", "who": "snow-white", "whom": "prince"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "snow-white",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "prince",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "snow-white-film",
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
    "scenes": ["chased-away", "protected", "happy-together"],
    "relationships": [
      {"from": "snow-white", "to": "prince"},
      {"from": "queen", "to": "snow-white"},
      {"from": "dwarfs", "to": "snow-white"}
    ]
  }
}