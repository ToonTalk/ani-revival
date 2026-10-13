{
  "characters": [
    {
      "name": "lion",
      "called": "the lion",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["strong", "generous"],
      "movement": []
    },
    {
      "name": "mouse",
      "called": "the mouse",
      "pronoun": "she",
      "physical": ["physically-weak"],
      "personality": ["shy", "weak", "kind"],
      "movement": []
    }
  ],
  "main": "lion",
  "relationships": [
    {
      "from": "lion",
      "to": "mouse",
      "how": ["dominates"]
    },
    {
      "from": "mouse",
      "to": "lion",
      "how": ["is-grateful-to", "is-helpful-towards"]
    }
  ],
  "scenes": [
    {
      "name": "the-capture",
      "title": "The Lion Catches the Mouse",
      "mood": "anticipatory",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "lion"},
          {"kind": "establish-personality", "who": "mouse"}
        ],
        [
          {"kind": "chases", "who": "lion", "whom": "mouse"}
        ],
        [
          {"kind": "establish-relationship", "from": "lion", "to": "mouse"}
        ]
      ]
    },
    {
      "name": "mercy",
      "title": "The Lion Lets Her Go",
      "mood": "hopeful",
      "rhythm": "slow",
      "length": "short",
      "steps": [
        [
          {
            "kind": "undoes",
            "who": "lion",
            "scene": "the-capture",
            "undone": {"kind": "chases", "who": "lion", "whom": "mouse"}
          },
          {
            "kind": "change-relationship",
            "who": "lion",
            "whom": "mouse",
            "from": ["dominates"],
            "to": ["is-helpful-towards", "is-polite-to"],
            "causedBy": ""
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [{"feeling": "pride", "sign": "positive", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "mouse",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "medium"}]
          }
        ]
      ]
    },
    {
      "name": "the-lion-trapped",
      "title": "The Mouse Finds the Trapped Lion",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "change-physical",
            "who": "lion",
            "from": ["physically-strong", "powerful"],
            "to": ["physically-weak"],
            "causedBy": ""
          },
          {
            "kind": "change-personality",
            "who": "mouse",
            "from": ["shy", "weak"],
            "to": ["determined", "strong"],
            "causedBy": ""
          }
        ],
        [
          {"kind": "meets", "who": "mouse", "whom": "lion"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "the-rescue",
      "title": "The Brave Mouse Helps the Lion",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "mouse"}
        ],
        [
          {"kind": "accompanys", "who": "mouse", "whom": "lion"},
          {
            "kind": "change-physical",
            "who": "lion",
            "from": ["physically-weak"],
            "to": ["physically-strong", "powerful"],
            "causedBy": "mouse"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          }
        ]
      ]
    },
    {
      "name": "friends",
      "title": "The Lion and the Mouse Become Friends",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-relationship", "from": "lion", "to": "mouse"}
        ],
        [
          {"kind": "accompanys", "who": "lion", "whom": "mouse"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}]
          },
          {
            "kind": "establish-emotional-state",
            "who": "mouse",
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
    "name": "the-lion-and-the-mouse-film",
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
    "scenes": ["mercy", "the-rescue", "friends"],
    "relationships": [
      {"from": "lion", "to": "mouse"},
      {"from": "mouse", "to": "lion"}
    ]
  }
}