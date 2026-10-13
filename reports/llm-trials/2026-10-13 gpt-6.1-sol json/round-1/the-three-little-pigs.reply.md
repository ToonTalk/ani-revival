{
  "characters": [
    {
      "name": "first-pig",
      "called": "the first little pig",
      "pronoun": "they",
      "physical": ["pretty", "physically-weak"],
      "personality": ["friendly", "good", "determined"],
      "movement": []
    },
    {
      "name": "second-pig",
      "called": "the second little pig",
      "pronoun": "they",
      "physical": ["pretty", "physically-weak"],
      "personality": ["friendly", "good", "determined"],
      "movement": []
    },
    {
      "name": "third-pig",
      "called": "the third little pig",
      "pronoun": "they",
      "physical": ["pretty", "physically-weak"],
      "personality": ["friendly", "good", "determined"],
      "movement": []
    },
    {
      "name": "wolf",
      "called": "the wolf",
      "pronoun": "he",
      "physical": ["physically-strong", "powerful"],
      "personality": ["mean", "selfish", "stubborn"],
      "movement": []
    }
  ],
  "main": "first-pig",
  "relationships": [
    {"from": "first-pig", "to": "second-pig", "how": ["is-helpful-towards", "is-protective-to"]},
    {"from": "second-pig", "to": "first-pig", "how": ["is-helpful-towards", "is-protective-to"]},
    {"from": "first-pig", "to": "third-pig", "how": ["is-helpful-towards", "is-protective-to"]},
    {"from": "third-pig", "to": "first-pig", "how": ["is-helpful-towards", "is-protective-to"]},
    {"from": "second-pig", "to": "third-pig", "how": ["is-helpful-towards", "is-protective-to"]},
    {"from": "third-pig", "to": "second-pig", "how": ["is-helpful-towards", "is-protective-to"]},
    {"from": "wolf", "to": "first-pig", "how": ["hates"]},
    {"from": "wolf", "to": "second-pig", "how": ["hates"]},
    {"from": "wolf", "to": "third-pig", "how": ["hates"]}
  ],
  "scenes": [
    {
      "name": "friends-and-wolf",
      "title": "The Friends and the Wolf",
      "mood": "(changes hopeful depressing)",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "first-pig"},
          {"kind": "establish-relationship", "from": "first-pig", "to": "second-pig"}
        ],
        [
          {"kind": "establish-personality", "who": "wolf"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "first-pig",
            "feelings": [{"feeling": "joy", "sign": "negative", "amount": "low"}]
          }
        ]
      ]
    },
    {
      "name": "the-chase",
      "title": "The Chase",
      "mood": "depressing",
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
      "title": "Keeping the Wolf Out",
      "mood": "hopeful",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "prevents", "who": "first-pig", "meets": ["wolf", "second-pig"]},
          {"kind": "prevents", "who": "second-pig", "meets": ["wolf", "third-pig"]}
        ],
        [
          {"kind": "pushes", "who": "third-pig", "whom": "wolf"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "wolf",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
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
          {"kind": "accompanys", "who": "second-pig", "whom": "third-pig"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "first-pig",
            "feelings": [
              {"feeling": "joy", "sign": "positive", "amount": "high"},
              {"feeling": "pride", "sign": "positive", "amount": "high"}
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
    }
  ],
  "film": {
    "name": "three-little-pigs-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "medium",
    "rhythm": "high",
    "coherence": "high",
    "obviousness": "high",
    "flashiness": "low",
    "energy": "medium"
  },
  "focus": {
    "scenes": ["keeping-the-wolf-out", "happy-together"],
    "relationships": [
      {"from": "first-pig", "to": "second-pig"},
      {"from": "first-pig", "to": "third-pig"},
      {"from": "wolf", "to": "first-pig"}
    ]
  }
}