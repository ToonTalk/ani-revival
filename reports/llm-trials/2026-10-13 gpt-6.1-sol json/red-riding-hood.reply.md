{
  "characters": [
    {
      "name": "red-riding-hood",
      "called": "Little Red Riding Hood",
      "pronoun": "she",
      "physical": ["pretty"],
      "personality": ["good", "friendly"],
      "movement": []
    },
    {
      "name": "grandmother",
      "called": "the grandmother",
      "pronoun": "she",
      "physical": ["physically-weak"],
      "personality": ["kind", "friendly"],
      "movement": []
    },
    {
      "name": "wolf",
      "called": "the wolf",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["mean", "evil"],
      "movement": []
    },
    {
      "name": "woodcutter",
      "called": "the woodcutter",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["strong", "good", "kind"],
      "movement": []
    }
  ],
  "main": "red-riding-hood",
  "relationships": [
    {
      "from": "red-riding-hood",
      "to": "grandmother",
      "how": ["loves"]
    },
    {
      "from": "grandmother",
      "to": "red-riding-hood",
      "how": ["loves", "is-protective-to"]
    },
    {
      "from": "wolf",
      "to": "red-riding-hood",
      "how": ["hates", "dominates"]
    },
    {
      "from": "red-riding-hood",
      "to": "wolf",
      "how": ["is-intolerant-of"]
    },
    {
      "from": "woodcutter",
      "to": "red-riding-hood",
      "how": ["is-helpful-towards", "is-protective-to"]
    },
    {
      "from": "red-riding-hood",
      "to": "woodcutter",
      "how": ["is-grateful-to"]
    }
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "Little Red Riding Hood and the Wolf",
      "mood": "normal",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {
            "kind": "establish-personality",
            "who": "red-riding-hood"
          },
          {
            "kind": "establish-personality",
            "who": "wolf"
          },
          {
            "kind": "establish-relationship",
            "from": "red-riding-hood",
            "to": "grandmother"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "red-riding-hood",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "positive",
                "amount": "low"
              }
            ]
          }
        ]
      ]
    },
    {
      "name": "kept-apart",
      "title": "The Wolf Blocks the Way",
      "mood": "(changes hopeful depressing)",
      "rhythm": "(changes fast slow)",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "wants",
            "who": "red-riding-hood",
            "meets": ["red-riding-hood", "grandmother"]
          }
        ],
        [
          {
            "kind": "prevents",
            "who": "wolf",
            "meets": ["red-riding-hood", "grandmother"]
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "red-riding-hood",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "negative",
                "amount": "high"
              }
            ]
          }
        ]
      ]
    },
    {
      "name": "rescue",
      "title": "The Woodcutter Chases the Wolf Away",
      "mood": "hopeful",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {
            "kind": "establish-personality",
            "who": "woodcutter"
          }
        ],
        [
          {
            "kind": "chases",
            "who": "woodcutter",
            "whom": "wolf"
          }
        ],
        [
          {
            "kind": "undoes",
            "who": "woodcutter",
            "scene": "kept-apart",
            "undone": {
              "kind": "prevents",
              "who": "wolf",
              "meets": ["red-riding-hood", "grandmother"]
            }
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "wolf",
            "feelings": [
              {
                "feeling": "pride",
                "sign": "negative",
                "amount": "high"
              }
            ]
          }
        ]
      ]
    },
    {
      "name": "together-again",
      "title": "Together Again",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "establish-personality",
            "who": "grandmother"
          }
        ],
        [
          {
            "kind": "meets",
            "who": "red-riding-hood",
            "whom": "grandmother"
          }
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "red-riding-hood",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "positive",
                "amount": "high"
              }
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "grandmother",
            "feelings": [
              {
                "feeling": "joy",
                "sign": "positive",
                "amount": "high"
              }
            ]
          }
        ]
      ]
    }
  ],
  "film": {
    "name": "little-red-riding-hood-film",
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
    "scenes": ["kept-apart", "rescue", "together-again"],
    "relationships": [
      {
        "from": "red-riding-hood",
        "to": "grandmother"
      },
      {
        "from": "wolf",
        "to": "red-riding-hood"
      },
      {
        "from": "woodcutter",
        "to": "red-riding-hood"
      }
    ]
  }
}