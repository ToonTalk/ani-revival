{
  "characters": [
    {
      "name": "shepherd-boy",
      "called": "the shepherd boy",
      "pronoun": "he",
      "physical": ["physically-weak"],
      "personality": ["hard-working", "brazen"],
      "movement": []
    },
    {
      "name": "villagers",
      "called": "the villagers",
      "pronoun": "they",
      "physical": ["physically-weak"],
      "personality": ["unfriendly"],
      "movement": []
    },
    {
      "name": "wolf",
      "called": "the wolf",
      "pronoun": "he",
      "physical": ["ugly", "physically-strong"],
      "personality": ["mean", "evil", "strong"],
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
      "how": ["is-intolerant-of"]
    },
    {
      "from": "wolf",
      "to": "sheep",
      "how": ["hates"]
    },
    {
      "from": "sheep",
      "to": "wolf",
      "how": ["is-intolerant-of"]
    }
  ],
  "scenes": [
    {
      "name": "the-trick",
      "title": "The Trick",
      "mood": "normal",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "shepherd-boy"},
          {"kind": "establish-personality", "who": "villagers"},
          {"kind": "establish-relationship", "from": "villagers", "to": "shepherd-boy"}
        ],
        [
          {"kind": "chases", "who": "shepherd-boy", "whom": "villagers"}
        ]
      ]
    },
    {
      "name": "again-and-again",
      "title": "Again and Again",
      "mood": "normal",
      "rhythm": "fast",
      "length": "medium",
      "steps": [
        [
          {"kind": "chases", "who": "shepherd-boy", "whom": "villagers"}
        ],
        [
          {"kind": "establish-emotional-state", "who": "shepherd-boy", "feelings": [{"feeling": "joy", "sign": "positive", "amount": "medium"}]},
          {"kind": "establish-emotional-state", "who": "villagers", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]}
        ]
      ]
    },
    {
      "name": "the-real-wolf",
      "title": "The Real Wolf",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "wolf"},
          {"kind": "chases", "who": "wolf", "whom": "sheep"}
        ],
        [
          {"kind": "establish-emotional-state", "who": "shepherd-boy", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]},
          {"kind": "establish-emotional-state", "who": "sheep", "feelings": [{"feeling": "joy", "sign": "negative", "amount": "high"}]}
        ]
      ]
    }
  ],
  "film": {
    "name": "shepherd-boy-and-wolf-film",
    "variety": "medium",
    "complexity": "low",
    "originality": "medium",
    "rhythm": "high",
    "coherence": "high",
    "obviousness": "medium",
    "flashiness": "low",
    "energy": "high"
  },
  "focus": {
    "scenes": ["again-and-again", "the-real-wolf"],
    "relationships": [
      {"from": "shepherd-boy", "to": "villagers"},
      {"from": "villagers", "to": "shepherd-boy"},
      {"from": "wolf", "to": "sheep"}
    ]
  }
}