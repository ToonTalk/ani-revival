{
  "characters": [
    {
      "name": "pig-one",
      "called": "the first pig",
      "pronoun": "they",
      "physical": ["physically-weak"],
      "personality": ["friendly", "good"],
      "movement": []
    },
    {
      "name": "pig-two",
      "called": "the second pig",
      "pronoun": "they",
      "physical": ["physically-weak"],
      "personality": ["friendly", "good"],
      "movement": []
    },
    {
      "name": "pig-three",
      "called": "the third pig",
      "pronoun": "they",
      "physical": ["physically-weak"],
      "personality": ["friendly", "good"],
      "movement": []
    },
    {
      "name": "wolf",
      "called": "the wolf",
      "pronoun": "he",
      "physical": ["physically-strong"],
      "personality": ["mean", "bad", "evil"],
      "movement": []
    }
  ],
  "main": "pig-one",
  "relationships": [
    {"from": "pig-one", "to": "pig-two", "how": ["is-helpful-towards"]},
    {"from": "pig-two", "to": "pig-one", "how": ["is-helpful-towards"]},
    {"from": "pig-one", "to": "pig-three", "how": ["is-helpful-towards"]},
    {"from": "pig-three", "to": "pig-one", "how": ["is-helpful-towards"]},
    {"from": "pig-two", "to": "pig-three", "how": ["is-helpful-towards"]},
    {"from": "pig-three", "to": "pig-two", "how": ["is-helpful-towards"]},
    {"from": "wolf", "to": "pig-one", "how": ["hates"]},
    {"from": "pig-one", "to": "wolf", "how": ["is-intolerant-of"]},
    {"from": "pig-two", "to": "wolf", "how": ["is-intolerant-of"]},
    {"from": "pig-three", "to": "wolf", "how": ["is-intolerant-of"]}
  ],
  "scenes": [
    {
      "name": "friends-and-wolf",
      "title": "Friends and the Wolf",
      "mood": "hopeful",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "pig-one"},
          {"kind": "establish-personality", "who": "pig-two"},
          {"kind": "establish-personality", "who": "pig-three"},
          {"kind": "establish-personality", "who": "wolf"}
        ],
        [
          {"kind": "establish-relationship", "from": "pig-one", "to": "pig-two"},
          {"kind": "establish-relationship", "from": "pig-two", "to": "pig-one"},
          {"kind": "establish-relationship", "from": "wolf", "to": "pig-one"},
          {"kind": "establish-relationship", "from": "pig-one", "to": "wolf"}
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
          {"kind": "chases", "who": "wolf", "whom": "pig-one"},
          {"kind": "accompanys", "who": "pig-one", "whom": "pig-two"},
          {"kind": "accompanys", "who": "pig-two", "whom": "pig-three"}
        ],
        [
          {"kind": "establish-emotional-state", "who": "pig-one", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "wolf", "feelings": [{"feeling": "joy", "sign": "positive", "amount": "medium"}]}
        ]
      ]
    },
    {
      "name": "the-wolf-is-kept-out",
      "title": "The Wolf Is Kept Out",
      "mood": "anticipatory",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "prevents", "who": "pig-one", "meets": ["wolf", "pig-one"]},
          {"kind": "accompanys", "who": "pig-one", "whom": "pig-two"},
          {"kind": "accompanys", "who": "pig-two", "whom": "pig-three"}
        ],
        [
          {"kind": "establish-emotional-state", "who": "wolf", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "pig-one", "feelings": [{"feeling": "joy", "sign": "positive", "amount": "medium"}]}
        ]
      ]
    },
    {
      "name": "the-pigs-triumph",
      "title": "The Pigs' Triumph",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-emotional-state", "who": "pig-one", "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}, {"feeling": "pride", "sign": "positive", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "pig-two", "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}, {"feeling": "pride", "sign": "positive", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "pig-three", "feelings": [{"feeling": "joy", "sign": "positive", "amount": "high"}, {"feeling": "pride", "sign": "positive", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "wolf", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]}
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
    "energy": "high"
  },
  "focus": {
    "scenes": ["the-chase", "the-wolf-is-kept-out", "the-pigs-triumph"],
    "relationships": [
      {"from": "pig-one", "to": "pig-two"},
      {"from": "wolf", "to": "pig-one"}
    ]
  }
}