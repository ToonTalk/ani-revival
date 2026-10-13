{
  "characters": [
    {
      "name": "first-pig",
      "called": "the first pig",
      "pronoun": "they",
      "physical": ["pretty"],
      "personality": ["friendly", "good", "determined"],
      "movement": []
    },
    {
      "name": "second-pig",
      "called": "the second pig",
      "pronoun": "they",
      "physical": ["pretty"],
      "personality": ["friendly", "good", "determined"],
      "movement": []
    },
    {
      "name": "third-pig",
      "called": "the third pig",
      "pronoun": "they",
      "physical": ["pretty"],
      "personality": ["friendly", "good", "determined"],
      "movement": []
    },
    {
      "name": "wolf",
      "called": "the wolf",
      "pronoun": "he",
      "physical": ["physically-strong", "ugly"],
      "personality": ["mean", "stubborn"],
      "movement": []
    }
  ],
  "main": "first-pig",
  "relationships": [
    {"from": "first-pig", "to": "second-pig", "how": ["is-helpful-towards"]},
    {"from": "second-pig", "to": "first-pig", "how": ["is-helpful-towards"]},
    {"from": "first-pig", "to": "third-pig", "how": ["is-helpful-towards"]},
    {"from": "third-pig", "to": "first-pig", "how": ["is-helpful-towards"]},
    {"from": "second-pig", "to": "third-pig", "how": ["is-helpful-towards"]},
    {"from": "third-pig", "to": "second-pig", "how": ["is-helpful-towards"]},
    {"from": "wolf", "to": "first-pig", "how": ["hates"]},
    {"from": "wolf", "to": "second-pig", "how": ["hates"]},
    {"from": "wolf", "to": "third-pig", "how": ["hates"]},
    {"from": "first-pig", "to": "wolf", "how": ["is-intolerant-of"]},
    {"from": "second-pig", "to": "wolf", "how": ["is-intolerant-of"]},
    {"from": "third-pig", "to": "wolf", "how": ["is-intolerant-of"]}
  ],
  "scenes": [
    {
      "name": "introduction",
      "title": "The Pigs and the Wolf",
      "mood": "normal",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "first-pig"},
          {"kind": "establish-personality", "who": "wolf"},
          {"kind": "establish-relationship", "from": "wolf", "to": "first-pig"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "first-pig",
            "feelings": [{"feeling": "joy", "sign": "positive", "amount": "medium"}]
          }
        ]
      ]
    },
    {
      "name": "friends-together",
      "title": "Three Cheerful Friends",
      "mood": "joyous",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "second-pig"},
          {"kind": "establish-personality", "who": "third-pig"}
        ],
        [
          {"kind": "accompanys", "who": "second-pig", "whom": "first-pig"},
          {"kind": "accompanys", "who": "third-pig", "whom": "first-pig"}
        ]
      ]
    },
    {
      "name": "the-chase",
      "title": "The Wolf Chases the Pigs",
      "mood": "(changes hopeful depressing)",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "chases", "who": "wolf", "whom": "first-pig"},
          {"kind": "accompanys", "who": "second-pig", "whom": "first-pig"},
          {"kind": "accompanys", "who": "third-pig", "whom": "first-pig"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "first-pig",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]
          }
        ]
      ]
    },
    {
      "name": "keeping-the-wolf-out",
      "title": "The Pigs Keep the Wolf Out",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "prevents", "who": "first-pig", "meets": ["wolf", "first-pig"]}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "wolf",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "second-pig",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          },
          {
            "kind": "establish-emotional-state",
            "who": "third-pig",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "safe-together",
      "title": "The Wolf Gives Up",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {
            "kind": "undoes",
            "who": "wolf",
            "scene": "the-chase",
            "undone": {"kind": "chases", "who": "wolf", "whom": "first-pig"}
          }
        ],
        [
          {"kind": "accompanys", "who": "first-pig", "whom": "second-pig"},
          {"kind": "accompanys", "who": "first-pig", "whom": "third-pig"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "first-pig",
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
    "name": "three-little-pigs-film",
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
    "scenes": ["the-chase", "keeping-the-wolf-out", "safe-together"],
    "relationships": [
      {"from": "first-pig", "to": "wolf"},
      {"from": "first-pig", "to": "second-pig"},
      {"from": "first-pig", "to": "third-pig"}
    ]
  }
}