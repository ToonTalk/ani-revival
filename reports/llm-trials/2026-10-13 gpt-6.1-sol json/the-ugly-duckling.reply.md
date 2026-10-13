{
  "characters": [
    {
      "name": "duckling",
      "called": "the ugly duckling",
      "pronoun": "he",
      "physical": ["ugly", "physically-weak"],
      "personality": ["shy", "good"],
      "movement": []
    },
    {
      "name": "ducks",
      "called": "the other ducks",
      "pronoun": "they",
      "physical": ["pretty", "physically-strong"],
      "personality": ["mean", "unfriendly"],
      "movement": []
    },
    {
      "name": "swans",
      "called": "the swans",
      "pronoun": "they",
      "physical": ["beautiful", "elegant"],
      "personality": ["kind", "friendly"],
      "movement": ["graceful"]
    }
  ],
  "main": "duckling",
  "relationships": [
    {
      "from": "ducks",
      "to": "duckling",
      "how": ["hates", "is-impolite-to"]
    },
    {
      "from": "swans",
      "to": "duckling",
      "how": ["is-helpful-towards", "is-polite-to"]
    },
    {
      "from": "duckling",
      "to": "swans",
      "how": ["is-grateful-to", "is-polite-to"]
    }
  ],
  "scenes": [
    {
      "name": "unwelcome-duckling",
      "title": "The Unwelcome Duckling",
      "mood": "depressing",
      "rhythm": "normal",
      "length": "short",
      "steps": [
        [
          {"kind": "establish-personality", "who": "duckling"},
          {"kind": "establish-personality", "who": "ducks"}
        ],
        [
          {"kind": "establish-relationship", "from": "ducks", "to": "duckling"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "pushed-around",
      "title": "Pushed Around",
      "mood": "depressing",
      "rhythm": "fast",
      "length": "short",
      "steps": [
        [
          {"kind": "pushes", "who": "ducks", "whom": "duckling"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "high"}
            ]
          }
        ]
      ]
    },
    {
      "name": "lonely-winter",
      "title": "A Lonely Winter",
      "mood": "depressing",
      "rhythm": "slow",
      "length": "long",
      "steps": [
        [
          {"kind": "establish-personality", "who": "duckling"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
            "feelings": [
              {"feeling": "joy", "sign": "negative", "amount": "high"},
              {"feeling": "pride", "sign": "negative", "amount": "medium"}
            ]
          }
        ]
      ]
    },
    {
      "name": "spring-welcome",
      "title": "A Welcome in Spring",
      "mood": "(very joyous)",
      "rhythm": "normal",
      "length": "medium",
      "steps": [
        [
          {"kind": "establish-personality", "who": "swans"}
        ],
        [
          {"kind": "meets", "who": "duckling", "whom": "swans"}
        ],
        [
          {"kind": "establish-relationship", "from": "swans", "to": "duckling"}
        ],
        [
          {
            "kind": "establish-emotional-state",
            "who": "duckling",
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
    "name": "ugly-duckling-film",
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
    "scenes": ["lonely-winter", "spring-welcome"],
    "relationships": [
      {"from": "duckling", "to": "swans"},
      {"from": "swans", "to": "duckling"},
      {"from": "ducks", "to": "duckling"}
    ]
  }
}