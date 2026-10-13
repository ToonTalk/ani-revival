{
  "characters": [
    {
      "name": "lion",
      "called": "the lion",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["strong"],
      "movement": []
    },
    {
      "name": "mouse",
      "called": "the mouse",
      "pronoun": "she",
      "physical": ["physically-weak"],
      "personality": ["shy", "kind"],
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
      "how": ["is-grateful-to"]
    }
  ],
  "scenes": [
    {
      "name": "caught",
      "title": "The Lion Catches the Mouse",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "lion"},
          {"kind": "establish-personality", "who": "mouse"}
        ],
        [
          {"kind": "establish-relationship", "from": "lion", "to": "mouse"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "mouse",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"}
            ]
          }
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
            "kind": "change-relationship",
            "who": "lion",
            "whom": "mouse",
            "from": ["dominates"],
            "to": ["is-generous-towards"],
            "causedBy": ""
          },
          {
            "kind": "undoes",
            "who": "lion",
            "scene": "caught",
            "undone": {
              "kind": "establish-relationship",
              "from": "lion",
              "to": "mouse"
            }
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "mouse",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "trapped",
      "title": "The Lion Needs Help",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          }
        ],
        [
          {"kind": "meets", "who": "mouse", "whom": "lion"}
        ],
        [
          {
            "kind": "change-personality",
            "who": "mouse",
            "from": ["shy"],
            "to": ["determined", "strong"],
            "causedBy": ""
          }
        ]
      ]
    },
    {
      "name": "rescue",
      "title": "The Brave Mouse Frees the Lion",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "mouse"}
        ],
        [
          {
            "kind": "undoes",
            "who": "mouse",
            "scene": "trapped",
            "undone": {
              "kind": "establish-emotional-state",
              "who": "lion",
              "feelings": [
                {"feeling": "joy", "sign": "negative", "amount": "high"},
                {"feeling": "pride", "sign": "negative", "amount": "high"}
              ]
            }
          }
        ],
        [
          {
            "kind": "change-relationship",
            "who": "lion",
            "whom": "mouse",
            "from": ["is-generous-towards"],
            "to": ["is-grateful-to", "is-helpful-towards"],
            "causedBy": "mouse"
          },
          {
            "kind": "change-relationship",
            "who": "mouse",
            "whom": "lion",
            "from": ["is-grateful-to"],
            "to": ["is-helpful-towards"],
            "causedBy": ""
          }
        ]
      ]
    },
    {
      "name": "friends",
      "title": "Two Happy Friends",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-relationship", "from": "lion", "to": "mouse"}
        ],
        [
          {"kind": "accompanys", "who": "mouse", "whom": "lion"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "lion",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "mouse",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "medium"}
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "lion-and-mouse-film",
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
    "scenes": ["mercy", "rescue", "friends"],
    "relationships": [
      {"from": "lion", "to": "mouse"},
      {"from": "mouse", "to": "lion"}
    ]
  }
}